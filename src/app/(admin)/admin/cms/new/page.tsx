"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TiptapEditor } from "@/features/admin/components/TiptapEditor";
import { createCmsPageAction } from "@/features/admin/actions";

export default function AdminCmsCreatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  }

  async function handleSubmit(publishNow: boolean) {
    if (!title || !slug || !content) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSaving(true);
    const result = await createCmsPageAction({
      title,
      slug,
      content,
      published: publishNow,
    });
    setSaving(false);
    if (result.ok) {
      toast.success("Page created.");
      router.push("/admin/cms");
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to create page.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/cms"
          className="inline-flex items-center justify-center size-9 rounded-xl hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Create CMS Page</h1>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="About Us"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Slug *</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="about-us"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Content *</label>
          <TiptapEditor content={content} onChange={setContent} />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => handleSubmit(false)}
            disabled={saving}
            className="rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={saving}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
