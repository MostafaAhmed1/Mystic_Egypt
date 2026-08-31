import { requireUser } from "@/core/lib/session";
import { listUserInvoices } from "@/features/invoice/service";
import { DashboardInvoicesClient } from "@/app/[locale]/(dashboard)/dashboard/invoices/dashboard-invoices-client";

export const metadata = {
  title: "Invoices",
};

export default async function InvoicesPage() {
  const user = await requireUser();
  const invoices = await listUserInvoices(user.id);

  return <DashboardInvoicesClient invoices={invoices} />;
}
