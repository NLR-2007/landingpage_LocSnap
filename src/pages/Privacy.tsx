import PageShell from '../components/PageShell';
import LegalDoc from '../components/LegalDoc';
import Seo from '../components/Seo';
import { PRIVACY_POLICY } from '../data/legal';
import { LAST_UPDATED } from '../data/locsnap';

export default function Privacy() {
  return (
    <PageShell title={PRIVACY_POLICY.title} eyebrow={`Last Updated: ${LAST_UPDATED}`} wide>
      <Seo
        title="Geo Snap - NLR Privacy Policy"
        description="How Geo Snap - NLR handles Android captures and optional website Google sign-in. No Geo Snap cloud photo storage or AI analysis of your photos."
      />
      <LegalDoc doc={PRIVACY_POLICY} />
    </PageShell>
  );
}
