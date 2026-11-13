/* A teacher's own collections, and what has been submitted to one.

   The submission list is read from Drive rather than from anything we store.
   Drive is holding the files, so it already knows exactly what arrived and
   who owns each one; keeping a second copy here would cost a write per photo
   and would eventually disagree with the folder - an upload that succeeded
   while our write failed would show as missing, during a deadline, with no
   way to tell which record was lying.

   One source of truth, and it is the one with the photographs in it. */
import {
  COLLECTIONS, normaliseCode, closedReason, accessTokenFor,
  refreshTokenFor, listFolder, requireUser, fail
} from '../../server/collections.mjs';

/** Long enough for a term's project, short enough that nothing lingers. */
const MAX_DAYS = 180;

/** What the teacher sees about one of their own collections. */
function summary(doc) {
  const data = doc.data();
  return {
    code: doc.id,
    name: data.name,
    createdAt: data.createdAt,
    expiresAt: data.expiresAt,
    active: data.active !== false,
    closed: Boolean(closedReason(data)),
    folderUrl: `https://drive.google.com/drive/folders/${data.driveFolderId}`
  };
}

export default async function handler(request, response) {
  try {
    const user = await requireUser(request);
    const { adminConfigured, adminDb } = await import('../../server/firebase-admin.mjs');
    if (!adminConfigured()) {
      return response.status(503).json({
        error: 'FIREBASE_SERVICE_ACCOUNT is not set on this deployment.'
      });
    }
    const db = adminDb();
    response.setHeader('Cache-Control', 'no-store');

    /* ---- close a collection early ---- */
    if (request.method === 'POST') {
      const payload = typeof request.body === 'string'
        ? JSON.parse(request.body || '{}')
        : (request.body ?? {});
      const code = normaliseCode(payload.code);
      if (!code) return response.status(400).json({ error: 'That is not a collection code.' });

      const doc = db.collection(COLLECTIONS).doc(code);
      const snapshot = await doc.get();
      if (!snapshot.exists || snapshot.data().ownerUid !== user.uid) {
        // Same answer for "not yours" as for "not there", so this cannot be
        // used to discover which codes exist.
        return response.status(404).json({ error: 'No collection has that code.' });
      }

      const change = {};

      /* Moving the closing time, in either direction.

         Bringing it forward is allowed as well as pushing it back: a class
         that finished early should be closable, and a teacher who mistyped
         2027 should not have to live with it. A collection whose deadline has
         already passed can still be given a new one - that is the whole point
         of being able to extend. */
      if (payload.expiresAt !== undefined) {
        const when = Date.parse(payload.expiresAt ?? '');
        if (!Number.isFinite(when)) {
          return response.status(400).json({ error: 'That is not a valid closing time.' });
        }
        if (when > Date.now() + MAX_DAYS * 86_400_000) {
          return response.status(400).json({
            error: `A collection can stay open for at most ${MAX_DAYS} days.`
          });
        }
        change.expiresAt = new Date(when).toISOString();
        // Extending a collection that was closed by hand reopens it, which is
        // what somebody setting a later time plainly means.
        if (when > Date.now()) change.active = true;
      }

      if (typeof payload.active === 'boolean') change.active = payload.active;

      if (Object.keys(change).length === 0) {
        return response.status(400).json({ error: 'Nothing to change.' });
      }

      await doc.update(change);
      return response.status(200).json({ code, ...change });
    }

    if (request.method !== 'GET') {
      response.setHeader('Allow', 'GET, POST');
      return response.status(405).json({ error: 'Use GET or POST.' });
    }

    /* ---- one collection, with what has been submitted ---- */
    const wanted = normaliseCode(request.query?.code);
    if (wanted) {
      const doc = await db.collection(COLLECTIONS).doc(wanted).get();
      if (!doc.exists || doc.data().ownerUid !== user.uid) {
        return response.status(404).json({ error: 'No collection has that code.' });
      }
      const data = doc.data();
      const accessToken = await accessTokenFor(await refreshTokenFor(db, user.uid));
      const files = await listFolder(accessToken, data.driveFolderId);

      /* Grouped by whoever owns the file. The uploader owns what they
         uploaded, so Drive already records who submitted what and we do not
         have to. */
      const byPerson = new Map();
      for (const file of files) {
        const owner = file.owners?.[0];
        const key = owner?.emailAddress ?? 'unknown';
        const entry = byPerson.get(key) ?? {
          email: key,
          name: owner?.displayName ?? null,
          count: 0,
          latest: null
        };
        entry.count += 1;
        if (!entry.latest || file.createdTime > entry.latest) entry.latest = file.createdTime;
        byPerson.set(key, entry);
      }

      const members = await doc.ref.collection('members').get();
      const joined = members.docs.map((member) => ({
        email: member.data().email,
        name: member.data().name,
        joinedAt: member.data().joinedAt,
        submitted: byPerson.get(member.data().email)?.count ?? 0
      }));

      return response.status(200).json({
        ...summary(doc),
        total: files.length,
        people: [...byPerson.values()].sort((a, b) => b.count - a.count),
        joined
      });
    }

    /* ---- everything this teacher runs ---- */
    const snapshot = await db.collection(COLLECTIONS)
      .where('ownerUid', '==', user.uid)
      .limit(100)
      .get();

    const connected = await db.collection('geo_snap_drive').doc(user.uid).get();

    return response.status(200).json({
      driveConnected: connected.exists,
      collections: snapshot.docs
        .map(summary)
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    });
  } catch (error) {
    return fail(response, error);
  }
}
