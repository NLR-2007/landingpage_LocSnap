import { CONTACT_EMAIL } from './locsnap';

export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
};

export type LegalDocument = {
  id: string;
  title: string;
  intro: string;
  sections: LegalSection[];
};

export const PRIVACY_POLICY: LegalDocument = {
  id: 'privacy',
  title: 'Privacy Policy',
  intro:
    'This Privacy Policy applies to the LocSnap Android application and this website. It is written in plain English so you can understand what the application does with your information.',
  sections: [
    {
      heading: 'Camera Data',
      paragraphs: [
        'Camera access is required to capture photos. LocSnap does not upload your photos to its own servers for core functionality.',
      ],
    },
    {
      heading: 'Location Data',
      paragraphs: [
        'LocSnap may access precise location, approximate location, latitude, longitude, altitude, GPS accuracy and bearing.',
        'Location information may be embedded directly into exported photographs.',
      ],
      list: [
        'To create GPS stamps',
        'To display location information',
        'To organize photos',
        'To write EXIF metadata',
      ],
    },
    {
      heading: 'Device Storage and Photos',
      paragraphs: ['LocSnap accesses device storage or media only as needed to:'],
      list: [
        'Save photos',
        'Select images',
        'Create collages',
        'Organize folders',
        'Export ZIP files',
        'Share files',
      ],
    },
    {
      heading: 'Local Storage',
      paragraphs: [
        'LocSnap stores application settings, photo metadata, folder information, cached location information and other required data locally on your device.',
        'Deleting the application may remove application-specific locally stored data. Photos you created that are stored in shared media folders may remain unless you delete them manually.',
      ],
    },
    {
      heading: 'Location Names and Geocoding',
      paragraphs: [
        'LocSnap may use Android system location and geocoding services to convert GPS coordinates into readable place names and addresses. Some geocoding or map functions may involve third-party services provided by the Android device or a map provider.',
        'Availability may depend on network connectivity, device services and geographic coverage.',
      ],
    },
    {
      heading: 'Mini Maps',
      paragraphs: [
        'LocSnap may display map information associated with captured locations. Map providers may receive standard technical requests required to provide map content. This policy will be updated to name the provider once a map provider is implemented.',
      ],
    },
    {
      heading: 'No Account',
      paragraphs: ['LocSnap currently does not require users to create an account.'],
    },
    {
      heading: 'No LocSnap Cloud Storage',
      paragraphs: [
        'LocSnap does not currently provide its own cloud storage service for user photos.',
      ],
    },
    {
      heading: 'No AI Analysis',
      paragraphs: ['LocSnap does not currently use artificial intelligence to analyze user photos.'],
    },
    {
      heading: 'Sharing',
      paragraphs: [
        'When you choose Share, the Android system sharing interface may send selected photos, ZIP files or other exported content to third-party applications that you select. Those applications have their own privacy policies.',
      ],
    },
    {
      heading: 'Advertising',
      paragraphs: [
        'LocSnap may introduce advertising in future releases. If third-party advertising services such as Google AdMob are introduced, those providers may collect information such as device identifiers, advertising identifiers, approximate location, app interactions and diagnostic data.',
        'This Privacy Policy will be updated before any such functionality is enabled. Advertising is not currently active.',
      ],
    },
    {
      heading: 'Analytics',
      paragraphs: [
        'LocSnap does not currently use third-party analytics services unless explicitly disclosed in this Privacy Policy.',
      ],
    },
    {
      heading: 'Children and Privacy',
      paragraphs: [
        'LocSnap is not specifically designed for children under the minimum age required by applicable law, and does not knowingly operate its own system for collecting personal information from children.',
      ],
    },
    {
      heading: 'Security',
      paragraphs: [
        'LocSnap uses reasonable technical practices to protect the data it handles. However, no software or device storage system can guarantee absolute security.',
      ],
    },
    {
      heading: 'Your Control',
      paragraphs: [
        'You may disable location permission, disable camera permission, remove photos, delete LocSnap data or uninstall the application at any time. Disabling permissions may prevent related features from functioning.',
      ],
    },
    {
      heading: 'Changes to This Policy',
      paragraphs: [
        'This Privacy Policy may be updated when functionality, legal requirements or third-party integrations change. The updated date is shown at the top of this document.',
      ],
    },
    {
      heading: 'Privacy Contact',
      paragraphs: [`Privacy questions: ${CONTACT_EMAIL}`],
    },
  ],
};

