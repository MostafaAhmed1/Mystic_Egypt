import { requireUser } from "@/core/lib/session";
import { DashboardNav } from "@/features/dashboard/components/DashboardNav";
import { SignOutButton } from "@/shared/components/sign-out-button";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row">
      <aside className="md:w-60 md:shrink-0">
        <div className="flex flex-col gap-6 md:sticky md:top-8">
          <div className="flex items-center justify-between rounded-2xl border bg-card p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <SignOutButton className="ml-2 h-9 shrink-0" />
          </div>
          <DashboardNav />
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
