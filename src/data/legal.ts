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
    'This Privacy Policy explains how the Geo Snap - NLR Android application (formerly published as LocSnap) and this website, provided by NLR GROUP OF COMPANIES, handle your information. It is written in plain language so that you can clearly understand what the application does, and does not do, with your data. By downloading, installing or using the application, you acknowledge the practices described in this Policy. The effective date is shown at the top of this document.',
  sections: [
    {
      heading: 'Camera Data',
      paragraphs: [
        'Camera access is required to capture photos and videos. Geo Snap - NLR does not upload your photos or videos to its own servers for core functionality.',
      ],
    },
    {
      heading: 'Microphone',
      paragraphs: [
        'Microphone access is used only to record audio for videos. Denying it makes recorded clips silent rather than blocking recording. Audio is stored on your device as part of the video and is not transmitted to Geo Snap - NLR.',
      ],
    },
    {
      heading: 'Location Data',
      paragraphs: [
        'Geo Snap - NLR may access precise location, approximate location, latitude, longitude, altitude, GPS accuracy and bearing.',
        'Location information may be rendered into the stamp applied to your photos and videos, and may be written to photo EXIF metadata. This information is processed on your device and is used for the purposes listed below.',
      ],
      list: [
        'To create GPS stamps',
        'To display location information',
        'To organize photos',
        'To write EXIF metadata',
      ],
    },
    {
      heading: 'Device Storage and Media',
      paragraphs: ['Geo Snap - NLR accesses device storage or media only as needed to:'],
      list: [
        'Save photos and videos',
        'Select images',
        'Create collages',
        'Organize folders',
        'Export ZIP archives',
        'Export PDF documents',
        'Share files',
      ],
    },
    {
      heading: 'Private Vault',
      paragraphs: [
        'The optional Private Vault stores captures you move into it in encrypted form on your device. The encryption key is held in the Android Keystore and never leaves the device.',
        'Vault contents are protected while on the device; however, because the key resides in the Keystore, they do not survive an uninstall. You should remove any content you wish to retain from the vault before uninstalling the application.',
      ],
    },
    {
      heading: 'Recycle Bin',
      paragraphs: [
        'Deleted captures are held in the application’s private recycle bin on your device so that they may be restored. Emptying the recycle bin permanently removes those items and cannot be undone.',
      ],
    },
    {
      heading: 'Local Storage',
      paragraphs: [
        'Geo Snap - NLR stores application settings, photo metadata, folder information, cached location information and other required data locally on your device.',
        'Deleting the application may remove application-specific locally stored data. Photos you created that are stored in shared media folders may remain unless you delete them manually.',
      ],
    },
    {
      heading: 'Location Names and Geocoding',
      paragraphs: [
        'Geo Snap - NLR may use Android system location and geocoding services to convert GPS coordinates into readable place names and addresses. Some geocoding or map functions may involve third-party services provided by the Android device or a map provider.',
        'Availability may depend on network connectivity, device services and geographic coverage.',
      ],
    },
    {
      heading: 'Map Tiles and Mini-Map',
      paragraphs: [
        'Geo Snap - NLR may display a live mini-map and may draw a small map image into the stamp. To render these maps, the application may request map tiles from a third-party map provider.',
        'Such requests contain only the technical information required to retrieve the relevant map area, such as the coordinates being viewed. No account details, photos or other personal identifiers are sent with these requests. Map providers process these requests under their own privacy policies. Geo Snap - NLR is an independent application and is not affiliated with any map provider.',
      ],
    },
    {
      heading: 'No Account',
      paragraphs: ['Geo Snap - NLR currently does not require users to create an account.'],
    },
    {
      heading: 'No Cloud Storage',
      paragraphs: [
        'Geo Snap - NLR does not currently provide its own cloud storage service for user photos or videos. Your captures remain on your device unless you choose to share or export them.',
      ],
    },
    {
      heading: 'No AI Analysis',
      paragraphs: [
        'Geo Snap - NLR does not currently use artificial intelligence to analyze your photos or videos.',
      ],
    },
    {
      heading: 'Sharing',
      paragraphs: [
        'When you choose Share, the Android system sharing interface may send selected photos, videos, ZIP archives, PDF documents or other exported content to third-party applications that you select. Those applications have their own privacy policies.',
      ],
    },
    {
      heading: 'Advertising and Cross-Promotion',
      paragraphs: [
        'Geo Snap - NLR may display promotional content for other products offered by NLR GROUP OF COMPANIES ("house ads"). This content is bundled with the application and shown on your device; it is not served by a third-party advertising network, it uses no advertising identifiers, and it does not track you. Selecting such a promotion opens the relevant product page in your browser, after which that website’s own privacy policy applies.',
        'Geo Snap - NLR does not currently use third-party advertising services. If a third-party advertising service such as Google AdMob is introduced in a future release, those providers may collect information such as device identifiers, advertising identifiers, approximate location, app interactions and diagnostic data. This Privacy Policy will be updated before any such functionality is enabled.',
      ],
    },
    {
      heading: 'Analytics',
      paragraphs: [
        'Geo Snap - NLR does not currently use third-party analytics services unless explicitly disclosed in this Privacy Policy.',
      ],
    },
    {
      heading: 'Children and Privacy',
      paragraphs: [
        'Geo Snap - NLR is not specifically designed for children under the minimum age required by applicable law, and does not knowingly operate its own system for collecting personal information from children.',
      ],
    },
    {
      heading: 'Security',
      paragraphs: [
        'Geo Snap - NLR uses reasonable technical practices to protect the data it handles, including encrypting Private Vault contents with a key held in the Android Keystore. However, no software or device storage system can guarantee absolute security.',
      ],
    },
    {
      heading: 'Your Control',
      paragraphs: [
        'You may disable location permission, disable camera permission, remove photos, delete Geo Snap - NLR data or uninstall the application at any time. Disabling permissions may prevent related features from functioning.',
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
      paragraphs: [
        `If you have any questions or concerns regarding this Privacy Policy or your data, please contact NLR GROUP OF COMPANIES at ${CONTACT_EMAIL}.`,
      ],
    },
  ],
};

