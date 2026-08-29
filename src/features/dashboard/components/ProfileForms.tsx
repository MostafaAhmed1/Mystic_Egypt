"use client";

import { useActionState, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  changePasswordAction,
  deleteAccountAction,
  toggleNotificationsAction,
  updateProfileAction,
  type ProfileFormState,
} from "@/features/dashboard/actions";

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}

export function ProfileForm({
  profile,
}: {
  profile: {
    name: string;
    email: string;
    phone: string | null;
    email_verified: boolean;
  };
}) {
  const [state, formAction] = useActionState<ProfileFormState, FormData>(
    updateProfileAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          defaultValue={profile.name}
          required
        />
        <FieldError message={state?.errors?.name} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={profile.email}
          required
        />
        <FieldError message={state?.errors?.email} />
        {!profile.email_verified && (
          <p className="text-xs text-amber-600">
            Your email is not verified. Changing it will require re-verification.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          defaultValue={profile.phone ?? ""}
        />
        <FieldError message={state?.errors?.phone} />
      </div>

      {state?.message && (
        <p className="text-sm text-muted-foreground">{state.message}</p>
      )}

      <Button type="submit">Save changes</Button>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction] = useActionState<ProfileFormState, FormData>(
    changePasswordAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
        <FieldError message={state?.errors?.currentPassword} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
        />
        <FieldError message={state?.errors?.newPassword} />
        <p className="text-xs text-muted-foreground">
          At least 8 characters with a number and a letter.
        </p>
      </div>

      {state?.message && (
        <p className="text-sm text-muted-foreground">{state.message}</p>
      )}

      <Button type="submit">Change password</Button>
    </form>
  );
}

export function NotificationsToggle({
  enabled,
}: {
  enabled: boolean;
}) {
  const [state, formAction] = useActionState<ProfileFormState, FormData>(
    toggleNotificationsAction,
    undefined,
  );
  const [checked, setChecked] = useState(enabled);

  return (
    <div className="flex flex-col gap-2">
      <label className="flex cursor-pointer items-center justify-between gap-3">
        <span>
          <span className="block text-sm font-medium">Email notifications</span>
          <span className="block text-xs text-muted-foreground">
            Receive booking updates and confirmations by email.
          </span>
        </span>
        <form action={formAction}>
          <button
            type="submit"
            role="switch"
            aria-checked={checked}
            onClick={() => setChecked((prev) => !prev)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              checked ? "bg-primary" : "bg-input"
            }`}
          >
            <span
              className={`absolute top-0.5 size-5 rounded-full bg-white transition-transform ${
                checked ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </form>
      </label>
      <span className="text-xs text-muted-foreground">{state?.message}</span>
    </div>
  );
}

export function DeleteAccountForm() {
  const [state, formAction] = useActionState<ProfileFormState, FormData>(
    deleteAccountAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        This permanently removes your account and personal data. Your booking
        records are kept anonymized to comply with legal and tax obligations.
      </p>
      <div className="space-y-2">
        <Label htmlFor="confirm">
          Type <span className="font-semibold">DELETE</span> to confirm
        </Label>
        <Input id="confirm" name="confirm" type="text" placeholder="DELETE" />
        <FieldError message={state?.errors?.name} />
      </div>
      <Button type="submit" variant="destructive">
        Delete my account
      </Button>
    </form>
  );
}
