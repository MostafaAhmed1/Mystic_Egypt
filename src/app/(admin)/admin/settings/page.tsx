import { requireAdmin } from "@/core/lib/session";
import { AdminSettingsClient } from "@/app/(admin)/admin/settings/admin-settings-client";

export const metadata = {
  title: "Admin Settings",
};

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();

  return <AdminSettingsClient admin={admin} />;
}
