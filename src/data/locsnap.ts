export const APP_NAME = 'Geo Snap - NLR';
/** The app was first built and published under the name "LocSnap". */
export const FORMER_NAME = 'LocSnap';
export const TAGLINE = 'Capture. Locate. Prove.';
export const DEVELOPER = 'NLR GROUP OF COMPANIES';
export const PACKAGE_ID = 'com.nlrgroup.locsnap';
export const LAST_UPDATED = '10 October 2026';

/**
 * Production origin, used for canonical URLs, Open Graph tags and the sitemap.
 * This must stay in step with the Privacy Policy URL registered in the Google
 * Play Console (https://locsnapnlr.vercel.app/privacy).
 */
export const SITE_URL = 'https://locsnapnlr.vercel.app';

export const SITE_TITLE = 'Geo Snap - NLR — Offline GPS Camera';
export const SITE_DESCRIPTION =
  'Geo Snap - NLR is an offline-first GPS camera that stamps photos and videos with location, address, coordinates, altitude and time. Smart folders, live mini-map, private vault, collages and ZIP or PDF export — all on your device.';

/** Contact details as supplied by NLR GROUP OF COMPANIES. */
export const CONTACT_EMAIL = 'nlrgroupofcompany@gmail.com';
export const CONTACT_PHONE = '6302245307';
export const CONTACT_PHONE_HREF = 'tel:+916302245307';
export const SUPPORT_EMAIL = CONTACT_EMAIL;
export const PRIVACY_EMAIL = CONTACT_EMAIL;

export const FEATURES: { title: string; body: string; points?: string[] }[] = [
  {
    title: 'GPS Data Stamp',
    body: 'Every capture carries a readable stamp burned into the frame, with a degradation ladder so it stays sensible even when a field or the map is missing.',
    points: [
      'Location name and full address',
      'Latitude and longitude',
      'Altitude and compass heading',
      'GPS accuracy indicator',
      'Date, time and time zone',
      'Country with flag',
    ],
  },
  {
    title: 'Photo & Video',
    body: 'Capture stamped photos and video. Nothing blocks the shutter — GPS, map tiles and reverse geocoding are optional enhancements, never prerequisites for taking a shot.',
  },
  {
    title: 'Offline-First',
    body: 'Core camera and GPS capture keep working without a connection. Reverse geocoding is cached, so places you return to resolve to a name again without the network.',
  },
  {
    title: 'Live Mini-Map',
    body: 'A live map preview with cached tiles, and an optional map cell drawn right into the stamp so each photo shows where it was taken.',
  },
  {
    title: 'Smart Folders',
    body: 'Choose a folder before you shoot and every following capture is filed there automatically — no sorting session at the end of the day.',
    points: ['Farm Visit', 'Construction Site', 'Plot 12', 'Travel', 'Inspection', 'Personal'],
  },
  {
    title: 'Gallery & Organization',
    body: 'A gallery grouped by day with multi-select. Move captures into folders, and reorganise your field work whenever you like.',
  },
  {
    title: 'Private Vault',
    body: 'Lock sensitive captures in an encrypted vault, with the key held in the Android Keystore.',
    points: [
      'Encryption-backed storage',
      'Auto-locks when the app leaves the screen',
      'Configurable auto-lock delay',
    ],
  },
  {
    title: 'Recycle Bin',
    body: 'Deleted captures go to a recycle bin so an accidental delete can be undone. Emptying the bin is the only delete you cannot take back.',
  },
  {
    title: 'GPS Collages',
    body: 'Combine field photos into one frame, with every photo keeping its own GPS stamp intact — never cropped off.',
    points: ['4, 6 or 9 photo grids', 'Each cell keeps its stamp', 'Optional extra caption bar'],
  },
  {
    title: 'ZIP & PDF Export',
    body: 'Export a folder or a selection as a ZIP archive or a PDF document, created directly on your device. No server upload required.',
  },
  {
    title: 'Themes',
    body: 'Make it yours with a theme setting, including a festival theme, plus a themed (monochrome) adaptive launcher icon alongside the standard one.',
  },
  {
    title: 'Privacy First',
    body: 'Geo Snap - NLR is built to keep your material where you put it.',
    points: [
      'No account, no sign-in',
      'No cloud photo storage',
      'No analytics or ads SDK',
      'No AI processing of your photos',
      'Only outbound traffic is map tiles and reverse geocoding — a coordinate and nothing else',
    ],
  },
];

export const AUDIENCES: { title: string; body: string }[] = [
  { title: 'Farmers', body: 'Document fields, crops, work and locations.' },
  { title: 'Construction', body: 'Record site progress and before/after work.' },
  { title: 'Field Teams', body: 'Organize location-based work photos and video.' },
  { title: 'Property Inspection', body: 'Capture location evidence and notes.' },
  { title: 'Travelers', body: 'Remember exactly where photos were captured.' },
  { title: 'Everyday Users', body: 'Use GPS stamps and organized photo folders.' },
];

export const SAMPLE_STAMP = {
  place: 'Hyderabad, Telangana, India 🇮🇳',
  address: ['Chaitanya College Rd, Kavya Avenue,', 'Ameenpur, Bachupally,', 'Hyderabad, Telangana 500043'],
  lat: 'Lat 17.547357°',
  long: 'Long 78.401288°',
  altitude: 'Altitude 546.5 m',
  heading: 'N 357°',
  accuracy: 'GPS ±3.4 m',
  date: 'Monday, 05/10/2026',
  time: '05:44 PM GMT +05:30',
};
