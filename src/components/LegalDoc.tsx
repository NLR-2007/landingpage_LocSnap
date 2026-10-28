import type { LegalDocument } from '../data/legal';

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

type LegalDocProps = {
  doc: LegalDocument;
};

export default function LegalDoc({ doc }: LegalDocProps) {
  return (
    <div className="mt-10 lg:grid lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[230px_minmax(0,1fr)] xl:gap-16">
      {/* Section navigation — sticky beside the document on large screens. */}
      <aside className="hidden lg:block">
        <nav className="sticky top-28">
          <p className="text-[10px] font-light uppercase tracking-[0.2em] text-ink/40">
            On this page
          </p>
          <ul className="mt-4 space-y-1 border-l border-line">
            {doc.sections.map((section) => (
              <li key={section.heading}>
                <a
                  href={`#${slug(section.heading)}`}
                  className="-ml-px block border-l border-transparent py-1 pl-4 text-xs font-light leading-snug text-ink/55 transition-colors duration-200 hover:border-green hover:text-green"
                >
                  {section.heading}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Document body. */}
      <div className="min-w-0">
        <p className="text-sm font-normal leading-relaxed text-ink/80 text-justify hyphens-auto sm:text-base">
          {doc.intro}
        </p>

        <div className="mt-14 space-y-12">
          {doc.sections.map((section) => (
            <section key={section.heading} id={slug(section.heading)} className="scroll-mt-28">
              <h2 className="text-xs font-light uppercase tracking-[0.2em] text-ink/80">
                {section.heading}
              </h2>
              {section.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-4 text-sm font-normal leading-relaxed text-ink/70 text-justify hyphens-auto"
                >
                  {paragraph}
                </p>
              ))}
              {section.list && (
                <ul className="mt-4 space-y-2">
                  {section.list.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm font-normal leading-relaxed text-ink/65"
                    >
                      <span aria-hidden="true" className="text-ink/40">
                        —
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
