"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Wallet } from "lucide-react";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { useLocale } from "@/shared/hooks/use-locale";

export function TourSearchBar() {
  const router = useRouter();
  const { t } = useTranslation("common");
  const { href } = useLocale();
  const [query, setQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim());
    const queryString = params.toString();
    router.push(queryString ? href(`/tours?${queryString}`) : href("/tours"));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-2xl flex-col gap-2 rounded-2xl border bg-background/95 p-2 shadow-lg backdrop-blur sm:flex-row sm:items-center"
    >
      <label className="flex flex-1 items-center gap-2 px-2">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("tours.searchTours")}
          className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </label>
      <label className="flex items-center gap-2 border-t px-2 pt-1.5 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
        <Wallet className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <Input
          type="number"
          inputMode="numeric"
          min={0}
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          placeholder={t("tours.maxBudget", "Max budget (USD)")}
          className="h-9 w-36 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </label>
      <Button type="submit" size="lg" className="h-10 shrink-0 sm:ml-1">
        {t("tours.searchTours")}
      </Button>
    </form>
  );
}
