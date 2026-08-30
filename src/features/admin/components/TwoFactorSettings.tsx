"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Shield, ShieldCheck, ShieldOff } from "lucide-react";
import {
  generateTwoFactorSetupAction,
  enableTwoFactorAction,
  disableTwoFactorAction,
  getTwoFactorStatusAction,
} from "@/features/auth/two-factor-actions";

export function TwoFactorSettings() {
  const [status, setStatus] = useState<"loading" | "enabled" | "disabled">("loading");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getTwoFactorStatusAction().then((result) => {
      if (result.ok) {
        setStatus(result.enabled ? "enabled" : "disabled");
      }
    });
  }, []);

  async function handleSetup() {
    setLoading(true);
    const result = await generateTwoFactorSetupAction();
    setLoading(false);
    if (result.ok && result.qrCodeDataUrl && result.secret) {
      setQrCode(result.qrCodeDataUrl);
      setSecret(result.secret);
    } else {
      toast.error(result.error ?? "Failed to generate 2FA setup.");
    }
  }

  async function handleEnable() {
    if (!secret || !token) {
      toast.error("Please enter the verification code.");
      return;
    }
    setLoading(true);
    const result = await enableTwoFactorAction(secret, token);
    setLoading(false);
    if (result.ok) {
      toast.success("2FA enabled successfully.");
      setStatus("enabled");
      setQrCode(null);
      setSecret(null);
      setToken("");
    } else {
      toast.error(result.error ?? "Failed to enable 2FA.");
    }
  }

  async function handleDisable() {
    if (!confirm("Disable 2FA? This will remove the two-factor authentication requirement.")) return;
    setLoading(true);
    const result = await disableTwoFactorAction();
    setLoading(false);
    if (result.ok) {
      toast.success("2FA disabled.");
      setStatus("disabled");
    } else {
      toast.error(result.error ?? "Failed to disable 2FA.");
    }
  }

  if (status === "loading") {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center gap-3 mb-4">
        {status === "enabled" ? (
          <ShieldCheck className="size-6 text-green-600" />
        ) : (
          <Shield className="size-6 text-muted-foreground" />
        )}
        <div>
          <h2 className="text-lg font-semibold">Two-Factor Authentication (2FA)</h2>
          <p className="text-sm text-muted-foreground">
            {status === "enabled"
              ? "2FA is currently enabled on your account."
              : "Add an extra layer of security to your admin account."}
          </p>
        </div>
      </div>

      {status === "enabled" ? (
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
            <ShieldCheck className="size-4" />
            Enabled
          </span>
          <button
            onClick={handleDisable}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-500/10 disabled:opacity-50"
          >
            <ShieldOff className="size-4" />
            {loading ? "Disabling..." : "Disable 2FA"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {!qrCode ? (
            <button
              onClick={handleSetup}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Shield className="size-4" />
              {loading ? "Generating..." : "Set up 2FA"}
            </button>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="mb-2 text-sm font-medium">Scan this QR code with your authenticator app:</p>
                <img src={qrCode} alt="2FA QR Code" className="mx-auto rounded-lg" width={200} height={200} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Enter the 6-digit code from your app:</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="h-10 w-32 rounded-xl border bg-background px-3 text-center text-lg tracking-[0.3em] font-mono outline-none focus:ring-2 focus:ring-ring"
                    placeholder="000000"
                    maxLength={6}
                  />
                  <button
                    onClick={handleEnable}
                    disabled={loading || token.length !== 6}
                    className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Verify & Enable"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
