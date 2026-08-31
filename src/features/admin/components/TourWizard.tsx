"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from "lucide-react";
import { useLocale } from "@/shared/hooks/use-locale";

interface ItineraryDay {
  day_number: number;
  title: string;
  description: string;
}

interface TourImage {
  image_url: string;
  is_primary: boolean;
}

interface TourRoute {
  order: number;
  label: string;
  lat: number;
  lng: number;
  is_stop: boolean;
}

interface TourDate {
  date: string;
  is_closed: boolean;
}

interface TourData {
  id?: string;
  title: string;
  slug: string;
  description: string;
  inclusions: string;
  exclusions: string;
  base_price: number;
  currency: string;
  status: string;
  itinerary: ItineraryDay[];
  images: TourImage[];
  route: TourRoute[];
  tour_dates: TourDate[];
}

const STEPS = ["Basic Info", "Itinerary", "Images", "Pricing & Dates"];

export function TourWizard({ tour }: { tour?: TourData }) {
  const router = useRouter();
  const { href } = useLocale();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<TourData>(
    tour ?? {
      title: "",
      slug: "",
      description: "",
      inclusions: "",
      exclusions: "",
      base_price: 0,
      currency: "USD",
      status: "open",
      itinerary: [],
      images: [],
      route: [],
      tour_dates: [],
    }
  );

  const isEdit = Boolean(tour?.id);

  function updateField<K extends keyof TourData>(key: K, value: TourData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function addItineraryDay() {
    const nextDay = data.itinerary.length + 1;
    updateField("itinerary", [
      ...data.itinerary,
      { day_number: nextDay, title: "", description: "" },
    ]);
  }

  function removeItineraryDay(index: number) {
    const updated = data.itinerary
      .filter((_, i) => i !== index)
      .map((d, i) => ({ ...d, day_number: i + 1 }));
    updateField("itinerary", updated);
  }

  function addImage() {
    updateField("images", [...data.images, { image_url: "", is_primary: data.images.length === 0 }]);
  }

  function removeImage(index: number) {
    updateField("images", data.images.filter((_, i) => i !== index));
  }

  function addRoutePoint() {
    updateField("route", [
      ...data.route,
      { order: data.route.length + 1, label: "", lat: 0, lng: 0, is_stop: false },
    ]);
  }

  function removeRoutePoint(index: number) {
    const updated = data.route
      .filter((_, i) => i !== index)
      .map((r, i) => ({ ...r, order: i + 1 }));
    updateField("route", updated);
  }

  function addTourDate() {
    updateField("tour_dates", [...data.tour_dates, { date: "", is_closed: false }]);
  }

  function removeTourDate(index: number) {
    updateField("tour_dates", data.tour_dates.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!data.title || !data.slug || !data.description || data.base_price <= 0) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      const url = isEdit ? `/api/admin/tours/${tour!.id}` : "/api/admin/tours";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!result.ok) {
        toast.error(result.error ?? "Failed to save tour.");
        return;
      }

      toast.success(isEdit ? "Tour updated." : "Tour created.");
      router.push(href("/admin/tours"));
      router.refresh();
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex size-8 items-center justify-center rounded-full text-xs font-medium ${
                i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="size-4" /> : i + 1}
            </div>
            <span className={`text-sm ${i === step ? "font-medium" : "text-muted-foreground"}`}>
              {s}
            </span>
            {i < STEPS.length - 1 && <div className="mx-2 h-px w-8 bg-border" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="rounded-2xl border bg-card p-6">
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Basic Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Title *</label>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g. Classic Nile Cruise"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Slug *</label>
                <input
                  type="text"
                  value={data.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g. classic-nile-cruise"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Description *</label>
              <textarea
                value={data.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={4}
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="Describe the tour experience..."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Inclusions</label>
                <textarea
                  value={data.inclusions}
                  onChange={(e) => updateField("inclusions", e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="One per line:&#10;Private guide&#10;Transport"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Exclusions</label>
                <textarea
                  value={data.exclusions}
                  onChange={(e) => updateField("exclusions", e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="One per line:&#10;Travel insurance&#10;Visa fees"
                />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Itinerary</h2>
              <button
                type="button"
                onClick={addItineraryDay}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="size-3" /> Add Day
              </button>
            </div>
            {data.itinerary.length === 0 ? (
              <p className="text-sm text-muted-foreground">No itinerary days added yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {data.itinerary.map((day, i) => (
                  <div key={i} className="rounded-xl border p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium">Day {day.day_number}</span>
                      <button
                        type="button"
                        onClick={() => removeItineraryDay(i)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={day.title}
                      onChange={(e) => {
                        const updated = [...data.itinerary];
                        updated[i] = { ...updated[i], title: e.target.value };
                        updateField("itinerary", updated);
                      }}
                      className="mb-2 h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Day title"
                    />
                    <textarea
                      value={day.description}
                      onChange={(e) => {
                        const updated = [...data.itinerary];
                        updated[i] = { ...updated[i], description: e.target.value };
                        updateField("itinerary", updated);
                      }}
                      rows={3}
                      className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Day description"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Images</h2>
              <button
                type="button"
                onClick={addImage}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="size-3" /> Add Image
              </button>
            </div>
            {data.images.length === 0 ? (
              <p className="text-sm text-muted-foreground">No images added yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {data.images.map((img, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={img.image_url}
                      onChange={(e) => {
                        const updated = [...data.images];
                        updated[i] = { ...updated[i], image_url: e.target.value };
                        updateField("images", updated);
                      }}
                      className="h-10 flex-1 rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="/uploads/tours/image.jpg"
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="primary_image"
                        checked={img.is_primary}
                        onChange={() => {
                          const updated = data.images.map((img, j) => ({
                            ...img,
                            is_primary: j === i,
                          }));
                          updateField("images", updated);
                        }}
                      />
                      Primary
                    </label>
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Route Points</h2>
              <button
                type="button"
                onClick={addRoutePoint}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="size-3" /> Add Point
              </button>
            </div>
            {data.route.length === 0 ? (
              <p className="text-sm text-muted-foreground">No route points added yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {data.route.map((pt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-6">{pt.order}</span>
                    <input
                      type="text"
                      value={pt.label}
                      onChange={(e) => {
                        const updated = [...data.route];
                        updated[i] = { ...updated[i], label: e.target.value };
                        updateField("route", updated);
                      }}
                      className="h-10 flex-1 rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Point label"
                    />
                    <input
                      type="number"
                      value={pt.lat || ""}
                      onChange={(e) => {
                        const updated = [...data.route];
                        updated[i] = { ...updated[i], lat: parseFloat(e.target.value) || 0 };
                        updateField("route", updated);
                      }}
                      className="h-10 w-24 rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Lat"
                      step="any"
                    />
                    <input
                      type="number"
                      value={pt.lng || ""}
                      onChange={(e) => {
                        const updated = [...data.route];
                        updated[i] = { ...updated[i], lng: parseFloat(e.target.value) || 0 };
                        updateField("route", updated);
                      }}
                      className="h-10 w-24 rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Lng"
                      step="any"
                    />
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={pt.is_stop}
                        onChange={(e) => {
                          const updated = [...data.route];
                          updated[i] = { ...updated[i], is_stop: e.target.checked };
                          updateField("route", updated);
                        }}
                      />
                      Stop
                    </label>
                    <button
                      type="button"
                      onClick={() => removeRoutePoint(i)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Pricing & Dates</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Base Price *</label>
                <input
                  type="number"
                  value={data.base_price || ""}
                  onChange={(e) => updateField("base_price", parseFloat(e.target.value) || 0)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Currency</label>
                <select
                  value={data.currency}
                  onChange={(e) => updateField("currency", e.target.value)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Status</label>
                <select
                  value={data.status}
                  onChange={(e) => updateField("status", e.target.value)}
                  className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <h3 className="text-sm font-medium">Tour Dates</h3>
              <button
                type="button"
                onClick={addTourDate}
                className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="size-3" /> Add Date
              </button>
            </div>
            {data.tour_dates.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No specific dates set. Tour is available on all dates when status is &quot;open&quot;.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {data.tour_dates.map((td, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input
                      type="date"
                      value={td.date}
                      onChange={(e) => {
                        const updated = [...data.tour_dates];
                        updated[i] = { ...updated[i], date: e.target.value };
                        updateField("tour_dates", updated);
                      }}
                      className="h-10 rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={td.is_closed}
                        onChange={(e) => {
                          const updated = [...data.tour_dates];
                          updated[i] = { ...updated[i], is_closed: e.target.checked };
                          updateField("tour_dates", updated);
                        }}
                      />
                      Closed
                    </label>
                    <button
                      type="button"
                      onClick={() => removeTourDate(i)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => step > 0 && setStep(step - 1)}
          disabled={step === 0}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Next
            <ArrowRight className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Check className="size-4" />
            {saving ? "Saving..." : isEdit ? "Update Tour" : "Create Tour"}
          </button>
        )}
      </div>
    </div>
  );
}
