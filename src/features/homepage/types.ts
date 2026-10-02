export const HOMEPAGE_SERVICE_ICONS = [
  "hotel",
  "plane",
  "car",
  "compass",
] as const;

export type HomepageServiceIcon = (typeof HOMEPAGE_SERVICE_ICONS)[number];
export type HomepageLocale = "en" | "ar" | "de";

export interface HomepageCategory {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
  sortOrder: number;
}

export interface HomepageService {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: HomepageServiceIcon;
  sortOrder: number;
}

export interface HomepageCategoryRecord {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  name_de: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HomepageServiceRecord {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  name_de: string;
  description_en: string;
  description_ar: string;
  description_de: string;
  icon: HomepageServiceIcon;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HomepageCategoryInput {
  slug: string;
  name_en: string;
  name_ar: string;
  name_de: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

export interface HomepageServiceInput {
  slug: string;
  name_en: string;
  name_ar: string;
  name_de: string;
  description_en: string;
  description_ar: string;
  description_de: string;
  icon: HomepageServiceIcon;
  sort_order: number;
  is_active: boolean;
}

export interface HomepageOffer {
  id: string;
  title: string;
  description: string | null;
  badge: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  sortOrder: number;
}

export interface HomepageOfferRecord {
  id: string;
  title_en: string;
  title_ar: string;
  title_de: string;
  description_en: string | null;
  description_ar: string | null;
  description_de: string | null;
  badge: string | null;
  image_url: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HomepageOfferInput {
  title_en: string;
  title_ar: string;
  title_de: string;
  description_en: string | null;
  description_ar: string | null;
  description_de: string | null;
  badge: string | null;
  image_url: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
}
