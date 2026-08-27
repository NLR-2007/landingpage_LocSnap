export const APP_NAME = 'LocSnap';
export const TAGLINE = 'Capture. Locate. Organize.';
export const DEVELOPER = 'NLR GROUP OF COMPANIES';
export const LAST_UPDATED = '27 August 2026';

/** Contact details as supplied by NLR GROUP OF COMPANIES. */
export const CONTACT_EMAIL = 'nlrgroupofcompany@gmail.com';
export const CONTACT_PHONE = '6302245307';
export const CONTACT_PHONE_HREF = 'tel:+916302245307';
export const SUPPORT_EMAIL = CONTACT_EMAIL;
export const PRIVACY_EMAIL = CONTACT_EMAIL;

export const FEATURES: { title: string; body: string; points?: string[] }[] = [
  {
    title: 'GPS Stamped Photos',
    body: 'Every capture can carry readable location information alongside exact coordinates.',
    points: [
      'Location name and full address',
      'Latitude and longitude',
      'Date and time with time zone',
      'Country',
      'Optional accuracy, altitude and compass direction',
    ],
  },
  {
    title: 'Offline-First',
    body: 'Core camera and GPS features continue working without internet access. Detailed address and map availability may depend on your device and the map or geocoding data available to it.',
  },
  {
    title: 'Smart Folders',
    body: 'Choose a folder before photography and every following photo is filed there automatically.',
    points: ['Farm Visit', 'Construction Site', 'Plot 12', 'Travel', 'Inspection', 'Personal'],
  },
  {
    title: 'GPS Collages',
    body: 'Combine field photos into a single frame, with each photo keeping its own location and timestamp.',
    points: ['2, 4, 6 or 9 photos', 'Before / After', 'Horizontal comparison', 'Vertical comparison'],
  },
  {
    title: 'ZIP Export',
    body: 'Export an entire folder or selected photos into a ZIP file directly on your device. No server upload required.',
  },
  {
    title: 'Privacy First',
    body: 'LocSnap is built to keep your material where you put it.',
    points: [
      'No account',
      'No cloud photo storage',
      'No AI processing',
      'No backend required',
      'Photos stay on your device',
    ],
  },
];

export const AUDIENCES: { title: string; body: string }[] = [
  { title: 'Farmers', body: 'Document fields, crops, work and locations.' },
  { title: 'Construction', body: 'Record site progress and before/after work.' },
  { title: 'Field Teams', body: 'Organize location-based work photos.' },
  { title: 'Property Inspection', body: 'Capture location evidence and notes.' },
  { title: 'Travelers', body: 'Remember exactly where photos were captured.' },
  { title: 'Everyday Users', body: 'Use GPS stamps and organized photo folders.' },
];

export const SAMPLE_STAMP = {
  place: 'Hyderabad, Telangana, India 🇮🇳',
  address: ['Aleap Industrial Area,', 'Gajularamaram,', 'Hyderabad, Telangana 500043,', 'India'],
  lat: 'Lat 17.547302°',
  long: 'Long 78.404401°',
  date: 'Thursday, 27/08/2026',
  time: '09:55 AM GMT +05:30',
};
