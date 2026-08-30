"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession, signOut } from "next-auth/react";
import { Shield } from "lucide-react";
import { verifyTwoFactorLoginByUserIdAction } from "@/features/auth/two-factor-actions";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

export default function Verify2FAPage() {
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [pending, setPending] = useState(false);

  const userId = session?.user?.id;
  const userRole = session?.user?.role;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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

    // 2FA verified — update session to remove requires_2fa
    await update();

    const home = userRole === "ADMIN" ? "/admin" : "/dashboard";
    router.push(home);
    router.refresh();
  }

  if (status === "loading" || pending) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-3">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">
              {pending ? "Verifying..." : "Loading..."}
            </p>
          </div>
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
        <CardTitle className="text-center text-2xl">Two-Factor Authentication</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Button type="submit" disabled={token.length !== 6} className="w-full">
            Verify & Continue
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <a href="/login" className="font-medium text-primary hover:underline">
            Back to login
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
