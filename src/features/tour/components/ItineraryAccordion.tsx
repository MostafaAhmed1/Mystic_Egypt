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
      {itinerary.map((day) => (
        <AccordionItem key={day.id} value={day.id}>
          <AccordionTrigger>
            <span className="mr-3 inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-primary/10 px-1.5 text-xs font-semibold text-primary">
              {t("tours.day", "Day")} {day.day_number}
            </span>
            <span className="flex-1">{day.title}</span>
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-muted-foreground">{day.description}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
