"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/shared/components/ui/button";
import { useLocale } from "@/shared/hooks/use-locale";

export function SignOutButton({ className }: { className?: string }) {
  const { href } = useLocale();

  return (
    <Button
      variant="outline"
      className={className}
      onClick={() => signOut({ callbackUrl: href("/login") })}
    >
      Sign out
    </Button>
  );
}
