/* Permission for one photograph.

   Asked once per capture, and the answer is good for that capture only. Every
   rule the collection has is applied here, at the one moment it can be:
   whether the collection is still open, whether this person was ever part of
   it, and whether the teacher's Drive can still be reached.

   This is why the deadline holds. The student's app has no folder, no link
   and no Drive credential of its own, so when this endpoint stops answering
   there is nothing else to try. Closing a collection closes it.

   What goes back is a resumable upload URL that carries its own authority for
   one file. The photograph itself never passes through this server - the
   phone sends it straight to Google - so we hold the agreement and Google
   holds the evidence. */
import {
  COLLECTIONS, normaliseCode, closedReason, refreshTokenFor,
  accessTokenFor, mintUploadUrl, requireUser, fail
} from '../../server/collections.mjs';

const CLOSED_MESSAGE = {
  notFound: 'No collection has that code.',
  closed: 'The teacher has closed this collection.',
  expired: 'This collection has closed, so this photo was not submitted. It is still on your phone.'
};

/** Keeps a submitted name recognisable without letting it shape a path. */
function safeName(input) {
  const cleaned = String(input ?? '').replace(/[\\/\r\n\t]/g, '').trim();
  const name = cleaned.slice(0, 120);
  return name || `photo-${Date.now()}.jpg`;
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

    const code = normaliseCode(payload.code);
    if (!code) {
      return response.status(400).json({ error: 'That is not a collection code.' });
    }

    const { adminConfigured, adminDb } = await import('../../server/firebase-admin.mjs');
    if (!adminConfigured()) {
      return response.status(503).json({
        error: 'FIREBASE_SERVICE_ACCOUNT is not set on this deployment.'
      });
    }

    const db = adminDb();
    const doc = db.collection(COLLECTIONS).doc(code);
    const snapshot = await doc.get();
    const data = snapshot.exists ? snapshot.data() : null;

    /* Judged on when the shutter fired, not when the network came back.

       A student photographs a basement lab with no signal and surfaces after
       the deadline; the queue drains late through no fault of theirs. The
       work was done in time, so it counts. Without this, the building's walls
       decide who submitted. A capture time is only honoured when it is not in
       the future, so a device clock cannot buy an extension. */
    const capturedAt = Date.parse(payload.capturedAt ?? '');
    const judgeAt = Number.isFinite(capturedAt) && capturedAt <= Date.now()
      ? capturedAt
      : Date.now();

    const closed = closedReason(data, judgeAt);
    if (closed) {
      return response.status(closed === 'notFound' ? 404 : 410).json({
        error: CLOSED_MESSAGE[closed],
        reason: closed
      });
    }

    /* Being on the roster is checked every time rather than trusted from the
       join. A collection can be closed to somebody between the two, and this
       is the request that actually puts a file in a teacher's folder. */
    const member = await doc.collection('members').doc(user.uid).get();
    if (!member.exists && data.ownerUid !== user.uid) {
      return response.status(403).json({
        error: 'You have not joined this collection.'
      });
    }

    // The teacher's standing permission, not this collection's: one consent
    // covers every collection they run, and withdrawing it closes them all.
    const accessToken = await accessTokenFor(await refreshTokenFor(db, data.ownerUid));
    const uploadUrl = await mintUploadUrl({
      accessToken,
      folderId: data.driveFolderId,
      name: safeName(payload.name),
      mimeType: String(payload.mimeType ?? 'image/jpeg'),
      size: Number(payload.size)
    });

    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).json({ uploadUrl });
  } catch (error) {
    return fail(response, error);
  }
}
