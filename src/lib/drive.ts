/* Reading the photographs the Geo Snap app backed up.

   The app asks Google for the `drive.file` scope, which reaches only files the
   app itself created. This website shares its Cloud project, so Google treats
   the two as one app and shows us exactly the folders the app made - and
   nothing else in the user's Drive. Verified against a real account before any
   of this was written.

   Photographs travel Drive -> browser -> document. They are never uploaded to
   an NLR server, which is what lets the privacy policy say what it says. */
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';

export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

/** The folder the app creates everything inside. */
export const ROOT_FOLDER = 'GeoSnap';

export type DriveFolder = { id: string; name: string };
export type DrivePhoto = {
  id: string;
  name: string;
  createdTime: string | null;
  /** Captions the app wrote into the file name: event, date, time, photo id. */
  takenAt: string | null;
};

const API = 'https://www.googleapis.com/drive/v3';

/** Raised when the Drive token has expired or been withdrawn. */
export class DriveAuthError extends Error {
  constructor(message = 'The Drive connection expired.') {
    super(message);
    this.name = 'DriveAuthError';
  }
}

/* The connection kept coming undone, for three separate reasons.

   Google's token lasts about an hour and the browser flow gives no refresh
   token, so it cannot simply be kept alive. It was also held in React state
   alone, so every reload threw it away even while still valid. And consent was
   demanded on every single connect, so re-linking meant working through the
   permission screen again rather than a popup that flashes and closes.

   So: the token is stored with its expiry and reused until it runs out,
   consent is asked for once rather than always, and an expired token is
   recognised as its own kind of failure the page can act on. */
const TOKEN_KEY = 'geosnap-drive-token';

type StoredToken = { token: string; expiresAt: number };

/** The stored token, if there is one and it has life left in it. */
export function cachedToken(): string | null {
  try {
    const raw = sessionStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as StoredToken;
    // A minute's grace, so a long export does not die halfway through.
    if (!stored.token || stored.expiresAt - 60_000 < Date.now()) {
      sessionStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return stored.token;
  } catch {
    return null;
  }
}

export function forgetToken() {
  try { sessionStorage.removeItem(TOKEN_KEY); } catch { /* private mode */ }
}

function rememberToken(token: string, lifetimeSeconds = 3500) {
  try {
    const stored: StoredToken = { token, expiresAt: Date.now() + lifetimeSeconds * 1000 };
    sessionStorage.setItem(TOKEN_KEY, JSON.stringify(stored));
  } catch { /* private mode - the token simply lives in memory */ }
}

/**
 * Asks Google for permission to read what the app created.
 *
 * A provider of its own, never the shared one: adding this scope to the
 * sign-in provider would ask every visitor for their Drive merely to log in.
 *
 * `reconsent` is for the case where the user wants to switch account or has
 * revoked access; ordinarily Google is left to decide whether to ask, which it
 * does not once permission has been given.
 */
export async function connectDrive(reconsent = false): Promise<string> {
  if (!auth) throw new Error('Sign-in is not configured on this site.');
  const provider = new GoogleAuthProvider();
  provider.addScope(DRIVE_SCOPE);
  if (reconsent) provider.setCustomParameters({ prompt: 'consent select_account' });
  const result = await signInWithPopup(auth, provider);
  const token = GoogleAuthProvider.credentialFromResult(result)?.accessToken;
  if (!token) throw new Error('Google did not return permission to read Drive.');
  rememberToken(token);
  return token;
}

function authFailure(status: number, message: string | undefined): boolean {
  if (status === 401) return true;
  // Drive answers 403 for quota as well as for permission, and only one of
  // those is fixed by connecting again.
  return status === 403 && /auth|credential|permission|insufficient|scope/i.test(message ?? '');
}

async function get<T>(token: string, path: string): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.error?.message as string | undefined;
    if (authFailure(response.status, message)) {
      forgetToken();
      throw new DriveAuthError();
    }
    throw new Error(message ?? `Drive request failed (${response.status}).`);
  }
  return body as T;
}

/**
 * The event folders, which are the children of GeoSnap.
 *
 * Older folders made before the app moved Cloud projects are invisible to us
 * and to the app, so they simply do not appear rather than appearing empty.
 */
