import bcrypt from "bcryptjs";
import { prisma } from "@/core/lib/prisma";
import type { OtpType } from "@/core/generated/prisma/enums";

export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;

function generateOtpCode(): string {
  // Leading zeroes are allowed; keep as a zero-padded string.
  const random = Math.floor(Math.random() * 10 ** OTP_LENGTH);
  return random.toString().padStart(OTP_LENGTH, "0");
}

/**
 * Create a fresh OTP code for a user+type, invalidating any previously
 * unused codes of the same type. Returns the plaintext code so the caller
 * can send it via email; only the hash is persisted.
 */
export async function createOtpCode(
  userId: string,
  type: OtpType,
): Promise<{ code: string; expiresAt: Date }> {
  // Invalidate previous unused codes of this type.
  await prisma.otpCode.updateMany({
    where: { user_id: userId, type, used_at: null },
    data: { expires_at: new Date(0) }, // Expire outstanding codes immediately.
  });

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.otpCode.create({
    data: {
      user_id: userId,
      type,
      code_hash: await bcrypt.hash(code, 6),
      expires_at: expiresAt,
    },
  });

  return { code, expiresAt };
}

export type OtpVerificationResult =
  | { valid: true }
  | { valid: false; reason: "not_found" | "expired" | "max_attempts" | "invalid_code" };

/**
 * Verify a submitted code against the latest unused code for the user+type.
 * On success the code is marked as used. Failed attempts increment the
 * attempt counter to mitigate brute force.
 */
export async function verifyOtpCode(
  userId: string,
  type: OtpType,
  code: string,
): Promise<OtpVerificationResult> {
  const record = await prisma.otpCode.findFirst({
    where: { user_id: userId, type, used_at: null },
    orderBy: { created_at: "desc" },
  });

  if (!record) {
    return { valid: false, reason: "not_found" };
  }

  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    return { valid: false, reason: "max_attempts" };
  }

  if (record.expires_at.getTime() <= Date.now()) {
    return { valid: false, reason: "expired" };
  }

  const matches = await bcrypt.compare(code, record.code_hash);
  if (!matches) {
    await prisma.otpCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return { valid: false, reason: "invalid_code" };
  }

  await prisma.otpCode.update({
    where: { id: record.id },
    data: { used_at: new Date() },
  });

  return { valid: true };
}
