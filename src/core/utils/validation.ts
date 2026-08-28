// File upload validation for receipt uploads (per Technical Execution SOP):
//  - Allowed MIME types: image/jpeg, image/png, image/pdf
//  - Max size: 5 MB

export const ALLOWED_RECEIPT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const;

export const MAX_RECEIPT_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface FileLike {
  type: string;
  size: number;
}

export type ValidationResult =
  | { valid: true }
  | { valid: false; error: string };

export function validateReceiptFile(file: FileLike): ValidationResult {
  if (!ALLOWED_RECEIPT_MIME_TYPES.includes(file.type as never)) {
    return {
      valid: false,
      error: "File type not allowed. Please upload a JPEG, PNG or PDF.",
    };
  }

  if (file.size > MAX_RECEIPT_SIZE_BYTES) {
    return {
      valid: false,
      error: "File is too large. Maximum allowed size is 5 MB.",
    };
  }

  return { valid: true };
}
