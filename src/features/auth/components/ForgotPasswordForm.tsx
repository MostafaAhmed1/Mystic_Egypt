"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { forgotPasswordAction } from "@/features/auth/actions";
import { SubmitButton } from "@/features/auth/components/SubmitButton";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useLocale } from "@/shared/hooks/use-locale";

export function ForgotPasswordForm() {
  const { t } = useTranslation("common");
  const { href } = useLocale();
  const [state, formAction] = useActionState(forgotPasswordAction, undefined);

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
            <Mail className="size-6 text-gold" />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-wider text-obsidian">
            {t("auth.resetTitle")}
          </h1>
          <p className="mt-2 text-sm text-obsidian/50">
            {t("auth.resetDescription")}
          </p>
          <div className="mx-auto mt-3 h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>

        <form action={formAction} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
            {state?.errors?.email && (
              <p className="rounded-lg bg-terracotta/10 px-4 py-3 text-sm font-medium text-terracotta">
                {state.errors.email}
              </p>
            )}
          </div>

          {state?.message && (
            <p className="rounded-lg bg-sand/30 px-4 py-3 text-sm text-obsidian/60">
              {state.message}
            </p>
          )}

          <SubmitButton
            pendingText={t("auth.sending", "Sending...")}
            className="w-full bg-gold text-obsidian font-semibold shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:bg-gold-light hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] transition-all duration-300"
          >
            {t("auth.sendResetCode")}
          </SubmitButton>
        </form>

        {state?.ok && (
          <div className="mt-4 text-center text-sm">
            <Link
              href={href("/reset-password")}
              className="font-medium text-gold underline underline-offset-4 hover:text-gold-light transition-colors"
            >
              {t("auth.haveCode")}
            </Link>
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-sandstone/60">
        {t("auth.rememberedIt")}{" "}
        <Link
          href={href("/login")}
          className="font-medium text-gold underline underline-offset-4 hover:text-gold-light transition-colors"
        >
          {t("auth.signIn")}
        </Link>
      </p>
    </motion.div>
  );
}
