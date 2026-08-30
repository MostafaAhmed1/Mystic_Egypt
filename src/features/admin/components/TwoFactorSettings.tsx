"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Shield, ShieldCheck, ShieldOff } from "lucide-react";
import {
  generateTwoFactorSetupAction,
  enableTwoFactorAction,
  disableTwoFactorAction,
  getTwoFactorStatusAction,
} from "@/features/auth/two-factor-actions";

export function TwoFactorSettings() {
  const { t } = useTranslation("common");
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
      toast.error(result.error ?? t("admin.2faSetupFailed"));
    }
  }

  async function handleEnable() {
    if (!secret || !token) {
      toast.error(t("admin.enterVerificationCode"));
      return;
    }
    setLoading(true);
    const result = await enableTwoFactorAction(secret, token);
    setLoading(false);
    if (result.ok) {
      toast.success(t("admin.2faEnabled"));
      setStatus("enabled");
      setQrCode(null);
      setSecret(null);
      setToken("");
    } else {
      toast.error(result.error ?? t("admin.2faEnableFailed"));
    }
  }

  async function handleDisable() {
    if (!confirm(t("admin.confirmDisable2fa"))) return;
    setLoading(true);
    const result = await disableTwoFactorAction();
    setLoading(false);
    if (result.ok) {
      toast.success(t("admin.2faDisabled"));
      setStatus("disabled");
    } else {
      toast.error(result.error ?? t("admin.2faDisableFailed"));
    }
  }

  if (status === "loading") {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <p className="text-sm text-muted-foreground">{t("common.loading")}...</p>
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
          <h2 className="text-lg font-semibold">{t("admin.twoFactorAuth")}</h2>
          <p className="text-sm text-muted-foreground">
            {status === "enabled"
              ? t("admin.2faCurrentlyEnabled")
              : t("admin.2faDescription")}
          </p>
        </div>
      </div>

      {status === "enabled" ? (
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400">
            <ShieldCheck className="size-4" />
            {t("admin.enabled")}
          </span>
          <button
            onClick={handleDisable}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-500/10 disabled:opacity-50"
          >
            <ShieldOff className="size-4" />
            {loading ? t("admin.disabling") : t("admin.disable2fa")}
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
              {loading ? t("admin.generating") : t("admin.setup2fa")}
            </button>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl bg-muted/50 p-4">
                <p className="mb-2 text-sm font-medium">{t("admin.scanQrCode")}</p>
                <img src={qrCode} alt="2FA QR Code" className="mx-auto rounded-lg" width={200} height={200} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{t("admin.enterSixDigitCode")}</label>
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
                    {loading ? t("admin.verifying") : t("admin.verifyAndEnable")}
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
