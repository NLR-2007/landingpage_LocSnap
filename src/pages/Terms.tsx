import PageShell from '../components/PageShell';
import LegalDoc from '../components/LegalDoc';
import Seo from '../components/Seo';
import { TERMS } from '../data/legal';
import { LAST_UPDATED } from '../data/locsnap';

export default function Terms() {
  return (
    <PageShell title={TERMS.title} eyebrow={`Last Updated: ${LAST_UPDATED}`}>
      <Seo
        title={'LocSnap Terms & Conditions'}
        description="The terms for using LocSnap, including GPS and address accuracy disclaimers, user responsibilities, content ownership and limitation of liability."
      />
      <LegalDoc doc={TERMS} />
    </PageShell>
  );
}
