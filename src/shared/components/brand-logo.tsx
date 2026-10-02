import Link from "next/link";

export function BrandLogo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className="group inline-flex items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="Mystic Egypt"
        width={160}
        height={48}
        className={className ?? "h-14 w-auto transition-all duration-300 group-hover:opacity-80"}
      />
    </Link>
  );
}
