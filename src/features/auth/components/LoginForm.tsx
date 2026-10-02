"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { signIn, getSession } from "next-auth/react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useLocale } from "@/shared/hooks/use-locale";

export function LoginForm() {
  const router = useRouter();
  const { locale, href } = useLocale();
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
      router.push(href(`/verify-email?email=${encodeURIComponent(userEmail)}`));
      return;
    }

    if (session?.user?.requires_2fa) {
      router.push(href("/verify-2fa"));
      return;
    }

    const home = session?.user?.role === "ADMIN" ? href("/admin") : href("/dashboard");
    router.push(home);
    router.refresh();
  }

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
            {t("auth.welcomeBack")}
          </h1>
          <div className="mx-auto mt-3 h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          {error && (
            <p className="rounded-lg bg-terracotta/10 px-4 py-3 text-sm font-medium text-terracotta">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="w-full bg-gold text-obsidian font-semibold shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:bg-gold-light hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] transition-all duration-300"
          >
            {pending ? t("auth.signingIn") : t("auth.signIn")}
          </Button>
        </form>

        <div className="mt-5 text-center text-sm">
          <Link
            href={href("/forgot-password")}
            className="font-medium text-gold underline underline-offset-4 hover:text-gold-light transition-colors"
          >
            {t("auth.forgotPassword")}
          </Link>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-sandstone/60">
        {t("auth.newToMystic")}{" "}
        <Link
          href={href("/register")}
          className="font-medium text-gold underline underline-offset-4 hover:text-gold-light transition-colors"
        >
          {t("auth.createAccount")}
        </Link>
      </p>
    </motion.div>
  );
}
