"use server";

import { getServerSession } from "next-auth/next";
import { requireAdmin } from "@/core/lib/session";
import { prisma } from "@/core/lib/prisma";
import { authOptions } from "@/core/lib/auth";
import {
  generateTwoFactorSecret,
  verifyTwoFactorToken,
  enableTwoFactor,
  disableTwoFactor,
  getTwoFactorStatus,
  getTwoFactorSecret,
} from "@/features/auth/two-factor";

const TWO_FACTOR_SESSION_TTL_MS = 5 * 60 * 1000; // 5 minutes

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

/**
 * Verify 2FA TOTP code during login flow.
 * Creates a verified TwoFactorSession so the next signIn call bypasses 2FA.
 */
export async function verifyTwoFactorLoginAction(
  token: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { ok: false, error: "Not authenticated." };
    }

    const userId = session.user.id;
    const secret = await getTwoFactorSecret(userId);
    if (!secret) {
      return { ok: false, error: "2FA is not set up." };
    }

    const valid = verifyTwoFactorToken(secret, token);
    if (!valid) {
      return { ok: false, error: "Invalid code. Please try again." };
    }

    // Create a verified 2FA session (expires in 5 minutes)
    await prisma.twoFactorSession.create({
      data: {
        user_id: userId,
        verified: true,
        expires_at: new Date(Date.now() + TWO_FACTOR_SESSION_TTL_MS),
      },
    });

    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[verifyTwoFactorLoginAction]", msg);
    return { ok: false, error: msg };
  }
}

export async function verifyTwoFactorLoginByUserIdAction(
  userId: string,
  token: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const secret = await getTwoFactorSecret(userId);
    if (!secret) {
      return { ok: false, error: "2FA is not set up." };
    }

    const valid = verifyTwoFactorToken(secret, token);
    if (!valid) {
      return { ok: false, error: "Invalid code. Please try again." };
    }

    // Create a verified 2FA session (expires in 5 minutes)
    await prisma.twoFactorSession.create({
      data: {
        user_id: userId,
        verified: true,
        expires_at: new Date(Date.now() + TWO_FACTOR_SESSION_TTL_MS),
      },
    });

    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[verifyTwoFactorLoginByUserIdAction]", msg);
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
