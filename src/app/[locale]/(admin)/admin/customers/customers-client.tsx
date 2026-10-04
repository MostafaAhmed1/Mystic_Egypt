"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { CalendarDays, KeyRound, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { formatCurrency } from "@/core/utils";
import { Button, buttonVariants } from "@/shared/components/ui/button";
import { useLocale } from "@/shared/hooks/use-locale";

interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  email_verified: boolean;
  created_at: Date | string;
  booking_count: number;
  total_spent: number;
}

type AdminCustomersClientProps = {
  initialCustomers: CustomerItem[];
};

function responseError(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string") {
    return payload.error;
  }
  return fallback;
}

export function AdminCustomersClient({ initialCustomers }: AdminCustomersClientProps) {
  const { t } = useTranslation("common");
  const { href } = useLocale();
  const [sendingId, setSendingId] = useState<string | null>(null);

  async function sendResetCode(customer: CustomerItem) {
    if (
      !window.confirm(
        t(
          "admin.sendResetCodeConfirm",
          `Send a password-reset code to ${customer.email}?`,
        ),
      )
    ) {
      return;
    }

    setSendingId(customer.id);
    const response = await fetch(API_ENDPOINTS.ADMIN.CUSTOMERS.RESET_PASSWORD(customer.id), {
      method: "POST",
    });
    const payload: unknown = await response.json().catch(() => null);
    setSendingId(null);

    if (!response.ok) {
      toast.error(responseError(payload, t("admin.sendResetCodeFailed", "Could not send the reset code.")));
      return;
    }
    toast.success(
      t("admin.sendResetCodeSent", "Reset code sent — the customer can set a new password from the reset-password page."),
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("admin.customers", "Customers")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("admin.manageCustomers", "Registered visitors and their booking activity. View-only.")}
        </p>
      </div>

      <section className="rounded-2xl border bg-card p-5">
        <div className="mb-5">
          <h2 className="text-lg font-semibold">{t("admin.allCustomers", "All customers")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("admin.customersDescription", "Open a customer's bookings or email them a password-reset code.")}
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-start text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">{t("admin.customer", "Customer")}</th>
                <th className="px-4 py-3 font-medium">{t("common.phone", "Phone")}</th>
                <th className="px-4 py-3 font-medium">{t("admin.joined", "Joined")}</th>
                <th className="px-4 py-3 font-medium">{t("admin.bookings", "Bookings")}</th>
                <th className="px-4 py-3 font-medium">{t("admin.totalSpent", "Total spent")}</th>
                <th className="px-4 py-3 text-end font-medium">{t("common.actions", "Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {initialCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    {t("admin.noCustomers", "No registered customers yet.")}
                  </td>
                </tr>
              ) : (
                initialCustomers.map((customer) => (
                  <tr key={customer.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 font-medium">
                            {customer.name}
                            {customer.email_verified && (
                              <MailCheck className="size-3.5 text-green-600" aria-label={t("admin.verified", "Verified")} />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{customer.phone ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(customer.created_at).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={customer.booking_count > 0 ? "font-medium" : "text-muted-foreground"}>
                        {customer.booking_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {customer.booking_count > 0
                        ? formatCurrency(customer.total_spent, "USD")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={href(`/admin/bookings?search=${encodeURIComponent(customer.email)}`)}
                          className={buttonVariants({ variant: "ghost", size: "icon" })}
                          aria-label={t("admin.viewBookings", "View bookings")}
                          title={t("admin.viewBookings", "View bookings")}
                        >
                          <CalendarDays aria-hidden />
                        </Link>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => sendResetCode(customer)}
                          disabled={sendingId === customer.id}
                          aria-label={t("admin.sendResetCode", "Send password-reset code")}
                          title={t("admin.sendResetCode", "Send password-reset code")}
                        >
                          <KeyRound aria-hidden />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
