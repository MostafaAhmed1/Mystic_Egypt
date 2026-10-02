"use client";

import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import type { ItineraryDto } from "@/features/tour/types";

export function ItineraryAccordion({ itinerary }: { itinerary: ItineraryDto[] }) {
  const { t } = useTranslation("common");
  return (
    <Accordion className="w-full">
      {itinerary.map((day, index) => (
        <AccordionItem key={day.id} value={day.id} className="group border-0">
          <div className="relative flex gap-4">
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
              {/* Gold dot */}
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-gold bg-gold/10 transition-all duration-300 group-data-[state=open]:bg-gold group-data-[state=open]:shadow-[0_0_12px_rgba(212,175,55,0.4)]">
                <span className="text-xs font-bold text-gold group-data-[state=open]:text-obsidian">
                  {day.day_number}
                </span>
              </div>
              {/* Connecting line */}
              {index < itinerary.length - 1 && (
                <div className="w-px flex-1 bg-gradient-to-b from-gold/40 to-gold/10" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-2">
              <AccordionTrigger className="py-3 hover:no-underline">
                <span className="font-heading text-base font-semibold tracking-wide text-obsidian group-data-[state=open]:text-gold">
                  {day.title}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="pb-2 leading-relaxed text-obsidian/50">{day.description}</p>
              </AccordionContent>
            </div>
          </div>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
