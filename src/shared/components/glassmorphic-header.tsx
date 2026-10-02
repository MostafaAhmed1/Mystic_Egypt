"use client";

import { useState, useEffect } from "react";
import { cn } from "@/core/utils";

export function GlassmorphicHeader({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "w-full transition-all duration-500",
        scrolled
          ? "border-b border-gold/20 bg-sandstone/90 shadow-[0_4px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl"
          : "border-b border-transparent bg-sandstone/70 backdrop-blur-md"
      )}
    >
      {children}
    </header>
  );
}
