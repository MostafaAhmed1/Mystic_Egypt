"use client";

import { useActionState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import {
  verifyEmailAction,
  resendVerificationAction,
} from "@/features/auth/actions";
import { SubmitButton } from "@/features/auth/components/SubmitButton";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

export function VerifyEmailForm({ email }: { email: string }) {
  const { t } = useTranslation("common");
  const [verifyState, verifyAction] = useActionState(verifyEmailAction, undefined);
  const [resendState, resendAction] = useActionState(resendVerificationAction, undefined);

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
            <ShieldCheck className="size-6 text-gold" />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-wider text-obsidian">
            {t("auth.verifyTitle", "Verify your email")}
          </h1>
          <p className="mt-2 text-sm text-obsidian/50">
            {t("auth.verifyDescription", "We sent a 6-digit code to")}{" "}
            <span className="font-medium text-obsidian">{email}</span>.{" "}
            {t("auth.verifyEnter", "Enter it below to verify your account.")}
          </p>
          <div className="mx-auto mt-3 h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>

        <div className="space-y-4">
          <form action={verifyAction} className="space-y-4" noValidate>
            <input type="hidden" name="email" value={email} />
            <div className="space-y-2">
              <Label htmlFor="code">{t("auth.verificationCode", "Verification code")}</Label>
              <Input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                placeholder="000000"
                className="text-center text-lg tracking-[0.5em]"
                required
              />
              {verifyState?.errors?.code && (
                <p className="rounded-lg bg-terracotta/10 px-4 py-3 text-sm font-medium text-terracotta">
                  {verifyState.errors.code}
                </p>
              )}
            </div>
            <SubmitButton
              pendingText={t("auth.verifying", "Verifying...")}
              className="w-full bg-gold text-obsidian font-semibold shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:bg-gold-light hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] transition-all duration-300"
            >
              {t("auth.verifyEmail", "Verify email")}
            </SubmitButton>
          </form>

          <div className="space-y-2">
            <form action={resendAction} noValidate>
              <input type="hidden" name="email" value={email} />
              <Button
                type="submit"
                variant="outline"
                className="w-full border-gold/20 text-obsidian/60 hover:bg-gold/5 hover:text-obsidian hover:border-gold/40"
              >
                {t("auth.resendCode", "Resend code")}
              </Button>
            </form>
            {resendState?.message && (
              <p className="rounded-lg bg-sand/30 px-4 py-3 text-center text-sm text-obsidian/60">
                {resendState.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
