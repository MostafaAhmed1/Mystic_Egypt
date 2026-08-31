"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createAdminAction } from "@/features/admin/actions";
import { useLocale } from "@/shared/hooks/use-locale";

export default function AdminCreateAdminPage() {
  const router = useRouter();
  const { href } = useLocale();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setSaving(true);
    const result = await createAdminAction({ name, email, password });
    setSaving(false);

    if (result.ok) {
      toast.success("Admin created successfully.");
      router.push(href("/admin/admins"));
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to create admin.");
    }
  }

  return (
    <div className="mx-auto max-w-lg flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link
          href={href("/admin/admins")}
          className="inline-flex items-center justify-center size-9 rounded-xl hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Add Admin</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border bg-card p-6">
        <div>
          <label className="mb-1 block text-sm font-medium">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Full name"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="admin@example.com"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password *</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Min. 8 characters"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create Admin"}
        </button>
      </form>
    </div>
  );
}
