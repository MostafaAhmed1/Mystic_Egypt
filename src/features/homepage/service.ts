import "server-only";

import { cache } from "react";
import type {
  Category as CategoryModel,
  Service as ServiceModel,
} from "@/core/generated/prisma/client";
import { defaultLocale, type Locale } from "@/core/i18n-config";
import { prisma } from "@/core/lib/prisma";
import {
  HOMEPAGE_SERVICE_ICONS,
  type HomepageCategory,
  type HomepageCategoryInput,
  type HomepageCategoryRecord,
  type HomepageService,
  type HomepageServiceIcon,
  type HomepageServiceInput,
  type HomepageServiceRecord,
} from "@/features/homepage/types";

function localizedCategoryName(category: CategoryModel, locale: Locale): string {
  if (locale === "ar") return category.name_ar || category.name_en;
  if (locale === "de") return category.name_de || category.name_en;
  return category.name_en;
}

function localizedService(service: ServiceModel, locale: Locale): { name: string; description: string } {
  if (locale === "ar") {
    return {
      name: service.name_ar || service.name_en,
      description: service.description_ar || service.description_en,
    };
  }

  if (locale === "de") {
    return {
      name: service.name_de || service.name_en,
      description: service.description_de || service.description_en,
    };
  }

  return { name: service.name_en, description: service.description_en };
}

function toCategoryRecord(category: CategoryModel): HomepageCategoryRecord {
  return {
    id: category.id,
    slug: category.slug,
    name_en: category.name_en,
    name_ar: category.name_ar,
    name_de: category.name_de,
    image_url: category.image_url,
    sort_order: category.sort_order,
    is_active: category.is_active,
    created_at: category.created_at.toISOString(),
    updated_at: category.updated_at.toISOString(),
  };
}

function toServiceRecord(service: ServiceModel): HomepageServiceRecord {
  return {
    id: service.id,
    slug: service.slug,
    name_en: service.name_en,
    name_ar: service.name_ar,
    name_de: service.name_de,
    description_en: service.description_en,
    description_ar: service.description_ar,
    description_de: service.description_de,
    icon: service.icon as HomepageServiceIcon,
    sort_order: service.sort_order,
    is_active: service.is_active,
    created_at: service.created_at.toISOString(),
    updated_at: service.updated_at.toISOString(),
  };
}

export const listPublicHomepageCategories = cache(
  async (locale: Locale = defaultLocale): Promise<HomepageCategory[]> => {
    const categories = await prisma.category.findMany({
      where: { is_active: true },
      orderBy: [{ sort_order: "asc" }, { created_at: "asc" }],
    });

    return categories.map((category) => ({
      id: category.id,
      slug: category.slug,
      name: localizedCategoryName(category, locale),
      imageUrl: category.image_url,
      sortOrder: category.sort_order,
    }));
  },
);

export const listPublicHomepageServices = cache(
  async (locale: Locale = defaultLocale): Promise<HomepageService[]> => {
    const services = await prisma.service.findMany({
      where: { is_active: true },
      orderBy: [{ sort_order: "asc" }, { created_at: "asc" }],
    });

    return services.map((service) => {
      const localized = localizedService(service, locale);
      return {
        id: service.id,
        slug: service.slug,
        name: localized.name,
        description: localized.description,
        icon: service.icon as HomepageServiceIcon,
        sortOrder: service.sort_order,
      };
    });
  },
);

export async function listAdminHomepageCategories(): Promise<HomepageCategoryRecord[]> {
  const categories = await prisma.category.findMany({
    orderBy: [{ sort_order: "asc" }, { created_at: "asc" }],
  });
  return categories.map(toCategoryRecord);
}

export async function createHomepageCategory(
  input: HomepageCategoryInput,
): Promise<HomepageCategoryRecord> {
  const category = await prisma.category.create({ data: input });
  return toCategoryRecord(category);
}

export async function updateHomepageCategory(
  id: string,
  input: HomepageCategoryInput,
): Promise<HomepageCategoryRecord | null> {
  try {
    const category = await prisma.category.update({ where: { id }, data: input });
    return toCategoryRecord(category);
  } catch (error) {
    if (isRecordNotFound(error)) return null;
    throw error;
  }
}

export async function deleteHomepageCategory(id: string): Promise<boolean> {
  try {
    await prisma.category.delete({ where: { id } });
    return true;
  } catch (error) {
    if (isRecordNotFound(error)) return false;
    throw error;
  }
}

export async function listAdminHomepageServices(): Promise<HomepageServiceRecord[]> {
  const services = await prisma.service.findMany({
    orderBy: [{ sort_order: "asc" }, { created_at: "asc" }],
  });
  return services.map(toServiceRecord);
}

export async function createHomepageService(
  input: HomepageServiceInput,
): Promise<HomepageServiceRecord> {
  const service = await prisma.service.create({ data: input });
  return toServiceRecord(service);
}

export async function updateHomepageService(
  id: string,
  input: HomepageServiceInput,
): Promise<HomepageServiceRecord | null> {
  try {
    const service = await prisma.service.update({ where: { id }, data: input });
    return toServiceRecord(service);
  } catch (error) {
    if (isRecordNotFound(error)) return null;
    throw error;
  }
}

export async function deleteHomepageService(id: string): Promise<boolean> {
  try {
    await prisma.service.delete({ where: { id } });
    return true;
  } catch (error) {
    if (isRecordNotFound(error)) return false;
    throw error;
  }
}

function isRecordNotFound(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  if (!("code" in error)) return false;
  return error.code === "P2025";
}

export function isHomepageServiceIcon(value: string): value is HomepageServiceIcon {
  return HOMEPAGE_SERVICE_ICONS.some((icon) => icon === value);
}
