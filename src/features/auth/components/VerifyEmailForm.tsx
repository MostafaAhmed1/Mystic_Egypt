"use client";

import { useActionState } from "react";
import {
  verifyEmailAction,
  resendVerificationAction,
} from "@/features/auth/actions";
import { SubmitButton } from "@/features/auth/components/SubmitButton";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";

export function VerifyEmailForm({ email }: { email: string }) {
  const [verifyState, verifyAction] = useActionState(verifyEmailAction, undefined);
  const [resendState, resendAction] = useActionState(resendVerificationAction, undefined);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Verify your email</CardTitle>
        <CardDescription className="text-center">
          We sent a 6-digit code to <span className="font-medium">{email}</span>. Enter it below
          to verify your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={verifyAction} className="space-y-4" noValidate>
          <input type="hidden" name="email" value={email} />
          <div className="space-y-2">
            <Label htmlFor="code">Verification code</Label>
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
            {verifyState?.errors?.code && (
              <p className="text-sm text-destructive">{verifyState.errors.code}</p>
            )}
          </div>
          <SubmitButton pendingText="Verifying...">Verify email</SubmitButton>
        </form>

        <div className="space-y-2">
          <form action={resendAction} noValidate>
            <input type="hidden" name="email" value={email} />
            <Button type="submit" variant="outline" className="w-full">
              Resend code
            </Button>
          </form>
          {resendState?.message && (
            <p className="text-sm text-muted-foreground">{resendState.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
