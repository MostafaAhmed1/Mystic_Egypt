"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/shared/components/ui/button";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <Button
      variant="outline"
      className={className}
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Sign out
    </Button>
  );
}