export const TERMS: LegalDocument = {
  id: 'terms',
  title: 'Terms & Conditions',
  intro:
    'By downloading or using LocSnap, you agree to these Terms. Please read them before using the application.',
  sections: [
    {
      heading: 'App Purpose',
      paragraphs: ['LocSnap provides:'],
      list: [
        'Camera functionality',
        'GPS stamping',
        'Location information',
        'Photo organization',
        'Collage generation',
        'ZIP export',
        'Related local-device utilities',
      ],
    },
    {
      heading: 'GPS Accuracy Disclaimer',
      paragraphs: [
        'GPS and location information may not always be exact. Accuracy can be affected by satellite visibility, device hardware, buildings, weather and environment, network availability and system location services.',
        'LocSnap does not guarantee exact geographic accuracy.',
      ],
    },
    {
      heading: 'Address Accuracy',
      paragraphs: [
        'Place names, addresses, maps and postal information may be generated using device or third-party geocoding and map services, and may contain errors or outdated information. Please verify location information independently when accuracy is critical.',
      ],
    },
    {
      heading: 'No Legal Evidence Guarantee',
      paragraphs: [
        'LocSnap does not guarantee that a GPS-stamped photograph will be accepted as legal, regulatory, insurance or contractual evidence. You are responsible for determining whether LocSnap is suitable for your intended use.',
      ],
    },
    {
      heading: 'User Responsibility',
      paragraphs: ['You must not use LocSnap for:'],
      list: [
        'Illegal surveillance',
        'Invading privacy',
        'Harassment',
        'Unlawful photography',
        'Copyright infringement',
        'Fraudulent location claims',
        'Any other illegal activity',
      ],
    },
    {
      heading: 'User Content',
      paragraphs: [
        'You retain ownership of photographs and other content you create using LocSnap. LocSnap does not claim ownership of your photographs.',
      ],
    },
    {
      heading: 'Local Data Responsibility',
      paragraphs: [
        'Because LocSnap is primarily device-based, you are responsible for maintaining appropriate backups of important photos and exported files.',
        'Subject to applicable law, LocSnap is not responsible for loss caused by device damage, storage failure, accidental deletion, operating system issues, uninstalling applications or third-party apps.',
      ],
    },
    {
      heading: 'Third-Party Services',
      paragraphs: [
        'Certain functionality may depend on Android, device manufacturers, location providers, map providers, app stores and sharing applications. Their own terms and privacy policies may apply.',
      ],
    },
    {
      heading: 'Availability',
      paragraphs: [
        'LocSnap may change, improve, add or remove features over time. The application is provided subject to availability.',
      ],
    },
    {
      heading: 'Intellectual Property',
      paragraphs: [
        'The LocSnap name, application interface, logo and original application materials are owned or controlled by their respective developer or rights holder.',
        'You may not copy the application, redistribute proprietary assets, reverse engineer it where prohibited by law, or falsely represent yourself as LocSnap.',
      ],
    },
    {
      heading: 'Warranty Disclaimer',
      paragraphs: [
        'LocSnap is provided on an "as available" basis to the maximum extent permitted by applicable law.',
      ],
    },
    {
      heading: 'Limitation of Liability',
      paragraphs: [
        'To the maximum extent permitted by applicable law, the developer is not responsible for indirect losses arising from inaccurate GPS data, device failures, data loss or misuse of the application. Nothing in these Terms attempts to waive rights that cannot legally be waived.',
      ],
    },
    {
      heading: 'Changes to These Terms',
      paragraphs: [
        'These Terms may change with new features, legal requirements or service integrations. The updated date is shown at the top of this document.',
      ],
    },
    {
      heading: 'Terms Contact',
      paragraphs: [`Questions regarding these Terms: ${CONTACT_EMAIL}`],
    },
  ],
};

/*
 * DEVELOPER NOTE (not rendered on the site):
 * Review this policy before publishing and update all placeholders,
 * third-party providers and actual data practices to match the final
 * production application.
 */
