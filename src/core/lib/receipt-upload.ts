import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { validateReceiptFile } from "@/core/utils/validation";

// Receipts are stored on the local VPS filesystem under public/uploads/receipts,
// then served as static files. In production, Nginx must block script execution
// inside public/uploads (see MANUAL_STEPS.md).
const RECEIPTS_DIR = path.join(process.cwd(), "public", "uploads", "receipts");

const ALLOWED_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "application/pdf": ".pdf",
};

/**
 * Validates a bank-transfer receipt File and saves it to the local uploads dir.
 * Returns the public URL path (e.g. "/uploads/receipts/<uuid>.jpg").
 */
export async function saveReceiptFile(file: File): Promise<{
  url: string;
  error?: never;
} | { url?: never; error: string }> {
  const check = validateReceiptFile(file);
  if (!check.valid) {
    return { error: check.error };
  }

  const extension = ALLOWED_EXTENSIONS[file.type];
  const filename = `${randomUUID()}${extension}`;

  await fs.mkdir(RECEIPTS_DIR, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(RECEIPTS_DIR, filename), buffer);

  return { url: `/uploads/receipts/${filename}` };
}
