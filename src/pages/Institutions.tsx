/* What Geo Snap does for an organisation rather than a person.

   Two things, and they are the two halves of the same job: collecting
   photographs from a group of people, and turning them into the document
   somebody has to file. A college does both every term for accreditation; a
   contractor does both every month for a progress claim.

   Kept on one page because choosing between them is not a decision anybody
   arrives wanting to make - they arrive with "I need evidence from forty
   people and a report at the end of it". */
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, FolderCheck, Lock, ShieldCheck, Users } from 'lucide-react';
import PageShell from '../components/PageShell';
import Seo from '../components/Seo';

const POINTS = [
  {
    icon: Users,
    title: 'Everyone submits, nobody shares a link',
    body: 'Students and staff enter a code in the app. They never get access to '
      + 'the folder, so nobody can see or delete anybody else’s work.'
  },
  {
    icon: Lock,
    title: 'The photographs are yours',
    body: 'They land in your own Google Drive, owned by your account. We never '
      + 'hold them — nothing passes through our servers.'
  },
  {
    icon: ShieldCheck,
    title: 'Proof, not just pictures',
    body: 'Every capture carries the place, the address, the coordinates and the '
      + 'time, burned into the image. Captures made with a faked location are refused.'
  }
];

export default function Institutions() {
  return (
    <PageShell title="Institutions" eyebrow="Colleges, contractors and field teams" wide>
      <Seo
        title="Geo Snap - NLR for institutions"
        description="Collect geo-tagged photographs from a whole class or site team into your own Google Drive, then write the report from them."
      />

      <p className="max-w-2xl text-sm leading-relaxed text-ink/70">
        Most organisations need the same two things: photographs from a group of
        people that can be trusted, and a document at the end of it. Accreditation
        evidence, daily progress reports, inspection records, claim files.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Card
          to="/collections"
          icon={<FolderCheck size={20} className="text-green" />}
          title="Collections"
          lede="Give a class or a site team a code. Everything they photograph arrives
                in a folder in your Drive, owned by you, until the deadline you set."
          cta="Open collections"
          note="Creating a collection needs Pro. Joining one is free."
        />
        <Card
          to="/reports"
          icon={<FileText size={20} className="text-green" />}
          title="Event documentation"
          lede="Write the report on a keyboard, from the photographs already backed
                up. Fill in the details and export the PDF or Word file you have to file."
          cta="Write a report"
          note="Reads from your Drive. Nothing is uploaded to us."
        />
      </div>

      <section className="mt-12">
        <h2 className="font-display text-xl font-medium">Why it holds up</h2>
        <ul className="mt-5 grid gap-5 sm:grid-cols-3">
          {POINTS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="rounded-2xl border border-line bg-card p-5">
              <Icon size={18} className="text-green" />
              <p className="mt-3 text-sm font-semibold">{title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/65">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-sm text-ink/60">
        Running something larger, or need this to work a particular way for your
        institution?{' '}
        <Link to="/support" className="font-medium text-green underline underline-offset-4">
          Talk to us
        </Link>
        .
      </p>
    </PageShell>
  );
}

function Card({ to, icon, title, lede, cta, note }: {
  to: string;
  icon: React.ReactNode;
  title: string;
  lede: string;
  cta: string;
  note: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-2xl border border-line bg-card p-6 transition hover:shadow-card"
    >
      {icon}
      <h2 className="mt-4 font-display text-lg font-medium">{title}</h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/65">{lede}</p>
      <p className="mt-4 text-xs text-ink/45">{note}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-green">
        {cta}
        <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
