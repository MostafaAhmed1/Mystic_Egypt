"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/shared/components/ui/button";

export function SubmitButton({
  children,
  pendingText = "Please wait...",
  className,
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className={className ?? "w-full"}>
      {pending ? pendingText : children}
    </Button>
  );
}
