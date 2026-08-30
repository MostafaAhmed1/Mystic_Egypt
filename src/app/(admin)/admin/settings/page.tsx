import { requireAdmin } from "@/core/lib/session";
import { TwoFactorSettings } from "@/features/admin/components/TwoFactorSettings";

export const metadata = {
  title: "Admin Settings",
};

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();

  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your admin account settings and security.
        </p>
      </div>

      {/* Account Info */}
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Account</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{admin.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{admin.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Role</p>
            <p className="font-medium">{admin.role}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email Verified</p>
            <p className="font-medium">{admin.email_verified ? "Yes" : "No"}</p>
          </div>
        </div>
      </div>

      {/* 2FA Settings */}
      <TwoFactorSettings />
    </div>
  );
}
