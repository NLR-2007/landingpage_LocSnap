/* Preparing a picture for the app's promo slot.

   The picture travels inside the campaign document, so its size is not a
   nicety: Firestore refuses a document over a megabyte, and every byte is
   downloaded by a phone that may be paying for it by the megabyte.

   A banner is shown about 1080 pixels wide on the largest phone we care
   about, so anything beyond that is detail nobody sees, carried at the user's
   expense. The quality is stepped down until the result fits rather than
   fixed, because what fits depends on the picture: a flat graphic compresses
   to nothing, a photograph does not. */

/** What the app's slot can actually show. */
const MAX_WIDTH = 1080;

/** Must stay under the endpoint's own limit, which guards Firestore's. */
const MAX_CHARACTERS = 690_000;

const QUALITY_STEPS = [0.82, 0.72, 0.62, 0.5, 0.4];

export type PreparedImage = {
  dataUrl: string;
  width: number;
  height: number;
  /** Roughly what the phone will download, for showing in the panel. */
  kilobytes: number;
};

export async function prepareBannerImage(file: File): Promise<PreparedImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('That is not a picture. Choose a JPG, PNG or WebP file.');
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('This browser could not prepare the picture.');
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  for (const quality of QUALITY_STEPS) {
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    if (dataUrl.length <= MAX_CHARACTERS) {
      return {
        dataUrl,
        width,
        height,
        // Base64 carries three bytes in four characters.
        kilobytes: Math.round((dataUrl.length * 0.75) / 1024)
      };
    }
  }

  throw new Error(
    'That picture is too detailed to fit, even heavily compressed. Crop it to a banner '
    + 'shape - about 1080 by 500 - and try again.'
  );
}
