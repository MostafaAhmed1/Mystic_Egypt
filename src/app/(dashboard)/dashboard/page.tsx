import { requireUser } from "@/core/lib/session";
import { SignOutButton } from "@/shared/components/sign-out-button";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Hello, {user.name}</h1>
        <SignOutButton />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        This is your dashboard. Bookings, itinerary, and preferences will appear here in a
        later milestone.
      </p>
    </main>
  );
}
