import type { Metadata } from "next";
import { AdminCustomersClient } from "@/app/[locale]/(admin)/admin/customers/customers-client";
import { listCustomers } from "@/features/admin/service";

export const metadata: Metadata = {
  title: "Customers",
};

export default async function AdminCustomersPage() {
  const customers = await listCustomers();

  return <AdminCustomersClient initialCustomers={customers} />;
}
