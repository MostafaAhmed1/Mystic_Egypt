"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/features/auth/actions";
import { SubmitButton } from "@/features/auth/components/SubmitButton";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPasswordAction, undefined);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Reset your password</CardTitle>
        <CardDescription className="text-center">
          Enter your email and we&apos;ll send you a 6-digit reset code.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
            {state?.errors?.email && (
              <p className="text-sm text-destructive">{state.errors.email}</p>
            )}
          </div>

          {state?.message && (
            <p className="text-sm text-muted-foreground">{state.message}</p>
          )}

          <SubmitButton pendingText="Sending...">Send reset code</SubmitButton>
        </form>

        {state?.ok && (
          <div className="mt-4 text-center text-sm">
            <Link href="/reset-password" className="font-medium text-primary hover:underline">
              I have a code — reset my password
            </Link>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        <span>
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </span>
      </CardFooter>
    </Card>
  );
}
