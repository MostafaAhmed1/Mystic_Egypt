"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Plus, ShieldCheck } from "lucide-react";
import { DeleteAdminButton } from "@/features/admin/components/AdminActions";
import { useLocale } from "@/shared/hooks/use-locale";

interface AdminItem {
  id: string;
  name: string;
  email: string;
  is_2fa_verified: boolean;
  created_at: Date | string;
}

interface AdminAdminsClientProps {
  admins: AdminItem[];
}

export function AdminAdminsClient({ admins }: AdminAdminsClientProps) {
  const { t } = useTranslation("common");
  const { href } = useLocale();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("admin.admins")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("admin.adminCount", { count: admins.length })}
          </p>
        </div>
        <Link
          href={href("/admin/admins/new")}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-4" />
          {t("admin.addAdmin")}
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">{t("admin.adminName")}</th>
                <th className="px-4 py-3 font-medium">{t("admin.email")}</th>
                <th className="px-4 py-3 font-medium">2FA</th>
                <th className="px-4 py-3 font-medium">{t("admin.joined")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {admin.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{admin.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{admin.email}</td>
                  <td className="px-4 py-3">
                    {admin.is_2fa_verified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
                        <ShieldCheck className="size-3" />
                        {t("admin.enabled")}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {new Date(admin.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <DeleteAdminButton adminId={admin.id} adminName={admin.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
