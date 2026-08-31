import { requireAdmin } from "@/core/lib/session";
import { AdminNav } from "@/features/admin/components/AdminNav";
import { SignOutButton } from "@/shared/components/sign-out-button";

export const metadata = {
  title: "Admin",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row">
      <aside className="md:w-60 md:shrink-0">
        <div className="flex flex-col gap-6 md:sticky md:top-8">
          <div className="flex items-center justify-between rounded-2xl border bg-card p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Admin
                </span>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
            <SignOutButton className="ml-2 h-9 shrink-0" />
          </div>
          <AdminNav />
        </div>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
