import PageShell from '../components/PageShell';
import LegalDoc from '../components/LegalDoc';
import { PRIVACY_POLICY } from '../data/legal';
import { LAST_UPDATED } from '../data/locsnap';

export default function Privacy() {
  return (
    <PageShell title={PRIVACY_POLICY.title} eyebrow={`Last Updated: ${LAST_UPDATED}`}>
      <LegalDoc doc={PRIVACY_POLICY} />
    </PageShell>
  );
}
