"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteAdminAction } from "@/features/admin/actions";

export function DeleteAdminButton({
  adminId,
  adminName,
}: {
  adminId: string;
  adminName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Remove admin "${adminName}"? This action cannot be undone.`)) return;
    setLoading(true);
    const result = await deleteAdminAction(adminId);
    setLoading(false);
    if (result.ok) {
      toast.success("Admin removed.");
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to remove admin.");
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center justify-center size-8 rounded-lg text-destructive hover:bg-destructive/10"
      title="Remove admin"
    >
      <Trash2 className="size-4" />
    </button>
  );
}
