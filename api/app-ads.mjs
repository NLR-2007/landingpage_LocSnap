/* The promo campaign the Android app shows on its home screen.

   GET is public and deliberately plain: no parameters, no cookies, nothing
   recorded about who asked. The app sends an ordinary request for a public
   file, which is what lets it do so without asking anybody's permission.

   POST writes the campaign and is admin-only.

   The app keeps whatever it last received, so an outage here leaves the
   slides already on people's phones alone. The one thing that must never
   happen is answering "ok" with nothing in it when something does exist -
   that would be a working response carrying an empty campaign. So a read
   that fails is a 5xx, never an empty success. */
const COLLECTION = 'geo_snap_config';
const DOCUMENT = 'app_ads';

/** More than five and the slot stops being a slot. */
const MAX_SLIDES = 5;

/** Only files we host: a campaign must not be able to point the app anywhere. */
function allowed(url) {
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

function clean(slides) {
  if (!Array.isArray(slides)) return [];
  return slides
    .filter((slide) => slide && allowed(slide.url))
    .slice(0, MAX_SLIDES)
    .map((slide) => ({
      type: slide.type === 'video' ? 'video' : 'image',
      url: slide.url,
      poster: allowed(slide.poster) ? slide.poster : null,
      description: String(slide.description ?? '').slice(0, 200)
    }));
}

export default async function handler(request, response) {
  // Five minutes at the edge: a campaign change reaches phones quickly without
  // every app launch in the country becoming a function invocation.
  response.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');

  if (request.method === 'GET') {
    try {
      const { adminDb } = await import('../server/firebase-admin.mjs');
      const snapshot = await adminDb().collection(COLLECTION).doc(DOCUMENT).get();
      const slides = snapshot.exists ? clean(snapshot.data()?.slides) : [];
      return response.status(200).json({ slides });
    } catch (error) {
      // Not an empty campaign: the app must tell "nothing is set" apart from
      // "we could not look", and only the first should clear anybody's slot.
      response.setHeader('Cache-Control', 'no-store');
      return response.status(503).json({ error: 'The campaign could not be read.' });
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
        error: 'None of those files are hosted by us. Upload the image or video to '
          + 'Firebase Storage and paste its download link.'
      });
    }

    const { adminDb } = await import('../server/firebase-admin.mjs');
    await adminDb().collection(COLLECTION).doc(DOCUMENT).set({
      slides,
      updatedAt: new Date().toISOString(),
      updatedBy: admin.email ?? null
    });
    return response.status(200).json({ slides });
  } catch (error) {
    return response.status(error.status || 500).json({
      error: error.message || 'The campaign could not be saved.'
    });
  }
}
