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
