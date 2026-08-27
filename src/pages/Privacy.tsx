import PageShell from '../components/PageShell';
import LegalDoc from '../components/LegalDoc';
import Seo from '../components/Seo';
import { PRIVACY_POLICY } from '../data/legal';
import { LAST_UPDATED } from '../data/locsnap';

export default function Privacy() {
  return (
    <PageShell title={PRIVACY_POLICY.title} eyebrow={`Last Updated: ${LAST_UPDATED}`}>
      <Seo
        title="LocSnap Privacy Policy"
        description="How the LocSnap Android app handles camera, location and storage data. No account, no LocSnap cloud photo storage and no AI analysis of your photos."
      />
      <LegalDoc doc={PRIVACY_POLICY} />
    </PageShell>
  );
}
