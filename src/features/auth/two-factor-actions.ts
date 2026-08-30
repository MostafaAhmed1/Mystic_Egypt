"use server";

import { requireAdmin } from "@/core/lib/session";
import {
  generateTwoFactorSecret,
  verifyTwoFactorToken,
  enableTwoFactor,
  disableTwoFactor,
  getTwoFactorStatus,
} from "@/features/auth/two-factor";

export async function generateTwoFactorSetupAction(): Promise<{
  ok: boolean;
  secret?: string;
  qrCodeDataUrl?: string;
  error?: string;
}> {
  try {
    const admin = await requireAdmin();
    const setup = await generateTwoFactorSecret(admin.id, admin.email);
    return { ok: true, secret: setup.secret, qrCodeDataUrl: setup.qrCodeDataUrl };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[generateTwoFactorSetupAction]", msg);
    return { ok: false, error: msg };
  }
}

export async function enableTwoFactorAction(
  secret: string,
  token: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    const valid = verifyTwoFactorToken(secret, token);
    if (!valid) {
      return { ok: false, error: "Invalid verification code. Please try again." };
    }
    await enableTwoFactor(admin.id, secret);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[enableTwoFactorAction]", msg);
    return { ok: false, error: msg };
  }
}

export async function disableTwoFactorAction(): Promise<{
  ok: boolean;
  error?: string;
}> {
  try {
    const admin = await requireAdmin();
    await disableTwoFactor(admin.id);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[disableTwoFactorAction]", msg);
    return { ok: false, error: msg };
  }
}

export async function verifyTwoFactorLoginAction(
  token: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = await requireAdmin();
    const { getTwoFactorSecret } = await import("@/features/auth/two-factor");
    const secret = await getTwoFactorSecret(admin.id);
    if (!secret) {
      return { ok: false, error: "2FA is not set up." };
    }
    const valid = verifyTwoFactorToken(secret, token);
    if (!valid) {
      return { ok: false, error: "Invalid code." };
    }
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[verifyTwoFactorLoginAction]", msg);
    return { ok: false, error: msg };
  }
}

export async function getTwoFactorStatusAction(): Promise<{
  ok: boolean;
  enabled?: boolean;
  error?: string;
}> {
  try {
    const admin = await requireAdmin();
    const status = await getTwoFactorStatus(admin.id);
    return { ok: true, enabled: status.enabled };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[getTwoFactorStatusAction]", msg);
    return { ok: false, error: msg };
  }
}
