import type { LegalDocument } from '../data/legal';

type LegalDocProps = {
  doc: LegalDocument;
};

export default function LegalDoc({ doc }: LegalDocProps) {
  return (
    <>
      <p className="mt-7 text-sm font-normal leading-relaxed text-ink/80 sm:text-base">
        {doc.intro}
      </p>

      <div className="mt-14 space-y-12">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xs font-light uppercase tracking-[0.2em] text-ink/80">
              {section.heading}
            </h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="mt-4 text-sm font-normal leading-relaxed text-ink/70">
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
    </>
  );
}
