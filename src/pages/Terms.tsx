import PageShell from '../components/PageShell';
import LegalDoc from '../components/LegalDoc';
import { TERMS } from '../data/legal';
import { LAST_UPDATED } from '../data/locsnap';

export default function Terms() {
  return (
    <PageShell title={TERMS.title} eyebrow={`Last Updated: ${LAST_UPDATED}`}>
      <LegalDoc doc={TERMS} />
    </PageShell>
  );
}
