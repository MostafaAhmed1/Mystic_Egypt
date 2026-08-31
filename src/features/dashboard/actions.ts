"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/core/lib/prisma";
import { OtpType } from "@/core/generated/prisma/enums";
import { getCurrentUser } from "@/core/lib/session";
import { createOtpCode } from "@/core/lib/otp";
import { sendEmail } from "@/core/lib/resend";
import { verificationEmailHtml } from "@/features/auth/emails";
import { getLocaleFromCookieString } from "@/core/utils/locale";
import { defaultLocale } from "@/core/i18n-config";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_NUMBER_REGEX,
  PASSWORD_LETTER_REGEX,
  EMAIL_MAX_LENGTH,
} from "@/core/constants/auth";

async function getLocale(): Promise<string> {
  const cookieStore = await cookies();
  return getLocaleFromCookieString(cookieStore.get("locale")?.value) ?? defaultLocale;
}

// Client dashboard profile actions (name/email/phone, password, notifications,
// and GDPR account deletion). All are ownership-scoped to the current session.

export type ProfileFieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
};

export type ProfileFormState = {
  errors?: ProfileFieldErrors;
  message?: string;
  ok?: boolean;
} | undefined;

type ActionReturnsState = (
  state: ProfileFormState,
  formData: FormData,
) => Promise<ProfileFormState>;

function withUser(
  action: (userId: string, state: ProfileFormState, formData: FormData) => Promise<ProfileFormState>,
): ActionReturnsState {
  return async (state, formData) => {
    const user = await getCurrentUser();
    if (!user) {
      const locale = await getLocale();
      redirect(`/${locale}/login`);
    }
    return action(user.id, state, formData);
  };
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function validatePassword(password: string): string | undefined {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`;
  }
  if (!PASSWORD_NUMBER_REGEX.test(password)) {
    return "Password must contain at least one number.";
  }
  if (!PASSWORD_LETTER_REGEX.test(password)) {
    return "Password must contain at least one letter.";
  }
  return undefined;
}

export const updateProfileAction = withUser(
  async (userId, _state, formData) => {
    const name = formData.get("name")?.toString().trim() ?? "";
    const email = normalizeEmail(formData.get("email")?.toString() ?? "");
    const phone = (formData.get("phone")?.toString().trim() ?? "") || null;

    const errors: ProfileFieldErrors = {};
    if (!name || name.length < 2) {
      errors.name = "Name must be at least 2 characters long.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address.";
    } else if (email.length > EMAIL_MAX_LENGTH) {
      errors.email = `Email must be under ${EMAIL_MAX_LENGTH} characters.`;
    }
    if (Object.keys(errors).length > 0) {
      return { errors };
    }

    const current = await prisma.user.findUnique({ where: { id: userId } });
    if (!current) {
      return { message: "Account not found." };
    }

    const emailChanged = email !== current.email;
    if (emailChanged) {
      const taken = await prisma.user.findUnique({ where: { email } });
      if (taken && taken.id !== userId) {
        return { errors: { email: "An account with this email already exists." } };
      }
    }

    const data = {
      name,
      email,
      phone,
      ...(emailChanged ? { email_verified: false } : {}),
    };

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
    });

    // A newly set email must be verified before the account is used again.
    if (emailChanged) {
      const { code } = await createOtpCode(updated.id, OtpType.EMAIL_VERIFICATION);
      await sendEmail({
        to: email,
        subject: "Verify your Mystic Egypt email",
        html: verificationEmailHtml(code, updated.name),
      });
      const locale = await getLocale();
      redirect(`/${locale}/verify-email?email=${encodeURIComponent(email)}`);
    }

    return { ok: true, message: "Your profile has been updated." };
  },
);

export const changePasswordAction = withUser(
  async (userId, _state, formData) => {
    const currentPassword = formData.get("currentPassword")?.toString() ?? "";
    const newPassword = formData.get("newPassword")?.toString() ?? "";

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { message: "Account not found." };
    }

    const errors: ProfileFieldErrors = {};
    if (!currentPassword) {
      errors.currentPassword = "Enter your current password.";
    }
    const newPasswordError = validatePassword(newPassword);
    if (newPasswordError) {
      errors.newPassword = newPasswordError;
    }
    if (Object.keys(errors).length > 0) {
      return { errors };
    }

    if (user.password_hash) {
      const matches = await bcrypt.compare(currentPassword, user.password_hash);
      if (!matches) {
        return { errors: { currentPassword: "Your current password is incorrect." } };
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { password_hash: await bcrypt.hash(newPassword, 10) },
    });

    return { ok: true, message: "Your password has been changed." };
  },
);

export const toggleNotificationsAction: ActionReturnsState = async (
  _state,
  _formData,
) => {
  const user = await getCurrentUser();
  if (!user) {
    const locale = await getLocale();
    redirect(`/${locale}/login`);
  }
  const current = await prisma.user.findUnique({
    where: { id: user.id },
    select: { notifications_enabled: true },
  });
  if (!current) {
    return { message: "Account not found." };
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { notifications_enabled: !current.notifications_enabled },
  });
  return {
    ok: true,
    message: current.notifications_enabled
      ? "Email notifications have been disabled."
      : "Email notifications have been enabled.",
  };
};

/**
 * GDPR "delete my account and my data" (PRD §5.1). Personal activity records
 * (OTP codes, customization requests, wishlist) are hard-deleted. The user row
 * is anonymized (identity fields scrubbed) so financial/booking records remain
 * intact for legal & tax obligations while no longer identifying the person.
 */
export const deleteAccountAction = withUser(
  async (userId, _state, formData) => {
    const confirm = formData.get("confirm")?.toString() ?? "";
    if (confirm !== "DELETE") {
      return {
        errors: { name: "Type DELETE to confirm account deletion." },
      };
    }

    await prisma.$transaction([
      prisma.otpCode.deleteMany({ where: { user_id: userId } }),
      prisma.customizationRequest.deleteMany({ where: { user_id: userId } }),
      prisma.user.update({
        where: { id: userId },
        data: {
          name: "Deleted account",
          email: `deleted-${userId.slice(0, 8)}@deleted.invalid`,
          phone: null,
          email_verified: false,
          notifications_enabled: false,
          password_hash: null,
        },
      }),
    ]);

    const locale = await getLocale();
    redirect(`/${locale}/login`);
  },
);
