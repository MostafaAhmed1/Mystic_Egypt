"use client";

import { useTranslation } from "react-i18next";
import { Star, Quote } from "lucide-react";
import { ScrollReveal } from "@/shared/components/ScrollReveal";

const testimonials = [
  {
    id: 1,
    name: "Sarah Mitchell",
    location: "London, UK",
    rating: 5,
    text: "An absolutely magical experience! The pyramids tour exceeded all our expectations. Our guide was incredibly knowledgeable and made history come alive.",
    tour: "Pyramids of Giza Tour",
  },
  {
    id: 2,
    name: "Marco Rossi",
    location: "Milan, Italy",
    rating: 5,
    text: "The Nile cruise was the highlight of our Egypt trip. Waking up to the views of Luxor and Aswan was unforgettable. Mystic Egypt made everything seamless.",
    tour: "Nile Cruise Experience",
  },
  {
    id: 3,
    name: "Emma Thompson",
    location: "Manchester, UK",
    rating: 5,
    text: "From the moment we landed in Cairo, everything was perfectly organized. The private transfers, the hotel, the tours — all top quality. Highly recommended!",
    tour: "Egypt Explorer Package",
  },
  {
    id: 4,
    name: "James Wilson",
    location: "Sydney, Australia",
    rating: 5,
    text: "The Red Sea diving trip was incredible. Crystal clear waters, beautiful coral reefs, and professional guides. We will definitely book again!",
    tour: "Red Sea Diving Adventure",
  },
];

export function TestimonialsSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-obsidian py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <ScrollReveal className="mb-12 text-center">
          <h2 className="font-heading text-2xl font-bold tracking-wider text-white sm:text-3xl">
            {t("testimonials.title")}
          </h2>
          <p className="mt-3 text-sandstone/60">
            {t("testimonials.subtitle")}
          </p>
        </ScrollReveal>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((testimonial, i) => (
            <ScrollReveal key={testimonial.id} delay={i * 0.1}>
              <TestimonialCard testimonial={testimonial} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({
  testimonial,
}: {
  testimonial: (typeof testimonials)[number];
}) {
  return (
    <div className="group relative rounded-2xl border border-gold/10 bg-charcoal p-6 transition-all duration-500 hover:border-gold/30 hover:shadow-[0_8px_40px_rgba(212,175,55,0.1)]">
      {/* Quote icon */}
      <div className="mb-4 flex items-center justify-between">
        <Quote className="size-8 text-gold/20" aria-hidden />
        <div className="flex items-center gap-1">
          {Array.from({ length: testimonial.rating }).map((_, j) => (
            <Star key={j} className="size-4 fill-gold text-gold" aria-hidden />
          ))}
        </div>
      </div>

      {/* Text */}
      <p className="mb-6 text-sm leading-relaxed text-sandstone/70">
        &ldquo;{testimonial.text}&rdquo;
      </p>

      {/* Author */}
      <div className="border-t border-gold/10 pt-4">
        <p className="font-heading text-sm font-semibold tracking-wide text-white">
          {testimonial.name}
        </p>
        <p className="mt-1 text-xs text-sandstone/50">{testimonial.location}</p>
        <p className="mt-2 text-xs font-medium text-gold/80">{testimonial.tour}</p>
      </div>
    </div>
  );
}
