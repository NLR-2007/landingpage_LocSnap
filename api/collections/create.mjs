/* A teacher opens a collection.

   The teacher connected their Drive once, before this; what happens here is
   that we make a folder in it and write down the agreement that points at
   that folder - a name, a deadline, and nothing else.

   The folder is created rather than chosen. A folder the teacher made by hand
   in Drive is invisible under `drive.file`, so uploads into it would fail
   with nothing useful to say about why. Made here, it is an ordinary folder
   in their Drive that they can open, move, share and keep after the
   collection is long closed.

   This is the only place a folder id is written, and no student ever reads
   it back. */
import {
  COLLECTIONS, newCode, accessTokenFor, createFolder,
  refreshTokenFor, requireUser, canCreate, fail
} from '../../server/collections.mjs';

/** Long enough for a term's project, short enough that nothing lingers. */
const MAX_DAYS = 180;

function expiryFrom(input) {
  const when = Date.parse(input ?? '');
  if (!Number.isFinite(when)) {
    const error = new Error('Set when this collection should close.');
    error.status = 400;
    throw error;
  }
  if (when <= Date.now()) {
    const error = new Error('That closing time has already passed.');
    error.status = 400;
    throw error;
  }
  if (when > Date.now() + MAX_DAYS * 86_400_000) {
    const error = new Error(`A collection can stay open for at most ${MAX_DAYS} days.`);
    error.status = 400;
    throw error;
  }
  return new Date(when).toISOString();
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ error: 'Use POST.' });
  }

  try {
    const user = await requireUser(request);
    const payload = typeof request.body === 'string'
      ? JSON.parse(request.body || '{}')
      : (request.body ?? {});

    const name = String(payload.name ?? '').trim().slice(0, 80);
    if (!name) {
      return response.status(400).json({ error: 'Give the collection a name.' });
    }
    const expiresAt = expiryFrom(payload.expiresAt);

    const { adminConfigured, adminDb } = await import('../../server/firebase-admin.mjs');
    if (!adminConfigured()) {
      return response.status(503).json({
        error: 'FIREBASE_SERVICE_ACCOUNT is not set on this deployment.'
      });
    }
    const db = adminDb();

    if (!await canCreate(db, user)) {
      return response.status(402).json({
        error: 'Running a collection needs Geo Snap Pro. Joining one is free - '
          + 'your students do not need a plan.',
        needsPro: true
      });
    }

    const accessToken = await accessTokenFor(await refreshTokenFor(db, user.uid));
    const folder = await createFolder(accessToken, `Geo Snap - ${name}`);

    /* Try a few codes rather than one. A collision is vanishingly unlikely at
       eight characters, but "vanishingly unlikely" arrives eventually, and a
       silent overwrite would hand one teacher's students to another. */
    let code = null;
    for (let attempt = 0; attempt < 5 && !code; attempt += 1) {
      const candidate = newCode();
      // eslint-disable-next-line no-await-in-loop
      const existing = await db.collection(COLLECTIONS).doc(candidate).get();
      if (!existing.exists) code = candidate;
    }
    if (!code) {
      return response.status(503).json({ error: 'Could not allocate a code. Try again.' });
    }

    await db.collection(COLLECTIONS).doc(code).set({
      name,
      ownerUid: user.uid,
      ownerEmail: user.email,
      ownerName: user.name,
      driveFolderId: folder.id,
      createdAt: new Date().toISOString(),
      expiresAt,
      active: true
    });

    response.setHeader('Cache-Control', 'no-store');
    return response.status(201).json({
      code,
      name,
      expiresAt,
      folderUrl: `https://drive.google.com/drive/folders/${folder.id}`
    });
  } catch (error) {
    return fail(response, error);
  }
}
