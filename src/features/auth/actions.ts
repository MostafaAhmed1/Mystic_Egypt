"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/core/lib/prisma";
import { OtpType } from "@/core/generated/prisma/enums";
import {
  createOtpCode,
  verifyOtpCode,
} from "@/core/lib/otp";
import { getLocaleFromCookieString } from "@/core/utils/locale";
import { defaultLocale } from "@/core/i18n-config";

async function getLocale(): Promise<string> {
  const cookieStore = await cookies();
  return getLocaleFromCookieString(cookieStore.get("locale")?.value) ?? defaultLocale;
}
import { sendEmail } from "@/core/lib/resend";
import {
  verificationEmailHtml,
  passwordResetEmailHtml,
} from "@/features/auth/emails";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_NUMBER_REGEX,
  PASSWORD_LETTER_REGEX,
  OTP_CODE_FORMAT,
} from "@/core/constants/auth";

export type AuthFieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  code?: string;
};

export type AuthFormState = {
  errors?: AuthFieldErrors;
  message?: string;
  ok?: boolean;
} | undefined;

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

export async function registerAction(
  state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = formData.get("name")?.toString().trim() ?? "";
  const email = normalizeEmail(formData.get("email")?.toString() ?? "");
  const password = formData.get("password")?.toString() ?? "";

  const errors: AuthFieldErrors = {};
  if (!name || name.length < 2) {
    errors.name = "Name must be at least 2 characters long.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  }
  const passwordError = validatePassword(password);
  if (passwordError) {
    errors.password = passwordError;
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      errors: { email: "An account with this email already exists." },
    };
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password_hash: await bcrypt.hash(password, 10),
      role: "CLIENT",
      is_2fa_verified: false,
    },
  });

  const { code } = await createOtpCode(user.id, OtpType.EMAIL_VERIFICATION);
  await sendEmail({
    to: email,
    subject: "Verify your Mystic Egypt email",
    html: verificationEmailHtml(code, name),
  });

  const locale = await getLocale();
  redirect(`/${locale}/verify-email?email=${encodeURIComponent(email)}`);
}

export async function verifyEmailAction(
  state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizeEmail(formData.get("email")?.toString() ?? "");
  const code = formData.get("code")?.toString().trim() ?? "";

  const errors: AuthFieldErrors = {};
  if (!OTP_CODE_FORMAT.test(code)) {
    errors.code = "Please enter the 6-digit code.";
  }
  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { errors: { email: "We could not find this account." } };
  }

  const result = await verifyOtpCode(user.id, OtpType.EMAIL_VERIFICATION, code);
  if (!result.valid) {
    return { errors: { code: otpErrorLabel(result.reason) } };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { email_verified: true },
  });

  const locale = await getLocale();
  redirect(`/${locale}/login?verified=1`);
}

export async function resendVerificationAction(
  state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizeEmail(formData.get("email")?.toString() ?? "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { errors: { email: "Please enter a valid email address." } };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { errors: { email: "We could not find this account." } };
  }

  if (user.email_verified) {
    return { message: "This email is already verified. You can log in." };
  }

  const { code } = await createOtpCode(user.id, OtpType.EMAIL_VERIFICATION);
  await sendEmail({
    to: email,
    subject: "Verify your Mystic Egypt email",
    html: verificationEmailHtml(code, user.name),
  });

  return { ok: true, message: "A new verification code has been sent." };
}

export async function forgotPasswordAction(
  state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizeEmail(formData.get("email")?.toString() ?? "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { errors: { email: "Please enter a valid email address." } };
  }

  // Always return a generic success message to avoid account enumeration.
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const { code } = await createOtpCode(user.id, OtpType.PASSWORD_RESET);
    await sendEmail({
      to: email,
      subject: "Reset your Mystic Egypt password",
      html: passwordResetEmailHtml(code, user.name),
    });
  }

  return {
    ok: true,
    message: "If an account exists for that email, a reset code has been sent.",
  };
}

export async function resetPasswordAction(
  state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = normalizeEmail(formData.get("email")?.toString() ?? "");
  const code = formData.get("code")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  const errors: AuthFieldErrors = {};
  if (!OTP_CODE_FORMAT.test(code)) {
    errors.code = "Please enter the 6-digit code.";
  }
  const passwordError = validatePassword(password);
  if (passwordError) {
    errors.password = passwordError;
  }
  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { errors: { email: "We could not find this account." } };
  }

  const result = await verifyOtpCode(user.id, OtpType.PASSWORD_RESET, code);
  if (!result.valid) {
    return { errors: { code: otpErrorLabel(result.reason) } };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password_hash: await bcrypt.hash(password, 10) },
  });

  const locale = await getLocale();
  redirect(`/${locale}/login?reset=1`);
}

function otpErrorLabel(
  reason: "not_found" | "expired" | "max_attempts" | "invalid_code",
): string {
  switch (reason) {
    case "expired":
      return "This code has expired. Please request a new one.";
    case "max_attempts":
      return "Too many incorrect attempts. Please request a new code.";
    case "invalid_code":
      return "The code you entered is incorrect.";
    case "not_found":
    default:
      return "We could not find a matching code. Please request a new one.";
  }
}
