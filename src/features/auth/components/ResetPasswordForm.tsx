"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { KeyRound } from "lucide-react";
import { resetPasswordAction } from "@/features/auth/actions";
import { SubmitButton } from "@/features/auth/components/SubmitButton";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useLocale } from "@/shared/hooks/use-locale";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const { t } = useTranslation("common");
  const { href } = useLocale();
  const initialEmail = searchParams.get("email") ?? "";
  const [state, formAction] = useActionState(resetPasswordAction, undefined);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="rounded-2xl border border-gold/10 bg-white p-8 shadow-[0_4px_30px_rgba(0,0,0,0.06)]">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-gold/10">
            <KeyRound className="size-6 text-gold" />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-wider text-obsidian">
            {t("auth.chooseNewPassword")}
          </h1>
          <p className="mt-2 text-sm text-obsidian/50">
            {t("auth.chooseDescription")}
          </p>
          <div className="mx-auto mt-3 h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>

        <form action={formAction} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={initialEmail}
              required
            />
            {state?.errors?.email && (
              <p className="rounded-lg bg-terracotta/10 px-4 py-3 text-sm font-medium text-terracotta">
                {state.errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">{t("auth.resetCode")}</Label>
            <Input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              placeholder="000000"
              required
            />
            {state?.errors?.code && (
              <p className="rounded-lg bg-terracotta/10 px-4 py-3 text-sm font-medium text-terracotta">
                {state.errors.code}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.newPassword")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />
            {state?.errors?.password && (
              <p className="rounded-lg bg-terracotta/10 px-4 py-3 text-sm font-medium text-terracotta">
                {state.errors.password}
              </p>
            )}
          </div>

          <SubmitButton
            pendingText={t("auth.resetting", "Resetting...")}
            className="w-full bg-gold text-obsidian font-semibold shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:bg-gold-light hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] transition-all duration-300"
          >
            {t("auth.resetPassword")}
          </SubmitButton>
        </form>

        <div className="mt-4 text-center text-sm">
          <Link
            href={href("/forgot-password")}
            className="font-medium text-gold underline underline-offset-4 hover:text-gold-light transition-colors"
          >
            {t("auth.requestNewCode")}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
