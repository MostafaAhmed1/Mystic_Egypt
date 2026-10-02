import {
  HOMEPAGE_SERVICE_ICONS,
  type HomepageCategoryInput,
  type HomepageServiceInput,
  type HomepageServiceIcon,
} from "@/features/homepage/types";

export class HomepageValidationError extends Error {}

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HomepageValidationError("Request body must be an object.");
  }
  return value as JsonRecord;
}

function requiredString(record: JsonRecord, key: string, maxLength: number): string {
  const value = record[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HomepageValidationError(`${key} is required.`);
  }
  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new HomepageValidationError(`${key} is too long.`);
  }
  return normalized;
}

function requiredSlug(record: JsonRecord): string {
  const slug = requiredString(record, "slug", 191).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new HomepageValidationError("slug must contain lowercase letters, numbers, and hyphens only.");
  }
  return slug;
}

function requiredImagePath(record: JsonRecord): string {
  const imageUrl = requiredString(record, "image_url", 500);
  if (!imageUrl.startsWith("/uploads/")) {
    throw new HomepageValidationError("image_url must be a local path under /uploads/.");
  }
  return imageUrl;
}

function integerValue(record: JsonRecord, key: string): number {
  const value = record[key];
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(parsed)) {
    throw new HomepageValidationError(`${key} must be an integer.`);
  }
  return parsed;
}

function booleanValue(record: JsonRecord, key: string): boolean {
  const value = record[key];
  if (value === undefined) return true;
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new HomepageValidationError(`${key} must be a boolean.`);
}

function serviceIcon(record: JsonRecord): HomepageServiceIcon {
  const icon = requiredString(record, "icon", 40);
  if (!HOMEPAGE_SERVICE_ICONS.some((candidate) => candidate === icon)) {
    throw new HomepageValidationError(`icon must be one of: ${HOMEPAGE_SERVICE_ICONS.join(", ")}.`);
  }
  return icon as HomepageServiceIcon;
}

export function parseHomepageCategoryInput(value: unknown): HomepageCategoryInput {
  const record = asRecord(value);
  return {
    slug: requiredSlug(record),
    name_en: requiredString(record, "name_en", 160),
    name_ar: requiredString(record, "name_ar", 160),
    name_de: requiredString(record, "name_de", 160),
    image_url: requiredImagePath(record),
    sort_order: integerValue(record, "sort_order"),
    is_active: booleanValue(record, "is_active"),
  };
}

export function parseHomepageServiceInput(value: unknown): HomepageServiceInput {
  const record = asRecord(value);
  return {
    slug: requiredSlug(record),
    name_en: requiredString(record, "name_en", 160),
    name_ar: requiredString(record, "name_ar", 160),
    name_de: requiredString(record, "name_de", 160),
    description_en: requiredString(record, "description_en", 5000),
    description_ar: requiredString(record, "description_ar", 5000),
    description_de: requiredString(record, "description_de", 5000),
    icon: serviceIcon(record),
    sort_order: integerValue(record, "sort_order"),
    is_active: booleanValue(record, "is_active"),
  };
}
