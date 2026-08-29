"use client";

import { useRef } from "react";
import { UploadCloud, FileText } from "lucide-react";
import { ALLOWED_RECEIPT_MIME_TYPES, MAX_RECEIPT_SIZE_BYTES } from "@/core/utils/validation";
import { Field, FieldError } from "@/shared/components/ui/field";

export interface ReceiptFileState {
  file: File | null;
  error: string | null;
}

export function ReceiptUpload({
  value,
  onChange,
}: {
  value: ReceiptFileState;
  onChange: (state: ReceiptFileState) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined | null) {
    if (!file) {
      onChange({ file: null, error: null });
      return;
    }
    const allowed = ALLOWED_RECEIPT_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_RECEIPT_MIME_TYPES)[number],
    );
    if (!allowed) {
      onChange({
        file: null,
        error: "File type not allowed. Please upload a JPEG, PNG or PDF.",
      });
      return;
    }
    if (file.size > MAX_RECEIPT_SIZE_BYTES) {
      onChange({
        file: null,
        error: "File is too large. Maximum allowed size is 5 MB.",
      });
      return;
    }
    onChange({ file, error: null });
  }

  return (
    <Field>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-muted/20 px-4 py-8 text-center hover:bg-muted/40"
      >
        {value.file ? (
          <>
            <FileText className="size-6 text-primary" aria-hidden />
            <span className="text-sm font-medium">{value.file.name}</span>
          </>
        ) : (
          <>
            <UploadCloud className="size-6 text-muted-foreground" aria-hidden />
            <span className="text-sm text-muted-foreground">
              Upload your bank transfer receipt
            </span>
            <span className="text-xs text-muted-foreground/70">
              JPEG, PNG or PDF — max 5 MB
            </span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        id="receipt"
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        className="hidden"
        aria-invalid={Boolean(value.error)}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <FieldError
        errors={value.error ? [{ message: value.error }] : undefined}
      />
    </Field>
  );
}
