"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from "lucide-react";
import { trackEvent } from "@/core/lib/analytics";
import { BUSINESS } from "@/core/constants/business";

type FormState = {
  status: "idle" | "sending" | "success" | "error";
  message?: string;
};

type ContactPageClientProps = {
  phoneUK: string;
  phoneEG: string;
  whatsapp: string;
};

export function ContactPageClient({ phoneUK, phoneEG, whatsapp }: ContactPageClientProps) {
  const { t } = useTranslation();
  const [formState, setFormState] = useState<FormState>({ status: "idle" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const facebook = BUSINESS.facebook;
  const instagram = BUSINESS.instagram;

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

      trackEvent("generate_lead", { source: "contact_form" });
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
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="font-heading text-3xl font-bold tracking-wider text-obsidian sm:text-4xl">
          {t("contact.title")}
        </h1>
        <p className="mt-4 text-lg text-obsidian/50">
          {t("contact.subtitle")}
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        {/* Contact Info */}
        <div className="space-y-8">
          {/* Email */}
          <div className="rounded-2xl border border-gold/10 bg-white p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)]">
            <h2 className="font-heading mb-4 text-lg font-bold tracking-wider text-obsidian">
              {t("contact.getInfo")}
            </h2>
            <div className="space-y-4">
              <a
                href="mailto:info@mysticegypt.net"
                className="flex items-center gap-3 text-obsidian/60 transition-colors hover:text-gold"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-gold/10">
                  <Mail className="size-5 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-medium text-obsidian">Email</p>
                  <p className="text-sm">info@mysticegypt.net</p>
                </div>
              </a>
              {phoneUK && (
                <a
                  href={`tel:${phoneUK}`}
                  className="flex items-center gap-3 text-obsidian/60 transition-colors hover:text-gold"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-gold/10">
                    <Phone className="size-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-obsidian">UK Phone</p>
                    <p className="text-sm">{phoneUK}</p>
                  </div>
                </a>
              )}
              {phoneEG && (
                <a
                  href={`tel:${phoneEG}`}
                  className="flex items-center gap-3 text-obsidian/60 transition-colors hover:text-gold"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-gold/10">
                    <Phone className="size-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-obsidian">Egypt Phone</p>
                    <p className="text-sm">{phoneEG}</p>
                  </div>
                </a>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hello Mystic Egypt!")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("whatsapp_click", { location: "contact_page" })}
                  className="flex items-center gap-3 text-obsidian/60 transition-colors hover:text-green-600"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-green-50">
                    <svg className="size-5 text-green-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-obsidian">WhatsApp</p>
                    <p className="text-sm">Chat with us instantly</p>
                  </div>
                </a>
              )}
            </div>
          </div>

          {/* Social Media */}
          <div className="rounded-2xl border border-gold/10 bg-white p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)]">
            <h2 className="font-heading mb-4 text-lg font-bold tracking-wider text-obsidian">
              {t("contact.followUs")}
            </h2>
            <div className="flex gap-3">
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-gold/10 px-4 py-3 text-sm font-medium text-obsidian/60 transition-all duration-300 hover:border-gold/30 hover:text-gold"
              >
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </a>
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-gold/10 px-4 py-3 text-sm font-medium text-obsidian/60 transition-all duration-300 hover:border-gold/30 hover:text-gold"
              >
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                Instagram
              </a>
            </div>
          </div>

          {/* Office */}
          <div className="rounded-2xl border border-gold/10 bg-white p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)]">
            <h2 className="font-heading mb-4 text-lg font-bold tracking-wider text-obsidian">
              {t("contact.ourOffice")}
            </h2>
            <div className="flex items-start gap-3 text-obsidian/60">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold/10">
                <MapPin className="size-5 text-gold" />
              </div>
              <div>
                <p className="text-sm font-medium text-obsidian">UK Registered</p>
                <p className="text-sm">Mystic Egypt Ltd.</p>
                <p className="mt-1 text-xs text-obsidian/40">Company registered in England & Wales</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="rounded-2xl border border-gold/10 bg-white p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] sm:p-8">
          <h2 className="font-heading mb-6 text-lg font-bold tracking-wider text-obsidian">
            {t("contact.sendMessage")}
          </h2>

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
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-obsidian">
                    {t("contact.name")}
                  </label>
<input
                      id="name"
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
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-obsidian">
                    {t("contact.email")}
                  </label>
<input
                      id="email"
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
                <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-obsidian">
                  {t("contact.subject")}
                </label>
<select
                      id="subject"
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
                <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-obsidian">
                  {t("contact.message")}
                </label>
<textarea
                      id="message"
                      name="message"
                      rows={5}
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
  );
}
