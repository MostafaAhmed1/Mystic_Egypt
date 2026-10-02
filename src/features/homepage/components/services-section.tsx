"use client";

import { useTranslation } from "react-i18next";
import { Building2, CarFront, Compass, Plane, type LucideIcon } from "lucide-react";
import type { HomepageService, HomepageServiceIcon } from "@/features/homepage/types";
import { ScrollReveal } from "@/shared/components/ScrollReveal";

const SERVICE_ICONS: Record<HomepageServiceIcon, LucideIcon> = {
  hotel: Building2,
  plane: Plane,
  car: CarFront,
  compass: Compass,
};

export function ServicesSection({ services }: { services: HomepageService[] }) {
  const { t } = useTranslation("common");

  if (services.length === 0) return null;

  return (
    <section id="services" className="overflow-hidden bg-obsidian py-20 text-white" aria-labelledby="services-title">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <ScrollReveal className="mb-10 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold">{t("homepage.servicesEyebrow", "Travel services")}</p>
          <h2 id="services-title" className="font-heading text-3xl font-bold tracking-wider sm:text-4xl">{t("homepage.servicesTitle", "Everything you need for your journey")}</h2>
        </ScrollReveal>
      </div>
      <div className="services-marquee" aria-label={t("homepage.servicesTitle", "Services")}>
        <div className="services-marquee__track">
          <ServiceGroup services={services} />
          <div aria-hidden="true" className="services-marquee__group">
            <ServiceGroup services={services} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceGroup({ services }: { services: HomepageService[] }) {
  return (
    <div className="services-marquee__group">
      {services.map((service) => {
        const Icon = SERVICE_ICONS[service.icon] ?? Compass;
        return (
          <article key={service.id} className="services-marquee__item">
            <div className="mb-5 flex size-12 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold">
              <Icon className="size-6" aria-hidden />
            </div>
            <h3 className="font-heading text-lg font-semibold text-white">{service.name}</h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-sandstone/65">{service.description}</p>
            <span aria-hidden className="mt-5 block h-px w-10 bg-gold/40" />
          </article>
        );
      })}
    </div>
  );
}
