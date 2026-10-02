import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { TOUR_IMAGE_URL_PREFIX, TOURS_UPLOAD_URL_PREFIX } from "@/core/constants/uploads";

// Tour images uploaded from the admin panel are stored on the local VPS
// filesystem under public/uploads/tours/admin, then served as static files
// (same flow as bank-transfer receipts). In production public/uploads is a
// bind mount, so files written here persist on the host. Nginx blocks script
// execution inside /uploads (see MANUAL_STEPS.md).
export const MAX_TOUR_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const TOUR_UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads", "tours");
const ADMIN_UPLOADS_DIR = path.join(TOUR_UPLOADS_ROOT, "admin");

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export type TourImageFileResult = { url: string; error?: never } | { url?: never; error: string };

function sniffImageType(bytes: Uint8Array): string | null {
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length > 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    bytes.length > 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

/**
 * Validates a tour image File (MIME allowlist, size limit, magic-byte sniff)
 * and saves it to public/uploads/tours/admin/<uuid>.<ext>.
 * Returns the public URL path (e.g. "/uploads/tours/admin/<uuid>.jpg").
 */
export async function saveTourImageFile(file: File): Promise<TourImageFileResult> {
  if (file.size === 0) {
    return { error: "The selected file is empty." };
  }
  if (file.size > MAX_TOUR_IMAGE_SIZE_BYTES) {
    return { error: "File is too large. Maximum allowed size is 10 MB." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detectedType = sniffImageType(buffer);
  if (!detectedType) {
    return { error: "File is not a valid image. Please upload a JPEG, PNG or WebP." };
  }
  if (!Object.hasOwn(EXTENSION_BY_TYPE, detectedType)) {
    return { error: "File type not allowed. Please upload a JPEG, PNG or WebP." };
  }

  const filename = `${randomUUID()}${EXTENSION_BY_TYPE[detectedType]}`;
  await fs.mkdir(ADMIN_UPLOADS_DIR, { recursive: true });
  await fs.writeFile(path.join(ADMIN_UPLOADS_DIR, filename), buffer);

  return { url: `${TOUR_IMAGE_URL_PREFIX}${filename}` };
}

/**
 * Permanently deletes a tour image file from the server. Only files inside
 * public/uploads/tours are ever touched — path-traversal guarded; receipts,
 * categories and external URLs are rejected.
 */
export async function deleteTourImageFile(url: string): Promise<TourImageFileResult> {
  if (!url.startsWith(TOURS_UPLOAD_URL_PREFIX)) {
    return { error: "This image is not stored on this server." };
  }

  const relative = url.slice(TOURS_UPLOAD_URL_PREFIX.length);
  const target = path.resolve(TOUR_UPLOADS_ROOT, relative);
  if (!target.startsWith(`${TOUR_UPLOADS_ROOT}${path.sep}`)) {
    return { error: "Invalid file path." };
  }

  await fs.rm(target, { force: true });
  return { url };
}
