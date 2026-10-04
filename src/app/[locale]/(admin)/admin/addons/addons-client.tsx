"use client";

import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { CURRENCIES, CURRENCY_SYMBOLS, type Currency } from "@/core/constants/currencies";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";

interface AddonItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: Currency;
  booking_count: number;
}

interface AddonDraft {
  id: string | null;
  name: string;
  description: string;
  price: string;
  currency: Currency;
}

type AdminAddonsClientProps = {
  initialAddons: AddonItem[];
};

function newDraft(): AddonDraft {
  return { id: null, name: "", description: "", price: "", currency: CURRENCIES.USD };
}

function responseError(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string") {
    return payload.error;
  }
  return fallback;
}

function priceLabel(price: number, currency: Currency): string {
  return `${CURRENCY_SYMBOLS[currency]}${price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function AdminAddonsClient({ initialAddons }: AdminAddonsClientProps) {
  const { t } = useTranslation("common");
  const [addons, setAddons] = useState(initialAddons);
  const [draft, setDraft] = useState<AddonDraft | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveAddon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    setSaving(true);

    const isEditing = Boolean(draft.id);
    const endpoint = isEditing
      ? API_ENDPOINTS.ADMIN.ADDONS.BY_ID(draft.id as string)
      : API_ENDPOINTS.ADMIN.ADDONS.CREATE;
    const response = await fetch(endpoint, {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: draft.name,
        description: draft.description,
        price: Number(draft.price),
        currency: draft.currency,
      }),
    });
    const payload: unknown = await response.json().catch(() => null);
    setSaving(false);

    if (!response.ok) {
      toast.error(responseError(payload, t("admin.addonSaveFailed", "Could not save add-on.")));
      return;
    }

    const { addon } = payload as { addon: AddonItem };
    setAddons((current) =>
      isEditing
        ? current.map((item) => (item.id === addon.id ? addon : item))
        : [...current, addon].sort((a, b) => a.name.localeCompare(b.name)),
    );
    setDraft(null);
    toast.success(t("admin.addonSaved", "Add-on saved."));
  }

  async function deleteAddon(id: string) {
    if (!window.confirm(t("admin.deleteAddonConfirm", "Delete this add-on?"))) return;
    const response = await fetch(API_ENDPOINTS.ADMIN.ADDONS.BY_ID(id), { method: "DELETE" });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      toast.error(responseError(payload, t("admin.addonDeleteFailed", "Could not delete add-on.")));
      return;
    }
    setAddons((current) => current.filter((item) => item.id !== id));
    toast.success(t("admin.addonDeleted", "Add-on deleted."));
  }

  function editAddon(addon: AddonItem) {
    setDraft({
      id: addon.id,
      name: addon.name,
      description: addon.description ?? "",
      price: String(addon.price),
      currency: addon.currency,
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("admin.addons", "Add-ons")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("admin.manageAddons", "Extras travelers can add to any booking (transfers, cruises, packages).")}
        </p>
      </div>

      <section className="rounded-2xl border bg-card p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{t("admin.allAddons", "All add-ons")}</h2>
            <p className="text-sm text-muted-foreground">
              {t("admin.addonsDescription", "Shown on the checkout page as optional extras.")}
            </p>
          </div>
          <Button type="button" onClick={() => setDraft(newDraft())}>
            <Plus aria-hidden />
            {t("admin.addAddon", "Add add-on")}
          </Button>
        </div>

        {draft && (
          <form onSubmit={saveAddon} className="mb-6 grid gap-4 rounded-xl border border-gold/20 bg-sand/20 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {draft.id ? t("admin.editAddon", "Edit add-on") : t("admin.addAddon", "Add add-on")}
              </h3>
              <Button type="button" variant="ghost" size="icon" onClick={() => setDraft(null)} aria-label={t("common.close", "Close")}>
                <X aria-hidden />
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium md:col-span-2">
                <span>{t("admin.addonName", "Name")}</span>
                <Input
                  required
                  maxLength={120}
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                  placeholder="Airport transfer (round trip)"
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium md:col-span-2">
                <span>{t("common.description", "Description")}</span>
                <Textarea
                  value={draft.description}
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                  placeholder="Private transfer from Cairo airport to your hotel and back."
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                <span>{t("common.price", "Price")}</span>
                <Input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={draft.price}
                  onChange={(event) => setDraft({ ...draft, price: event.target.value })}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                <span>{t("common.currency", "Currency")}</span>
                <select
                  value={draft.currency}
                  onChange={(event) => setDraft({ ...draft, currency: event.target.value as Currency })}
                  className="h-10 w-full rounded-lg border border-sand/60 bg-white px-3 text-sm"
                >
                  {(Object.values(CURRENCIES) as Currency[]).map((code) => (
                    <option key={code} value={code}>
                      {code} ({CURRENCY_SYMBOLS[code]})
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <Button type="submit" disabled={saving}>
              <Save aria-hidden />
              {saving ? t("common.saving", "Saving...") : t("common.save", "Save")}
            </Button>
          </form>
        )}

        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-start text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">{t("admin.addonName", "Name")}</th>
                <th className="px-4 py-3 font-medium">{t("common.description", "Description")}</th>
                <th className="px-4 py-3 font-medium">{t("common.price", "Price")}</th>
                <th className="px-4 py-3 font-medium">{t("admin.usedByBookings", "Used in bookings")}</th>
                <th className="px-4 py-3 text-end font-medium">{t("common.actions", "Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {addons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    {t("admin.noAddons", "No add-ons yet.")}
                  </td>
                </tr>
              ) : (
                addons.map((addon) => (
                  <tr key={addon.id} className={`border-t ${draft?.id === addon.id ? "bg-gold/5" : ""}`}>
                    <td className="px-4 py-3 font-medium">{addon.name}</td>
                    <td className="max-w-md px-4 py-3 text-muted-foreground">
                      <span className="line-clamp-2">{addon.description ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3">{priceLabel(addon.price, addon.currency)}</td>
                    <td className="px-4 py-3">
                      <span className={addon.booking_count > 0 ? "text-amber-600" : "text-muted-foreground"}>
                        {addon.booking_count}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button type="button" variant="ghost" size="icon" onClick={() => editAddon(addon)} aria-label={t("admin.edit", "Edit")}>
                          <Pencil aria-hidden />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => deleteAddon(addon.id)} aria-label={t("admin.delete", "Delete")}>
                          <Trash2 aria-hidden />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