export const TERMS: LegalDocument = {
  id: 'terms',
  title: 'Terms & Conditions',
  intro:
    'These Terms & Conditions govern your use of the Geo Snap - NLR Android application (formerly published as LocSnap), provided by NLR GROUP OF COMPANIES. By downloading, installing or using the application, you agree to be bound by these Terms. Please read them carefully before using the application. If you do not agree with these Terms, you should not use the application.',
  sections: [
    {
      heading: 'App Purpose',
      paragraphs: ['Geo Snap - NLR provides:'],
      list: [
        'Photo and video camera functionality',
        'GPS stamping of location, coordinates, altitude and time',
        'Location information and a live mini-map',
        'Photo organization with folders, gallery, recycle bin and an encrypted private vault',
        'Collage generation',
        'ZIP and PDF export',
        'Related local-device utilities',
      ],
    },
    {
      heading: 'GPS Accuracy Disclaimer',
      paragraphs: [
        'GPS and location information may not always be exact. Accuracy can be affected by satellite visibility, device hardware, buildings, weather and environment, network availability and system location services.',
        'Geo Snap - NLR does not guarantee exact geographic accuracy.',
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
        'Geo Snap - NLR does not guarantee that a GPS-stamped photograph will be accepted as legal, regulatory, insurance or contractual evidence. You are responsible for determining whether Geo Snap - NLR is suitable for your intended use.',
      ],
    },
    {
      heading: 'User Responsibility',
      paragraphs: ['You must not use Geo Snap - NLR for:'],
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
        'You retain ownership of photographs and other content you create using Geo Snap - NLR. Geo Snap - NLR does not claim ownership of your photographs.',
      ],
    },
    {
      heading: 'Local Data Responsibility',
      paragraphs: [
        'Because Geo Snap - NLR is primarily device-based, you are responsible for maintaining appropriate backups of important photos and exported files.',
        'Subject to applicable law, Geo Snap - NLR is not responsible for loss caused by device damage, storage failure, accidental deletion, operating system issues, uninstalling applications or third-party apps.',
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
        'Geo Snap - NLR may change, improve, add or remove features over time. The application is provided subject to availability.',
      ],
    },
    {
      heading: 'Intellectual Property',
      paragraphs: [
        'The Geo Snap - NLR name, application interface, logo and original application materials are owned or controlled by their respective developer or rights holder.',
        'You may not copy the application, redistribute proprietary assets, reverse engineer it where prohibited by law, or falsely represent yourself as Geo Snap - NLR.',
      ],
    },
    {
      heading: 'Warranty Disclaimer',
      paragraphs: [
        'Geo Snap - NLR is provided on an "as available" basis to the maximum extent permitted by applicable law.',
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
      paragraphs: [
        `If you have any questions regarding these Terms & Conditions, please contact NLR GROUP OF COMPANIES at ${CONTACT_EMAIL}.`,
      ],
    },
  ],
};

/*
 * DEVELOPER NOTE (not rendered on the site):
 * Review this policy before publishing and update all placeholders,
 * third-party providers and actual data practices to match the final
 * production application.
 */
