/**
 * Real, verifiable public business identity. Single source of truth for the
 * email, phone numbers, social profiles and office addresses shown across
 * the site (footer, contact page, JSON-LD). Values were confirmed as real
 * by the company; the UK company registration *number* is intentionally
 * NOT published here (fraud-prevention decision).
 */
export const BUSINESS = {
  name: "Mystic Egypt",
  email: "info@mysticegypt.net",
  facebook: "https://www.facebook.com/profile.php?id=61579133165651",
  instagram: "https://www.instagram.com/mysticegyptt",
  phoneUK: {
    /** E.164 digits without "+", safe for tel: and wa.me links. */
    raw: "447412880087",
    /** Human-readable form, used for display. */
    display: "+44 7412 880087",
  },
  phoneEG: {
    raw: "201029226066",
    display: "+20 102 922 6066",
  },
  whatsapp: {
    raw: "447412880087",
    display: "+44 7412 880087",
  },
  addressUK: {
    streetAddress: "Cleveland Tower, Holloway Head",
    addressLocality: "Birmingham",
    addressCountry: "GB",
  },
  addressEG: {
    addressLocality: "Hurghada",
    addressCountry: "EG",
  },
} as const;

/** Office addresses as a schema-ORGANIZATION-friendly list. */
export const BUSINESS_ADDRESSES = [BUSINESS.addressUK, BUSINESS.addressEG] as const;

/** Contact points as a schema-ORGANIZATION-friendly list. */
export const BUSINESS_CONTACT_POINTS = [
  {
    "@type": "ContactPoint" as const,
    telephone: `+${BUSINESS.phoneUK.raw}`,
    contactType: "customer service",
    areaServed: ["GB", "EG"],
    availableLanguage: ["English", "Arabic", "German", "Hungarian"],
  },
  {
    "@type": "ContactPoint" as const,
    telephone: `+${BUSINESS.phoneEG.raw}`,
    contactType: "customer service",
    areaServed: ["EG"],
    availableLanguage: ["English", "Arabic", "German", "Hungarian"],
  },
  {
    "@type": "ContactPoint" as const,
    email: BUSINESS.email,
    contactType: "customer support",
  },
] as const;