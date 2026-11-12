/* Shared pieces for photo collections.

   A collection is an agreement, not a container: a teacher's folder, a
   deadline, and the list of people allowed to put something in it. The
   photographs themselves never come here. They go from the student's phone
   straight to Google, and the only thing this server does is decide, one
   upload at a time, whether that is currently allowed.

   That shape is what makes the deadline real. The student's app never learns
   the folder, never holds a Drive credential and never sees a share link, so
   when the deadline passes and this server stops issuing permission there is
   no second way in. It also means a student cannot reach, change or delete
   what anybody else has submitted, because they have no access to the folder
   at all - only to the single upload they were just granted. */
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

/** Where the agreements live. Never a photograph. */
export const COLLECTIONS = 'geo_snap_collections';

/* A teacher's standing permission to write into their own Drive.

   Kept per teacher rather than per collection, because it is the teacher who
   granted it and the teacher who can withdraw it. One consent then covers
   every collection they ever open, and disconnecting once closes all of them
   rather than leaving older ones quietly working. */
export const DRIVE_CREDENTIALS = 'geo_snap_drive';

/* Characters that survive being read aloud and written on a whiteboard.

   No 0 or O, no 1, I or L: a code is going to be dictated across a lecture
   hall, and a pair that looks alike on a projector costs the whole room a
   minute each time. 31 characters over 8 places is still far too many to
   guess at. */
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const CODE_LENGTH = 8;

/** A fresh join code. Checked for collisions by the caller. */
export function newCode() {
  const bytes = randomBytes(CODE_LENGTH);
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return code;
}

/** Accepts what somebody typed: spaces, dashes and lower case are forgiven. */
export function normaliseCode(input) {
  if (typeof input !== 'string') return null;
  const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return cleaned.length === CODE_LENGTH ? cleaned : null;
}

/* ---------------------------------------------------------------- secrets --

   The teacher's refresh token is the most dangerous thing this service holds:
   it is standing permission to write into somebody's Drive, and unlike an
   access token it does not expire on its own. It is encrypted before it is
   written, so a copy of the database is not a copy of everyone's Drive
   access.

   AES-256-GCM, because it authenticates as well as encrypts: a token that has
   been tampered with fails to decrypt rather than being handed to Google. */

function encryptionKey() {
  const raw = process.env.COLLECTION_SECRET_KEY;
  if (!raw) {
    const error = new Error('COLLECTION_SECRET_KEY is not set on this deployment.');
    error.status = 503;
    throw error;
  }
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    const error = new Error('COLLECTION_SECRET_KEY must be 32 bytes, base64 encoded.');
    error.status = 503;
    throw error;
  }
  return key;
}

export function encryptSecret(plain) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const body = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  // iv.tag.body, each base64, so one string round-trips through Firestore.
  return `${iv.toString('base64')}.${cipher.getAuthTag().toString('base64')}.${body.toString('base64')}`;
}

export function decryptSecret(packed) {
  const [iv, tag, body] = String(packed).split('.');
  if (!iv || !tag || !body) throw new Error('Stored credential is malformed.');
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(body, 'base64')), decipher.final()]).toString('utf8');
}

/* ------------------------------------------------------------------ google -- */

function googleClient() {
  const id = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const secret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!id || !secret) {
    const error = new Error(
      'GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET are not set on this deployment.'
    );
    error.status = 503;
    throw error;
  }
  return { id, secret };
}

/**
 * Turns the one-time code the teacher's app obtained into a lasting one.
 *
 * Google only returns a refresh token when the consent screen was asked for
 * offline access, and often only the first time an account consents. A
 * teacher who has authorised before may come back with no refresh token at
 * all, which is why the caller treats its absence as a real failure with
 * something useful to say, rather than storing an empty string and finding
 * out a week later when the first student tries to upload.
 */
export async function exchangeAuthCode(authCode, redirectUri) {
  const { id, secret } = googleClient();
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: authCode,
      client_id: id,
      client_secret: secret,
      redirect_uri: redirectUri || '',
      grant_type: 'authorization_code'
    })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.error_description || 'Google refused the authorisation code.');
    error.status = 400;
    throw error;
  }
  return body;
}

