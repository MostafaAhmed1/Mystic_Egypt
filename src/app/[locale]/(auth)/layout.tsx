import type { ReactNode } from "react";
import type { Metadata } from "next";
import { AuthHeader } from "@/shared/components/auth-header";

export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center px-4 py-12">
      {/* Cinematic dark background */}
      <div className="absolute inset-0 bg-obsidian" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(212,175,55,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(31,58,147,0.06),transparent_40%)]" />
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_50px,rgba(212,175,55,0.03)_50px,rgba(212,175,55,0.03)_51px)]" />
      </div>
      <AuthHeader />
      <div className="relative z-10 flex w-full items-center justify-center">{children}</div>
    </div>
  );
}
