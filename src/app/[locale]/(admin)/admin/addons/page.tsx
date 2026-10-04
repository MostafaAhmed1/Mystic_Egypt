import type { Metadata } from "next";
import { AdminAddonsClient } from "@/app/[locale]/(admin)/admin/addons/addons-client";
import { listAdminAddons } from "@/features/admin/service";

export const metadata: Metadata = {
  title: "Add-ons",
};

export default async function AdminAddonsPage() {
  const addons = await listAdminAddons();

  return <AdminAddonsClient initialAddons={addons} />;
}
