/* The promo campaign the Android app shows on its home screen.

   GET is public and deliberately plain: no parameters, no cookies, nothing
   recorded about who asked. The app requests it on launch and should not need
   anyone's permission to do so. POST is admin-only.

   Pictures are kept here rather than in Cloud Storage, which needs a billing
   plan this project does not have. They arrive already resized and compressed
   by the browser, as data URLs, and each slide gets its own document: five
   pictures in one document would pass Firestore's one-megabyte limit and the
   whole campaign would fail to save at the fifth.

   Because a picture now travels inside the response rather than being fetched
   separately and cached by the image loader, the response carries an ETag and
   answers 304 to a phone that already has the current campaign. Without that,
   every launch would re-download every picture - which on a metered rural
   connection is the user paying for our banner, repeatedly. */
import { createHash } from 'node:crypto';

const COLLECTION = 'geo_snap_ads';

/* Settings the app reads alongside the slides.
 
   One document, one request: the app already fetches this on launch, so the
   switch that decides whether anybody is metered rides along rather than
   costing a second round trip from every phone in the country. */
const CONFIG = 'geo_snap_config';
const CONFIG_DOC = 'app';

/** More than five and the slot stops being a slot. */
const MAX_SLIDES = 5;

/**
 * Comfortably inside Firestore's 1 MiB document limit.
 *
 * Base64 is a third larger than the bytes it carries, and the document holds
 * a little else besides, so this leaves room rather than finding the ceiling
 * at the moment somebody publishes.
 */
const MAX_PICTURE_BYTES = 700_000;

/** Files we host, for a slide that points at one rather than carrying it. */
function hosted(url) {
  if (typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    return parsed.hostname === 'firebasestorage.googleapis.com'
      || parsed.hostname.endsWith('.firebasestorage.app')
      || parsed.hostname === 'storage.googleapis.com';
  } catch {
    return false;
  }
}

/**
 * Where a slide's tap may send somebody.
 *
 * https only, and never a data or intent URL: this is the one field that
 * reaches outside the app, so what can be written into it stays narrow.
 */
function destination(link) {
  if (typeof link !== 'string' || !link) return null;
  try {
    return new URL(link).protocol === 'https:' ? link : null;
  } catch {
    return null;
  }
}

/** A picture carried inside the campaign itself. */
function inlinePicture(url) {
  return typeof url === 'string'
    && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(url)
    && url.length <= MAX_PICTURE_BYTES;
}

function usable(url) {
  return hosted(url) || inlinePicture(url);
}

function clean(slides) {
  if (!Array.isArray(slides)) return [];
  return slides
    .filter((slide) => slide && usable(slide.url))
    .slice(0, MAX_SLIDES)
    .map((slide, order) => ({
      order,
      // Only a hosted file can be a video: a clip large enough to be worth
      // watching cannot fit in a document.
      type: slide.type === 'video' && hosted(slide.url) ? 'video' : 'image',
      url: slide.url,
      poster: usable(slide.poster) ? slide.poster : null,
      link: destination(slide.link),
      description: String(slide.description ?? '').slice(0, 200)
    }));
}

/** What the app reads: no ordering field, no bookkeeping. */
function forApp(slide) {
  return {
    type: slide.type,
    url: slide.url,
    poster: slide.poster ?? null,
    link: slide.link ?? null,
    description: slide.description ?? ''
  };
}

export default async function handler(request, response) {
  if (request.method === 'GET') {
    try {
      const { adminConfigured, adminDb } = await import('../server/firebase-admin.mjs');
      if (!adminConfigured()) {
        response.setHeader('Cache-Control', 'no-store');
        return response.status(503).json({
          error: 'FIREBASE_SERVICE_ACCOUNT is not set on this deployment, so the campaign '
            + 'cannot be read or saved.'
        });
      }

      const db = adminDb();
      const [snapshot, config] = await Promise.all([
        db.collection(COLLECTION).orderBy('order').limit(MAX_SLIDES).get(),
        db.collection(CONFIG).doc(CONFIG_DOC).get()
      ]);
      const slides = snapshot.docs.map((doc) => forApp(doc.data()));
      // Free until somebody decides otherwise, including before the document
      // exists at all. The generous reading is the safe one: the cost of being
      // wrong is some free use, not a paying user locked out.
      const allFree = config.exists ? config.data()?.allFree !== false : true;
      const body = JSON.stringify({ slides, allFree });
      const etag = `"${createHash('sha1').update(body).digest('hex')}"`;

      // Re-validated every time rather than held: a campaign changed in the
      // panel should reach phones at the next launch, not in five minutes.
      response.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      response.setHeader('ETag', etag);
      response.setHeader('Content-Type', 'application/json');

      const asked = request.headers['if-none-match'];
      if (asked && asked === etag) return response.status(304).end();
      return response.status(200).send(body);
    } catch (error) {
      response.setHeader('Cache-Control', 'no-store');
      return response.status(503).json({
        error: `The campaign could not be read: ${error?.message ?? 'unknown error'}`
      });
    }
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  response.setHeader('Cache-Control', 'no-store');
  try {
    const { requireAdmin } = await import('../server/admin-auth.mjs');
    const admin = await requireAdmin(request);

    const payload = typeof request.body === 'string'
      ? JSON.parse(request.body)
      : (request.body ?? {});
    const slides = clean(payload.slides);
    if (Array.isArray(payload.slides) && payload.slides.length && !slides.length) {
      return response.status(400).json({
        error: 'No usable slides. A picture must be chosen with the file button, and a video '
          + 'must be a Firebase Storage link.'
      });
    }

    const { adminDb } = await import('../server/firebase-admin.mjs');
    const db = adminDb();
    const collection = db.collection(COLLECTION);

    // Sent on its own, so saving slides never silently changes who is metered.
    if (typeof payload.allFree === 'boolean') {
      await db.collection(CONFIG).doc(CONFIG_DOC).set({
        allFree: payload.allFree,
        updatedAt: new Date().toISOString(),
        updatedBy: admin.email ?? null
      }, { merge: true });
      if (!Array.isArray(payload.slides)) {
        return response.status(200).json({ allFree: payload.allFree });
      }
    }

    // The whole campaign is replaced at once, so a publish cannot leave the
    // previous slide four behind a new three-slide campaign.
    const batch = db.batch();
    const existing = await collection.get();
    existing.docs.forEach((doc) => batch.delete(doc.ref));
    slides.forEach((slide) => {
      batch.set(collection.doc(`slide-${slide.order + 1}`), {
        ...slide,
        updatedAt: new Date().toISOString(),
        updatedBy: admin.email ?? null
      });
    });
    await batch.commit();

    return response.status(200).json({ slides: slides.map(forApp) });
  } catch (error) {
    return response.status(error.status || 500).json({
      error: error.message || 'The campaign could not be saved.'
    });
  }
}
