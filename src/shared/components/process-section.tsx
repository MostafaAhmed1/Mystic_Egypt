"use client";

import { useTranslation } from "react-i18next";
import { Search, Sliders, CreditCard, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/shared/components/ScrollReveal";

const steps = [
  {
    icon: Search,
    titleKey: "process.choose.title",
    descKey: "process.choose.description",
    number: "01",
  },
  {
    icon: Sliders,
    titleKey: "process.customize.title",
    descKey: "process.customize.description",
    number: "02",
  },
  {
    icon: CreditCard,
    titleKey: "process.book.title",
    descKey: "process.book.description",
    number: "03",
  },
  {
    icon: Sparkles,
    titleKey: "process.experience.title",
    descKey: "process.experience.description",
    number: "04",
  },
];

export function ProcessSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-sandstone-dark/50 py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <ScrollReveal className="mb-16 text-center">
          <h2 className="font-heading text-2xl font-bold tracking-wider text-obsidian sm:text-3xl">
            {t("process.title")}
          </h2>
        </ScrollReveal>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <ScrollReveal key={step.number} delay={i * 0.15}>
              <ProcessCard step={step} isLast={i === steps.length - 1} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessCard({
  step,
  isLast,
}: {
  step: (typeof steps)[number];
  isLast: boolean;
}) {
  const { t } = useTranslation();
  const Icon = step.icon;

  return (
    <div className="group relative">
      {/* Connector line */}
      {!isLast && (
        <div className="absolute top-10 left-[calc(50%+40px)] hidden h-0.5 w-[calc(100%-80px)] bg-gradient-to-r from-gold/40 to-gold/10 lg:block" />
      )}

      <div className="relative flex flex-col items-center text-center">
        {/* Number badge */}
        <div className="relative mb-6">
          <div className="flex size-20 items-center justify-center rounded-full border-2 border-gold/20 bg-white transition-all duration-500 group-hover:border-gold group-hover:gold-glow">
            <Icon className="size-8 text-gold transition-transform duration-500 group-hover:scale-110" aria-hidden />
          </div>
          <span className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full bg-gold text-xs font-bold text-obsidian">
            {step.number}
          </span>
        </div>

        {/* Text */}
        <h3 className="font-heading mb-2 text-lg font-semibold tracking-wider text-obsidian">
          {t(step.titleKey)}
        </h3>
        <p className="max-w-xs text-sm leading-relaxed text-obsidian/50">
          {t(step.descKey)}
        </p>
      </div>
    </div>
  );
}
