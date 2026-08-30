import { createHmac, randomBytes } from "crypto";
import QRCode from "qrcode";
import { prisma } from "@/core/lib/prisma";

// ---------------------------------------------------------------------------
// TOTP 2FA Service (RFC 6238 — using Node.js crypto)
// ---------------------------------------------------------------------------

const APP_NAME = "Mystic Egypt";
const DIGITS = 6;
const PERIOD = 30;
const ALGORITHM = "sha1";

function base32Encode(buffer: Buffer): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const byte of buffer) bits += byte.toString(2).padStart(8, "0");
  let result = "";
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, "0");
    result += alphabet[parseInt(chunk, 2)];
  }
  return result;
}

function generateSecret(): string {
  return base32Encode(randomBytes(20));
}

function generateTOTP(secret: string, timeStep?: number): string {
  const key = Buffer.from(secret, "base64");
  const time = timeStep ?? Math.floor(Date.now() / 1000 / PERIOD);
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(time));
  const hmac = createHmac(ALGORITHM, key).update(timeBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (code % 10 ** DIGITS).toString().padStart(DIGITS, "0");
}

function verifyTOTP(secret: string, token: string): boolean {
  const time = Math.floor(Date.now() / 1000 / PERIOD);
  // Check current and ±1 time window (90 seconds tolerance)
  for (let i = -1; i <= 1; i++) {
    if (generateTOTP(secret, time + i) === token) return true;
  }
  return false;
}

function buildOtpauthUrl(email: string, secret: string): string {
  const label = encodeURIComponent(`${APP_NAME}:${email}`);
  const issuer = encodeURIComponent(APP_NAME);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=${DIGITS}&period=${PERIOD}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface TwoFactorSetup {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

export async function generateTwoFactorSecret(
  _userId: string,
  email: string,
): Promise<TwoFactorSetup> {
  const secret = generateSecret();
  const otpauthUrl = buildOtpauthUrl(email, secret);
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
  return { secret, otpauthUrl, qrCodeDataUrl };
}

export function verifyTwoFactorToken(secret: string, token: string): boolean {
  return verifyTOTP(secret, token);
}

export async function enableTwoFactor(
  userId: string,
  secret: string,
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { totp_secret: secret, is_2fa_verified: true },
  });
}

export async function disableTwoFactor(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { totp_secret: null, is_2fa_verified: false },
  });
}

export async function getTwoFactorStatus(
  userId: string,
): Promise<{ enabled: boolean; hasSecret: boolean }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { is_2fa_verified: true, totp_secret: true },
  });
  if (!user) throw new Error("User not found.");
  return {
    enabled: user.is_2fa_verified,
    hasSecret: Boolean(user.totp_secret),
  };
}

export async function getTwoFactorSecret(
  userId: string,
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totp_secret: true },
  });
  return user?.totp_secret ?? null;
}
