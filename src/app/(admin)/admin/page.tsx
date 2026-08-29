import { requireAdmin } from "@/core/lib/session";
import { SignOutButton } from "@/shared/components/sign-out-button";

export const metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  const user = await requireAdmin();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Panel</h1>
        <SignOutButton />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Welcome, {user.name}. Tour management, bookings, and analytics will appear here in a
        later milestone.
      </p>
    </main>
  );
}
