"use client";

import Link from "next/link";
import { useLocale } from "@/shared/hooks/use-locale";
import { LanguageSwitcher } from "@/shared/components/language-switcher";
import { ArrowLeft } from "lucide-react";

export function AuthHeader() {
  const { href } = useLocale();

  return (
    <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-4 sm:px-6">
      <Link
        href={href("/")}
        className="group inline-flex items-center gap-2 text-sm text-sandstone transition-colors duration-300 hover:text-gold"
      >
        <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" aria-hidden />
        <span className="hidden sm:inline">Back to Home</span>
      </Link>

      <div className="flex items-center gap-3 text-sandstone">
        <LanguageSwitcher variant="dark" />
        <Link href={href("/")} className="transition-opacity duration-300 hover:opacity-80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Mystic Egypt" width={180} height={54} className="h-12 w-auto" />
        </Link>
      </div>
    </div>
  );
}
