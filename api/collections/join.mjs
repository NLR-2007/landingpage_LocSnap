/* A student joins with a code.

   What comes back is the name of the collection and when it closes - never
   the folder, never a link, never anything that would let the student reach
   Drive on their own. That is deliberate: the student's app genuinely cannot
   put a photograph anywhere, which is why this collection's deadline is a
   deadline rather than a suggestion, and why one student cannot touch
   another's work.

   Membership is written as its own document rather than appended to a list on
   the collection. Forty students join within the same few seconds at the
   start of a class, and forty writes to one document is contention: the
   joins would start failing at exactly the moment a lesson is trying to
   begin. */
import {
  COLLECTIONS, normaliseCode, closedReason, forStudent, requireUser, fail
} from '../../server/collections.mjs';

const CLOSED_MESSAGE = {
  notFound: 'No collection has that code. Check it and try again.',
  closed: 'The teacher has closed this collection.',
  expired: 'This collection has closed. Your photos are still on your phone.'
};

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
    const snapshot = await db.collection(COLLECTIONS).doc(code).get();
    const data = snapshot.exists ? snapshot.data() : null;

    const closed = closedReason(data);
    if (closed) {
      // 404 for a code that does not exist, 410 for one that has run out:
      // the app says different things, and a student who mistyped should not
      // be told the deadline has passed.
      return response.status(closed === 'notFound' ? 404 : 410).json({
        error: CLOSED_MESSAGE[closed],
        reason: closed
      });
    }

    await db.collection(COLLECTIONS).doc(code).collection('members').doc(user.uid).set({
      email: user.email,
      name: user.name,
      joinedAt: new Date().toISOString()
    }, { merge: true });

    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).json(forStudent(code, data));
  } catch (error) {
    return fail(response, error);
  }
}
