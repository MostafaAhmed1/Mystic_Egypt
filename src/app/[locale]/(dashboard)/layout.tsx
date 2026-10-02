import { requireUser } from "@/core/lib/session";
import { DashboardNav } from "@/features/dashboard/components/DashboardNav";
import { SignOutButton } from "@/shared/components/sign-out-button";
import { BrandLogo } from "@/shared/components/brand-logo";

export const metadata = {
  title: "Dashboard",
  robots: { index: false, follow: true },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row">
      <aside className="md:w-64 md:shrink-0">
        <div className="flex flex-col gap-4 md:sticky md:top-8">
          <div className="rounded-2xl border border-gold/10 bg-white p-5 shadow-[0_2px_20px_rgba(0,0,0,0.03)]">
            <div className="mb-4">
              <BrandLogo href="/" />
            </div>
            <div className="border-t border-gold/10 pt-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-obsidian">{user.name}</p>
                  <p className="truncate text-xs text-obsidian/40">{user.email}</p>
                </div>
                <SignOutButton className="ms-2 h-9 shrink-0" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-gold/10 bg-white p-3 shadow-[0_2px_20px_rgba(0,0,0,0.03)]">
            <DashboardNav />
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
