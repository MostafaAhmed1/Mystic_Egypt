"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { registerAction } from "@/features/auth/actions";
import { SubmitButton } from "@/features/auth/components/SubmitButton";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useLocale } from "@/shared/hooks/use-locale";

export function RegisterForm() {
  const { t } = useTranslation("common");
  const { href } = useLocale();
  const [state, formAction] = useActionState(registerAction, undefined);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="rounded-2xl border border-gold/10 bg-white p-8 shadow-[0_4px_30px_rgba(0,0,0,0.06)]">
        <div className="mb-6 text-center">
          <h1 className="font-heading text-2xl font-bold tracking-wider text-obsidian">
            {t("auth.createAnAccount")}
          </h1>
          <div className="mx-auto mt-3 h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>

        <form action={formAction} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">{t("auth.name")}</Label>
            <Input id="name" name="name" type="text" autoComplete="name" required />
            {state?.errors?.name && (
              <p className="rounded-lg bg-terracotta/10 px-4 py-3 text-sm font-medium text-terracotta">
                {state.errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
            {state?.errors?.email && (
              <p className="rounded-lg bg-terracotta/10 px-4 py-3 text-sm font-medium text-terracotta">
                {state.errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
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

          {state?.message && (
            <p className="rounded-lg bg-sand/30 px-4 py-3 text-sm text-obsidian/60">
              {state.message}
            </p>
          )}

          <SubmitButton
            pendingText={t("auth.creatingAccount", "Creating account...")}
            className="w-full bg-gold text-obsidian font-semibold shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:bg-gold-light hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] transition-all duration-300"
          >
            {t("auth.createAccount")}
          </SubmitButton>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-sandstone/60">
        {t("auth.alreadyHaveAccount")}{" "}
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
