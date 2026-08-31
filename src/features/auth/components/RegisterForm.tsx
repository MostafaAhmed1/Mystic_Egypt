"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { registerAction } from "@/features/auth/actions";
import { SubmitButton } from "@/features/auth/components/SubmitButton";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useLocale } from "@/shared/hooks/use-locale";

export function RegisterForm() {
  const { t } = useTranslation("common");
  const { href } = useLocale();
  const [state, formAction] = useActionState(registerAction, undefined);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-2xl">{t("auth.createAnAccount")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name">{t("auth.name")}</Label>
            <Input id="name" name="name" type="text" autoComplete="name" required />
            {state?.errors?.name && (
              <p className="text-sm text-destructive">{state.errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
            {state?.errors?.email && (
              <p className="text-sm text-destructive">{state.errors.email}</p>
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
              <p className="text-sm text-destructive">{state.errors.password}</p>
            )}
          </div>

          {state?.message && (
            <p className="text-sm text-muted-foreground">{state.message}</p>
          )}

          <SubmitButton pendingText={t("auth.creatingAccount", "Creating account...")}>{t("auth.createAccount")}</SubmitButton>
        </form>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        <span>
          {t("auth.alreadyHaveAccount")}{" "}
          <Link href={href("/login")} className="font-medium text-primary hover:underline">
            {t("auth.signIn")}
          </Link>
        </span>
      </CardFooter>
    </Card>
  );
}
