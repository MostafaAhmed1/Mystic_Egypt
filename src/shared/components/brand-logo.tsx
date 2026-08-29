import Link from "next/link";
import { Pyramid } from "lucide-react";

export function BrandLogo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2">
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Pyramid className="size-5" aria-hidden />
      </span>
      <span className="font-heading text-lg font-semibold leading-none tracking-tight">
        Mystic<span className="text-primary">Egypt</span>
      </span>
    </Link>
  );
}
