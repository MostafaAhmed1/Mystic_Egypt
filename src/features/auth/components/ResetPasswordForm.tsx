"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { resetPasswordAction } from "@/features/auth/actions";
import { SubmitButton } from "@/features/auth/components/SubmitButton";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const { t } = useTranslation("common");
  const initialEmail = searchParams.get("email") ?? "";
  const [state, formAction] = useActionState(resetPasswordAction, undefined);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-2xl">{t("auth.chooseNewPassword")}</CardTitle>
        <CardDescription className="text-center">
          {t("auth.chooseDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4" noValidate>
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
              <p className="text-sm text-destructive">{state.errors.email}</p>
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
              <p className="text-sm text-destructive">{state.errors.code}</p>
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
              <p className="text-sm text-destructive">{state.errors.password}</p>
            )}
          </div>

          <SubmitButton pendingText={t("auth.resetting", "Resetting...")}>{t("auth.resetPassword")}</SubmitButton>
        </form>

        <div className="mt-4 text-center text-sm">
          <Link href="/forgot-password" className="font-medium text-primary hover:underline">
            {t("auth.requestNewCode")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
