"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { forgotPasswordAction } from "@/features/auth/actions";
import { SubmitButton } from "@/features/auth/components/SubmitButton";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useLocale } from "@/shared/hooks/use-locale";

export function ForgotPasswordForm() {
  const { t } = useTranslation("common");
  const { href } = useLocale();
  const [state, formAction] = useActionState(forgotPasswordAction, undefined);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-2xl">{t("auth.resetTitle")}</CardTitle>
        <CardDescription className="text-center">
          {t("auth.resetDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
            {state?.errors?.email && (
              <p className="text-sm text-destructive">{state.errors.email}</p>
            )}
          </div>

          {state?.message && (
            <p className="text-sm text-muted-foreground">{state.message}</p>
          )}

          <SubmitButton pendingText={t("auth.sending", "Sending...")}>{t("auth.sendResetCode")}</SubmitButton>
        </form>

        {state?.ok && (
          <div className="mt-4 text-center text-sm">
            <Link href={href("/reset-password")} className="font-medium text-primary hover:underline">
              {t("auth.haveCode")}
            </Link>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        <span>
          {t("auth.rememberedIt")}{" "}
          <Link href={href("/login")} className="font-medium text-primary hover:underline">
            {t("auth.signIn")}
          </Link>
        </span>
      </CardFooter>
    </Card>
  );
}
