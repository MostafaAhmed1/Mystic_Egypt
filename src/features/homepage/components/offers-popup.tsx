"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Gift,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { cn, formatCurrency } from "@/core/utils";
import type { TourSummary } from "@/features/tour/types";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { useLocale } from "@/shared/hooks/use-locale";

const SEEN_STORAGE_KEY = "me_offers_popup_seen";
const POPUP_DELAY_MS = 1800;
const AUTO_PLAY_MS = 4500;

/* Gold-dominant party palette — harmonizes with the luxury theme. */
const CONFETTI_COLORS = [
  "#D4AF37",
  "#E23D28",
  "#D4AF37",
  "#2E9E5B",
  "#7C4DBE",
  "#D4AF37",
  "#2F80ED",
  "#F5B301",
];

interface ConfettiPiece {
  x: number;
  size: number;
  color: string;
  dur: number;
  delay: number;
  sway: number;
  round: boolean;
}

/* Deterministic 0..1 hash — keeps render pure (no Math.random, which React
   Compiler rejects during render). Same lively layout on every open. */
function hash01(n: number): number {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function confettiPiece(i: number): ConfettiPiece {
  const dur = 5 + hash01(i + 101) * 5;
  return {
    x: hash01(i + 1) * 100,
    size: 4 + hash01(i + 211) * 6,
    color:
      CONFETTI_COLORS[
        Math.floor(hash01(i + 307) * CONFETTI_COLORS.length) %
          CONFETTI_COLORS.length
      ],
    dur,
    delay: -hash01(i + 419) * dur,
    sway: (hash01(i + 523) * 2 - 1) * 55,
    round: hash01(i + 631) < 0.3,
  };
}

const CONFETTI_PIECES: ConfettiPiece[] = Array.from({ length: 48 }, (_, i) =>
  confettiPiece(i),
);

/**
 * Full-viewport confetti rain rendered inside the dialog backdrop (behind the
 * card, above the blur). Pure CSS animation — negative delays keep the rain
 * mid-fall from the first frame; killed by prefers-reduced-motion globally.
 */
function ConfettiRain() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {CONFETTI_PIECES.map((piece, i) => (
        <span
          key={i}
          className="absolute top-0 will-change-transform"
          style={
            {
              left: `${piece.x}%`,
              width: piece.round ? piece.size : Math.max(3, piece.size * 0.55),
              height: piece.round ? piece.size : piece.size * 1.7,
              background: piece.color,
              borderRadius: piece.round ? "9999px" : "1.5px",
              opacity: 0,
              animation: `confettiFall ${piece.dur}s linear ${piece.delay}s infinite`,
              "--confetti-sway": `${piece.sway}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/**
 * First-visit-per-session offers popup. Complements (never replaces) the hero
 * marquee bar and the #offers homepage section. Cards link straight to the
 * tour pages; closing via the X (or overlay/Escape) marks the session as seen.
 */
export function OffersPopup({ offers }: { offers: TourSummary[] }) {
  const { t } = useTranslation();
  const { locale, href } = useLocale();
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  /* Turns false permanently on the first manual navigation (arrows, dots,
     swipe or arrow keys) — per spec the auto-advance never resumes. */
  const [autoOn, setAutoOn] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isRtl = locale === "ar";

  useEffect(() => {
    if (offers.length === 0) return;
    try {
      if (sessionStorage.getItem(SEEN_STORAGE_KEY)) return;
    } catch {
      // Storage unavailable (private mode etc.) — still show once per mount.
    }
    const timer = setTimeout(() => setOpen(true), POPUP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [offers.length]);

  useEffect(() => {
    if (!open || !autoOn || offers.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % offers.length);
    }, AUTO_PLAY_MS);
    return () => clearInterval(id);
  }, [open, autoOn, offers.length]);

  if (offers.length === 0) return null;

  function goTo(next: number, manual: boolean) {
    const n = offers.length;
    setIndex(((next % n) + n) % n);
    if (manual) setAutoOn(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setIndex(0);
      setAutoOn(true);
    }
    if (!nextOpen) {
      try {
        sessionStorage.setItem(SEEN_STORAGE_KEY, "1");
      } catch {
        // Ignore storage failures — worst case the popup can reappear.
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const forward = (e.key === "ArrowRight") !== isRtl;
    goTo(index + (forward ? 1 : -1), true);
  }

  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX.current;
    const dy = touch.clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) < 50 || Math.abs(dx) <= Math.abs(dy)) return;
    const forward = isRtl ? dx > 0 : dx < 0;
    goTo(index + (forward ? 1 : -1), true);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/55"
        overlayChildren={<ConfettiRain />}
        className="max-h-[85vh] overflow-hidden p-0 sm:max-w-2xl"
      >
        {/* Signature: same gold shimmer hairline as the hero offers bar */}
        <div className="animate-shimmer h-0.5 w-full shrink-0" aria-hidden />

        <DialogClose
          render={
            <button
              type="button"
              aria-label={t("offers.popup.close", "Close offers")}
              className="absolute end-3 top-4 z-10 inline-flex size-9 items-center justify-center rounded-full border border-gold/40 bg-white text-obsidian shadow-sm transition-all duration-200 hover:border-gold hover:bg-gold hover:text-obsidian focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
            />
          }
        >
          <X className="size-5" aria-hidden />
        </DialogClose>

        <div className="overflow-y-auto px-6 pb-6 pt-5 sm:px-7">
          <DialogHeader className="gap-1.5 pe-10 text-start">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-dark">
              <Gift className="size-3.5 shrink-0 animate-bob text-gold" aria-hidden />
              {t("offers.popup.eyebrow", "Limited-time deals")}
            </p>
            <DialogTitle className="flex items-center gap-2 font-heading text-2xl font-bold tracking-wide text-obsidian sm:text-3xl">
              {t("offers.popup.title", "Hot offers")}
              <Sparkles
                className="size-4 shrink-0 animate-pulse-slow text-gold sm:size-5"
                aria-hidden
              />
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-obsidian/60">
              {t(
                "offers.popup.subtitle",
                "Handpicked savings on Egypt's most loved experiences.",
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5">
            <div
              role="region"
              aria-roledescription="carousel"
              aria-label={t("offers.popup.title", "Hot offers")}
              className="relative touch-pan-y overflow-hidden rounded-xl border border-gold/15 bg-sand/40"
              onKeyDown={handleKeyDown}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
                style={{
                  transform: `translateX(${isRtl ? index * 100 : -index * 100}%)`,
                }}
              >
                {offers.map((tour, i) => (
                  <Link
                    key={tour.id}
                    href={href(`/tours/${tour.slug}`)}
                    onClick={() => handleOpenChange(false)}
                    inert={i !== index}
                    className="group block w-full shrink-0 focus-visible:outline-none"
                  >
                    <div className="relative h-44 bg-obsidian sm:h-52">
                      {tour.primary_image ? (
                        <Image
                          src={tour.primary_image}
                          alt={tour.title}
                          fill
                          sizes="(min-width: 640px) 672px, calc(100vw - 3rem)"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-gradient-to-br from-obsidian via-obsidian/90 to-gold/20">
                          <Tag className="size-10 text-gold/70" aria-hidden />
                        </div>
                      )}
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-obsidian/40 to-transparent"
                        aria-hidden
                      />
                      <span className="animate-pulse absolute top-3 start-3 rounded-full bg-gold px-3 py-1 text-[11px] font-bold tracking-wider text-obsidian shadow-[0_4px_16px_rgba(212,175,55,0.4)]">
                        {t("offers.badge", "OFFER")}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5 p-4 sm:p-5">
                      <h3 className="font-heading text-lg font-semibold tracking-wide text-obsidian transition-colors duration-300 group-hover:text-gold-dark sm:text-xl">
                        {tour.title}
                      </h3>
                      <p className="line-clamp-2 text-sm leading-relaxed text-obsidian/55">
                        {tour.description}
                      </p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs text-obsidian/50">
                          <Clock className="size-3.5" aria-hidden />
                          {tour.duration ?? "—"}
                        </span>
                        <span className="font-heading text-lg font-bold text-gold">
                          {formatCurrency(tour.base_price, tour.currency)}
                        </span>
                      </div>
                      <span className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-gold transition-colors duration-300 group-hover:text-gold-dark">
                        {t("offers.cta", "View offer")}
                        <ArrowRight
                          className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                          aria-hidden
                        />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {offers.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label={t("offers.popup.prev", "Previous offer")}
                    onClick={() => goTo(index - 1, true)}
                    className="absolute start-2 top-[5.5rem] z-10 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-white/90 text-obsidian shadow-md transition-all duration-200 hover:border-gold hover:bg-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 sm:top-[6.5rem]"
                  >
                    <ChevronLeft className="size-5 rtl:-scale-x-100" aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label={t("offers.popup.next", "Next offer")}
                    onClick={() => goTo(index + 1, true)}
                    className="absolute end-2 top-[5.5rem] z-10 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-white/90 text-obsidian shadow-md transition-all duration-200 hover:border-gold hover:bg-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 sm:top-[6.5rem]"
                  >
                    <ChevronRight className="size-5 rtl:-scale-x-100" aria-hidden />
                  </button>
                </>
              )}
            </div>

            {offers.length > 1 && (
              <div className="mt-3 flex items-center justify-center gap-1">
                {offers.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={t("offers.popup.goTo", {
                      defaultValue: "Go to offer {{n}}",
                      n: i + 1,
                    })}
                    aria-current={i === index || undefined}
                    onClick={() => goTo(i, true)}
                    className="group flex h-4 items-center px-0.5"
                  >
                    <span
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        i === index
                          ? "w-6 bg-gold"
                          : "w-1.5 bg-obsidian/25 group-hover:bg-obsidian/50",
                      )}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Static confetti accents in the card's bottom corners (inside the
            overflow-hidden bounds; purely decorative). */}
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-2 start-4 flex items-end gap-1"
        >
          <span className="size-1.5 rotate-[15deg] rounded-[1.5px] bg-[#E23D28]" />
          <span className="size-1.5 -translate-y-2 rounded-full bg-gold" />
          <span className="size-1.5 -translate-y-1 rotate-45 rounded-[1.5px] bg-[#2E9E5B]" />
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-3 end-5 flex items-end gap-1"
        >
          <span className="size-1.5 rotate-45 rounded-[1.5px] bg-[#7C4DBE]" />
          <span className="size-1 -translate-y-1 rounded-full bg-[#F5B301]" />
          <span className="size-1.5 rotate-[20deg] rounded-[1.5px] bg-[#2F80ED]" />
        </span>
      </DialogContent>
    </Dialog>
  );
}
