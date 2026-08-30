"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { signIn, getSession } from "next-auth/react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";

export function LoginForm() {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [error, setError] = useState<string | undefined>(undefined);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString() ?? "";
    const password = formData.get("password")?.toString() ?? "";

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(t("auth.invalidCredentials"));
      setPending(false);
      return;
    }

    const session = await getSession();

    if (session?.user && !session.user.email_verified) {
      const userEmail = session.user.email ?? email;
      router.push(`/verify-email?email=${encodeURIComponent(userEmail)}`);
      return;
    }

    if (session?.user?.requires_2fa) {
      router.push("/verify-2fa");
      return;
    }

    const home = session?.user?.role === "ADMIN" ? "/admin" : "/dashboard";
    router.push(home);
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-2xl">{t("auth.welcomeBack")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email")}</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? t("auth.signingIn") : t("auth.signIn")}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <Link href="/forgot-password" className="font-medium text-primary hover:underline">
            {t("auth.forgotPassword")}
          </Link>
        </div>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        <span>
          {t("auth.newToMystic")}{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            {t("auth.createAccount")}
          </Link>
        </span>
      </CardFooter>
    </Card>
  );
}
