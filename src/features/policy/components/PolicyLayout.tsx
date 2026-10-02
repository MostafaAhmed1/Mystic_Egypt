import { CalendarDays } from "lucide-react";
import type { PolicyContent } from "@/features/policy/content";

/** Presentational layout for the four legal/trust pages. Server component. */
export function PolicyLayout({ content }: { content: PolicyContent }) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="rounded-2xl border border-gold/20 bg-obsidian/40 p-6 sm:p-10">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-gold sm:text-4xl">
          {content.title}
        </h1>
        <p className="mt-3 text-sandstone/70">{content.description}</p>
        <p className="mt-4 inline-flex items-center gap-2 text-xs text-sandstone/50">
          <CalendarDays className="size-4" aria-hidden />
          {content.updated}
        </p>

        <div className="mt-10 space-y-10 border-t border-sandstone/10 pt-8">
          {content.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-heading text-lg font-semibold tracking-tight text-gold">
                {section.heading}
              </h2>
              <div className="mt-3 space-y-3">
                {section.paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-sm leading-relaxed text-sandstone/80"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}