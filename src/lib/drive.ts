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

/**
 * Asks Google for permission to read what the app created.
 *
 * A provider of its own, never the shared one: adding this scope to the
 * sign-in provider would ask every visitor for their Drive merely to log in.
 */
export async function connectDrive(): Promise<string> {
  if (!auth) throw new Error('Sign-in is not configured on this site.');
  const provider = new GoogleAuthProvider();
  provider.addScope(DRIVE_SCOPE);
  provider.setCustomParameters({ prompt: 'consent' });
  const result = await signInWithPopup(auth, provider);
  const token = GoogleAuthProvider.credentialFromResult(result)?.accessToken;
  if (!token) throw new Error('Google did not return permission to read Drive.');
  return token;
}

async function get<T>(token: string, path: string): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.error?.message ?? `Drive request failed (${response.status}).`);
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
  if (!response.ok) throw new Error(`Could not read a photograph (${response.status}).`);
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
