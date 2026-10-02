"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import { trackEvent } from "@/core/lib/analytics";
import { hasMetaConsent, sendMetaEvent } from "@/core/lib/meta-pixel";

type FormState = {
  status: "idle" | "sending" | "success" | "error";
  message?: string;
};

export function ContactFormSection() {
  const { t } = useTranslation();
  const [formState, setFormState] = useState<FormState>({ status: "idle" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState({ status: "sending" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormState({ status: "error", message: data.error || "Something went wrong." });
        return;
      }

      trackEvent("generate_lead", { source: "contact_form_homepage" });
      if (hasMetaConsent()) {
        sendMetaEvent("Lead", {
          content_name: "Contact Form",
          content_category: "Lead Generation",
        });
      }
      setFormState({ status: "success", message: data.message });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      setFormState({ status: "error", message: "Network error. Please try again." });
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  return (
    <section className="bg-sandstone-dark/50">
      <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-2xl font-bold tracking-wider text-obsidian sm:text-3xl">
            {t("contact.title")}
          </h2>
          <p className="mt-3 text-obsidian/50">
            {t("contact.subtitle")}
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-gold/10 bg-white p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] sm:p-8">
            {formState.status === "success" ? (
              <div className="flex flex-col items-center py-12 text-center">
                <CheckCircle className="mb-4 size-12 text-emerald-500" />
                <h3 className="font-heading text-xl font-bold text-obsidian">{t("contact.successTitle")}</h3>
                <p className="mt-2 text-sm text-obsidian/50">{formState.message}</p>
                <button
                  onClick={() => setFormState({ status: "idle" })}
                  className="mt-6 text-sm font-medium text-gold hover:text-gold-light"
                >
                  {t("contact.sendAnother")}
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
                toolname="contact_mystic_egypt"
                tooldescription="Send a message to the Mystic Egypt team with the visitor's name, email address, enquiry subject and message so the sales team can respond about tours and bookings."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="home-name" className="mb-1.5 block text-sm font-medium text-obsidian">
                      {t("contact.name")}
                    </label>
                    <input
                      id="home-name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      toolparamdescription="Full name of the person making the enquiry"
                      className="w-full rounded-xl border border-sand/40 bg-white px-4 py-3 text-sm text-obsidian outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="home-email" className="mb-1.5 block text-sm font-medium text-obsidian">
                      {t("contact.email")}
                    </label>
                    <input
                      id="home-email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      toolparamdescription="Email address to receive the reply"
                      className="w-full rounded-xl border border-sand/40 bg-white px-4 py-3 text-sm text-obsidian outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="home-subject" className="mb-1.5 block text-sm font-medium text-obsidian">
                    {t("contact.subject")}
                  </label>
                  <select
                    id="home-subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    toolparamdescription="Topic of the enquiry, one of: general, booking, custom, support"
                    className="w-full rounded-xl border border-sand/40 bg-white px-4 py-3 text-sm text-obsidian outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20"
                  >
                    <option value="">{t("contact.selectSubject")}</option>
                    <option value="general">{t("contact.subjectGeneral")}</option>
                    <option value="booking">{t("contact.subjectBooking")}</option>
                    <option value="custom">{t("contact.subjectCustom")}</option>
                    <option value="support">{t("contact.subjectSupport")}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="home-message" className="mb-1.5 block text-sm font-medium text-obsidian">
                    {t("contact.message")}
                  </label>
                  <textarea
                    id="home-message"
                    name="message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    toolparamdescription="The visitor's message with details of their enquiry"
                    className="w-full resize-none rounded-xl border border-sand/40 bg-white px-4 py-3 text-sm text-obsidian outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20"
                  />
                </div>

                {formState.status === "error" && (
                  <div className="flex items-center gap-2 rounded-lg bg-terracotta/10 px-4 py-3 text-sm text-terracotta">
                    <AlertCircle className="size-4 shrink-0" />
                    {formState.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={formState.status === "sending"}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-6 py-3.5 text-base font-semibold text-obsidian shadow-[0_4px_20px_rgba(212,175,55,0.3)] transition-all duration-300 hover:bg-gold-light hover:shadow-[0_4px_30px_rgba(212,175,55,0.5)] disabled:opacity-50"
                >
                  {formState.status === "sending" ? (
                    <>{t("contact.sending")}...</>
                  ) : (
                    <>
                      <Send className="size-4" />
                      {t("contact.send")}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
