"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Shield } from "lucide-react";
import { verifyTwoFactorLoginByUserIdAction } from "@/features/auth/two-factor-actions";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

export default function Verify2FAPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"token" | "password">("token");
  const [error, setError] = useState<string | undefined>(undefined);
  const [pending, setPending] = useState(false);

  const userId = session?.user?.id;
  const userRole = session?.user?.role;
  const userEmail = session?.user?.email;

  async function handleTokenSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);

    if (!userId) {
      setError("Session expired. Please log in again.");
      return;
    }

    if (token.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setPending(true);

    const result = await verifyTwoFactorLoginByUserIdAction(userId, token);

    if (!result.ok) {
      setError(result.error ?? "Invalid code. Please try again.");
      setPending(false);
      return;
    }

    // 2FA verified — now ask for password to complete login
    setStep("password");
    setPending(false);
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);

    if (!userEmail) {
      setError("Session expired. Please log in again.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setPending(true);

    // Re-sign in with email + password — this time TwoFactorSession exists
    const signInResult = await signIn("credentials", {
      email: userEmail,
      password,
      redirect: false,
    });

    if (signInResult?.error) {
      setError("Invalid password. Please try again.");
      setPending(false);
      return;
    }

    const home = userRole === "ADMIN" ? "/admin" : "/dashboard";
    router.push(home);
    router.refresh();
  }

  if (status === "loading") {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Session expired. Please{" "}
            <a href="/login" className="text-primary hover:underline">
              log in again
            </a>.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-center mb-2">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="size-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-center text-2xl">
          {step === "token" ? "Two-Factor Authentication" : "Confirm Password"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === "token" ? (
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Enter the 6-digit code from your authenticator app.
            </p>

            <div className="flex justify-center">
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="h-12 w-40 rounded-xl border bg-background px-3 text-center text-xl tracking-[0.3em] font-mono outline-none focus:ring-2 focus:ring-ring"
                placeholder="000000"
                maxLength={6}
                autoFocus
              />
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <Button type="submit" disabled={pending || token.length !== 6} className="w-full">
              {pending ? "Verifying..." : "Verify Code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              2FA verified. Enter your password to complete login.
            </p>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoFocus
              />
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <Button type="submit" disabled={pending || !password} className="w-full">
              {pending ? "Signing in..." : "Complete Login"}
            </Button>
          </form>
        )}

        <div className="mt-4 text-center text-sm">
          <a href="/login" className="font-medium text-primary hover:underline">
            Back to login
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
