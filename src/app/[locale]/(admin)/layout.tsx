import { requireAdmin } from "@/core/lib/session";
import { AdminNav } from "@/features/admin/components/AdminNav";
import { SignOutButton } from "@/shared/components/sign-out-button";
import { BrandLogo } from "@/shared/components/brand-logo";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: true },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  const initials = user.name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row">
      <aside className="md:w-64 md:shrink-0">
        <div className="flex flex-col gap-4 md:sticky md:top-8">
          <div className="overflow-hidden rounded-2xl border border-gold/15 bg-white shadow-[0_2px_20px_rgba(0,0,0,0.03)]">
            {/* Brand */}
            <div className="border-b border-gold/10 px-5 pb-4 pt-5">
              <BrandLogo href="/" className="h-9 w-auto" />
              <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-dark">
                Admin Panel
              </p>
            </div>

            {/* Navigation */}
            <div className="p-3">
              <AdminNav />
            </div>

            {/* Account footer — visually separated from navigation */}
            <div className="border-t border-gold/10 bg-sandstone/60 p-4">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-obsidian"
                >
                  {initials || "?"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <p className="min-w-0 truncate text-sm font-semibold text-obsidian">{user.name}</p>
                    <span className="shrink-0 rounded-full bg-gold/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-obsidian">
                      Admin
                    </span>
                  </div>
                  <p className="truncate text-xs text-obsidian/60">{user.email}</p>
                </div>
              </div>
              <SignOutButton className="mt-3 w-full" />
            </div>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
