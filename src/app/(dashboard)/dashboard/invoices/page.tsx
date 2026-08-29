import Link from "next/link";
import { FileText } from "lucide-react";
import { requireUser } from "@/core/lib/session";
import { listUserInvoices } from "@/features/invoice/service";
import { InvoicePDF } from "@/features/invoice/components/InvoicePDF";
import { formatCurrency, formatDate } from "@/core/utils";

export const metadata = {
  title: "Invoices",
};

export default async function InvoicesPage() {
  const user = await requireUser();
  const invoices = await listUserInvoices(user.id);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Invoices</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Download PDF invoices for your confirmed bookings.
        </p>
      </div>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card px-5 py-16 text-center">
          <FileText className="size-10 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">
            You have no invoices yet. Invoices are issued once a booking is
            confirmed.
          </p>
          <Link
            href="/tours"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Browse tours
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {invoices.map((inv) => (
            <li
              key={inv.id}
              className="flex flex-col gap-3 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {inv.booking.tour_title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Invoice {inv.invoice_number} · Issued{" "}
                  {formatDate(inv.issued_at)}
                </p>
                <p className="mt-0.5 text-sm font-medium">
                  {formatCurrency(inv.grandTotal, inv.booking.currency)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <InvoicePDF invoice={inv} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
