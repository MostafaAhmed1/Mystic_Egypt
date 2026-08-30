"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import {
  toggleCmsPagePublishedAction,
  deleteCmsPageAction,
} from "@/features/admin/actions";

export function ToggleCmsPublishedButton({
  pageId,
  published,
}: {
  pageId: string;
  published: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const result = await toggleCmsPagePublishedAction(pageId);
    setLoading(false);
    if (result.ok) {
      toast.success(result.published ? "Page published." : "Page unpublished.");
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to toggle.");
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted"
      title={published ? "Unpublish" : "Publish"}
    >
      {published ? <Eye className="size-4 text-green-600" /> : <EyeOff className="size-4 text-yellow-600" />}
    </button>
  );
}

export function DeleteCmsPageButton({
  pageId,
  onDelete,
}: {
  pageId: string;
  onDelete?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this page?")) return;
    setLoading(true);
    const result = await deleteCmsPageAction(pageId);
    setLoading(false);
    if (result.ok) {
      toast.success("Page deleted.");
      onDelete?.();
    } else {
      toast.error(result.error ?? "Failed to delete.");
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-500/10"
    >
      <Trash2 className="size-4" />
      Delete
    </button>
  );
}
