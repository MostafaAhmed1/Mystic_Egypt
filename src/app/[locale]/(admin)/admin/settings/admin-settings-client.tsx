"use client";

import { useTranslation } from "react-i18next";
import { TwoFactorSettings } from "@/features/admin/components/TwoFactorSettings";

interface AdminSettingsClientProps {
  admin: {
    name: string;
    email: string;
    role: string;
    email_verified: boolean;
  };
}

export function AdminSettingsClient({ admin }: AdminSettingsClientProps) {
  const { t } = useTranslation("common");

  return (
    <div className="mx-auto max-w-2xl flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("admin.settings")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("admin.manageAccountSettings")}
        </p>
      </div>

      {/* Account Info */}
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">{t("admin.account")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">{t("profile.name")}</p>
            <p className="font-medium">{admin.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("admin.email")}</p>
            <p className="font-medium">{admin.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("admin.role")}</p>
            <p className="font-medium">{admin.role}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t("admin.emailVerified")}</p>
            <p className="font-medium">{admin.email_verified ? t("common.yes") : t("common.no")}</p>
          </div>
        </div>
      </div>

      {/* 2FA Settings */}
      <TwoFactorSettings />
    </div>
  );
}
