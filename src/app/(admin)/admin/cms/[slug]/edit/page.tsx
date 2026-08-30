"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TiptapEditor } from "@/features/admin/components/TiptapEditor";
import { updateCmsPageAction } from "@/features/admin/actions";
import { DeleteCmsPageButton } from "@/features/admin/components/CmsActions";

interface CmsPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
}

export default function AdminCmsEditPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [page, setPage] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch(`/api/admin/cms/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setPage(data.page);
          setTitle(data.page.title);
          setNewSlug(data.page.slug);
          setContent(data.page.content);
        } else {
          toast.error("Page not found.");
          router.push("/admin/cms");
        }
      })
      .catch(() => toast.error("Failed to load page."))
      .finally(() => setLoading(false));
  }, [slug, router]);

  async function handleSave() {
    if (!page || !title || !newSlug || !content) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSaving(true);
    const result = await updateCmsPageAction(page.id, {
      title,
      slug: newSlug,
      content,
    });
    setSaving(false);
    if (result.ok) {
      toast.success("Page updated.");
      if (newSlug !== slug) {
        router.push(`/admin/cms/${newSlug}/edit`);
      } else {
        router.refresh();
      }
    } else {
      toast.error(result.error ?? "Failed to update page.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/cms"
            className="inline-flex items-center justify-center size-9 rounded-xl hover:bg-muted"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Edit: {title}</h1>
        </div>
        {page && (
          <DeleteCmsPageButton
            pageId={page.id}
            onDelete={() => {
              router.push("/admin/cms");
              router.refresh();
            }}
          />
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Slug *</label>
            <input
              type="text"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Content *</label>
          <TiptapEditor content={content} onChange={setContent} />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
