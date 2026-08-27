import type { LegalDocument } from '../data/legal';

type LegalDocProps = {
  doc: LegalDocument;
};

export default function LegalDoc({ doc }: LegalDocProps) {
  return (
    <>
      <p className="mt-7 text-sm font-light leading-relaxed text-white/70 sm:text-base">
        {doc.intro}
      </p>

      <div className="mt-14 space-y-12">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xs font-light uppercase tracking-[0.2em] text-white/90">
              {section.heading}
            </h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="mt-4 text-sm font-light leading-relaxed text-white/60">
                {paragraph}
              </p>
            ))}
            {section.list && (
              <ul className="mt-4 space-y-2">
                {section.list.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm font-light leading-relaxed text-white/55"
                  >
                    <span aria-hidden="true" className="text-white/25">
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