/** A short-lived access token for the teacher, from the stored refresh token. */
export async function accessTokenFor(refreshToken) {
  const { id, secret } = googleClient();
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: id,
      client_secret: secret,
      grant_type: 'refresh_token'
    })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.access_token) {
    /* The teacher revoked access, changed their password, or the token simply
       aged out. Said plainly, because the person who meets this message is a
       student in a classroom who can do nothing about it and needs to know
       whose problem it is. */
    const error = new Error(
      'This collection can no longer reach the teacher\'s Drive. The teacher needs to '
      + 'reconnect it.'
    );
    error.status = 409;
    throw error;
  }
  return body.access_token;
}

/**
 * Opens a resumable upload and returns the URL the phone sends bytes to.
 *
 * The URL carries its own authority, so the phone needs no credential of its
 * own - which is the whole reason students never touch Drive. It is good for
 * one file and expires by itself, so handing one out grants nothing beyond
 * the single upload it was minted for.
 */
export async function mintUploadUrl({ accessToken, folderId, name, mimeType, size }) {
  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': mimeType,
        ...(Number.isFinite(size) ? { 'X-Upload-Content-Length': String(size) } : {})
      },
      body: JSON.stringify({ name, parents: [folderId] })
    }
  );
  const location = response.headers.get('location');
  if (!response.ok || !location) {
    const detail = await response.text().catch(() => '');
    const error = new Error('Google would not open an upload for this collection.');
    error.status = 502;
    error.detail = detail.slice(0, 400);
    throw error;
  }
  return location;
}

/**
 * Makes the folder the photographs will land in.
 *
 * Created through this client so that `drive.file` covers it afterwards: a
 * folder the teacher made by hand in Drive would be invisible to us, and the
 * uploads into it would fail with nothing useful to say about why.
 */
export async function createFolder(accessToken, name) {
  const response = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder' })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.id) {
    const error = new Error('Could not create the folder in your Drive.');
    error.status = 502;
    throw error;
  }
  return body;
}

/** Lists what has actually been submitted. Drive is the record, not us. */
export async function listFolder(accessToken, folderId) {
  const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const fields = encodeURIComponent('files(id,name,createdTime,size,owners(displayName,emailAddress))');
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&pageSize=1000`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error('Could not read the collection folder.');
    error.status = 502;
    throw error;
  }
  return body.files ?? [];
}

/**
 * The teacher's refresh token, decrypted, or a 409 saying who must fix it.
 *
 * A student meeting this can do nothing about it, so the message names the
 * teacher rather than describing an authorisation failure.
 */
export async function refreshTokenFor(db, uid) {
  const snapshot = await db.collection(DRIVE_CREDENTIALS).doc(uid).get();
  if (!snapshot.exists) {
    const error = new Error('The teacher has not connected their Drive.');
    error.status = 409;
    throw error;
  }
  return decryptSecret(snapshot.data().refreshToken);
}

/* ------------------------------------------------------------------ shared -- */

/** The reason a collection is closed, or null while it is open. */
export function closedReason(data, now = Date.now()) {
  if (!data) return 'notFound';
  if (data.active === false) return 'closed';
  const expires = Date.parse(data.expiresAt ?? '');
  if (Number.isFinite(expires) && expires <= now) return 'expired';
  return null;
}

/** What a student is allowed to know: never the folder, never the teacher's token. */
export function forStudent(code, data) {
  return {
    code,
    name: data.name ?? 'Collection',
    teacher: data.ownerName ?? null,
    expiresAt: data.expiresAt ?? null
  };
}

/** Reads the caller's Firebase ID token, or throws 401. */
export async function requireUser(request) {
  const header = request.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) {
    const error = new Error('Sign in to use collections.');
    error.status = 401;
    throw error;
  }
  const { verifyIdToken } = await import('./verify-id-token.mjs');
  const claims = await verifyIdToken(token);
  return { uid: claims.sub, email: claims.email ?? null, name: claims.name ?? null };
}

/** One place that turns a thrown error into a response. */
export function fail(response, error) {
  const status = error?.status ?? 500;
  response.setHeader('Cache-Control', 'no-store');
  return response.status(status).json({
    error: error?.message || 'Something went wrong.',
    ...(error?.detail ? { detail: error.detail } : {})
  });
}
