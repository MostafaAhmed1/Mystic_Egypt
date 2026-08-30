"use client";

import { useTranslation } from "react-i18next";
import { MapPin, ShieldCheck } from "lucide-react";
import {
  DeleteAccountForm,
  NotificationsToggle,
  PasswordForm,
  ProfileForm,
} from "@/features/dashboard/components/ProfileForms";
import { formatDate } from "@/core/utils";
import type { ProfileDto } from "@/features/dashboard/service";

export function DashboardProfileClient({ profile }: { profile: ProfileDto }) {
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl font-semibold">{t("profile.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("profile.subtitle")}
        </p>
      </div>

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="font-heading mb-1 text-base font-semibold">
          {t("profile.personalInfo")}
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">
          {t("profile.memberSince")} {formatDate(profile.created_at)}
        </p>
        <ProfileForm
          profile={{
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            email_verified: profile.email_verified,
          }}
        />
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <h2 className="font-heading mb-4 text-base font-semibold">
          {t("profile.changePassword")}
        </h2>
        <PasswordForm />
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <MapPin className="size-4 text-muted-foreground" aria-hidden />
          <h2 className="font-heading text-base font-semibold">
            {t("profile.notifications")}
          </h2>
        </div>
        <NotificationsToggle enabled={profile.notifications_enabled} />
      </section>

      <section className="rounded-2xl border border-rose-200 bg-card p-5 dark:border-rose-500/30">
        <div className="mb-3 flex items-center gap-2">
          <ShieldCheck className="size-4 text-muted-foreground" aria-hidden />
          <h2 className="font-heading text-base font-semibold text-rose-600 dark:text-rose-400">
            {t("profile.deleteAccount", "Delete account")}
          </h2>
        </div>
        <DeleteAccountForm />
      </section>
    </div>
  );
}