export async function listEventFolders(token: string): Promise<DriveFolder[]> {
  const roots = await get<{ files: DriveFolder[] }>(
    token,
    `/files?q=${encodeURIComponent(
      `mimeType='application/vnd.google-apps.folder' and name='${ROOT_FOLDER}' and trashed=false`
    )}&fields=files(id,name)&pageSize=10`
  );
  const root = roots.files?.[0];
  if (!root) return [];

  const children = await get<{ files: DriveFolder[] }>(
    token,
    `/files?q=${encodeURIComponent(
      `'${root.id}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`
    )}&fields=files(id,name)&orderBy=createdTime desc&pageSize=200`
  );
  return children.files ?? [];
}

/** Every photograph in one event folder, oldest first, as the event happened. */
export async function listPhotos(token: string, folderId: string): Promise<DrivePhoto[]> {
  const body = await get<{ files: { id: string; name: string; createdTime?: string }[] }>(
    token,
    `/files?q=${encodeURIComponent(
      `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`
    )}&fields=files(id,name,createdTime)&orderBy=createdTime&pageSize=500`
  );
  return (body.files ?? []).map((file) => ({
    id: file.id,
    name: file.name,
    createdTime: file.createdTime ?? null,
    takenAt: takenAtFromName(file.name) ?? file.createdTime ?? null,
  }));
}

/**
 * The app names uploads `<event>_<yyyy-MM-dd>_<HHmmss>_<id>.jpg`, so the moment
 * of capture survives in the file name. Drive's createdTime is when the upload
 * landed, which for an offline capture can be hours later.
 */
function takenAtFromName(name: string): string | null {
  const match = /_(\d{4}-\d{2}-\d{2})_(\d{2})(\d{2})(\d{2})_/.exec(name);
  if (!match) return null;
  const [, date, hh, mm, ss] = match;
  const parsed = new Date(`${date}T${hh}:${mm}:${ss}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/** The bytes of one photograph, for drawing into a document. */
export async function downloadPhoto(token: string, fileId: string): Promise<Blob> {
  const response = await fetch(`${API}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    if (authFailure(response.status, undefined)) {
      forgetToken();
      throw new DriveAuthError();
    }
    throw new Error(`Could not read a photograph (${response.status}).`);
  }
  return response.blob();
}

/** A data URL, which is what both the preview and the PDF renderer want. */
export async function photoDataUrl(token: string, fileId: string): Promise<string> {
  const blob = await downloadPhoto(token, fileId);
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read a photograph.'));
    reader.readAsDataURL(blob);
  });
}

/**
 * A photograph scaled down, as a data URL.
 *
 * The bytes are fetched once and the full-size blob released immediately: a
 * folder of two hundred photographs held at camera resolution would exhaust
 * the tab, and a document built from them is too heavy to email.
 */
async function scaled(blob: Blob, maxPx: number, quality: number): Promise<string> {
  try {
    const bitmap = await createImageBitmap(blob);
    const scale = Math.min(1, maxPx / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('no canvas');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas.toDataURL('image/jpeg', quality);
  } catch {
    // Any failure to scale is not worth losing the picture over.
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Could not read a photograph.'));
      reader.readAsDataURL(blob);
    });
  }
}

/**
 * A small version, for the picking grid.
 *
 * Drive's own thumbnailLink needs the browser's Google session rather than a
 * bearer token, so it cannot be used for files only this app can see.
 */
export async function photoThumbnail(token: string, fileId: string, maxPx = 320): Promise<string> {
  return scaled(await downloadPhoto(token, fileId), maxPx, 0.7);
}

/**
 * The version that goes into a document.
 *
 * A phone camera writes four megabytes a frame, and a document embeds those
 * bytes as they are - three photographs made an eight-megabyte Word file, so
 * forty would make one no college could send. 1600px on the long edge is
 * about 200dpi across half an A4 page, which is more than a printed report
 * resolves, and brings a photograph to a few hundred kilobytes.
 */
export async function photoForPrint(token: string, fileId: string, maxPx = 1600): Promise<string> {
  return scaled(await downloadPhoto(token, fileId), maxPx, 0.82);
}

/** Runs the jobs a few at a time, so a big folder does not open 200 requests at once. */
export async function inBatches<T, R>(
  items: T[],
  size: number,
  work: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let index = 0; index < items.length; index += size) {
    const slice = items.slice(index, index + size);
    results.push(...await Promise.all(slice.map(work)));
  }
  return results;
}
