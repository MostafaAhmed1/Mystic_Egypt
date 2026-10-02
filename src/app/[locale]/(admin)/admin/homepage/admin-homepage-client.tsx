"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { HOMEPAGE_SERVICE_ICONS, type HomepageCategoryInput, type HomepageCategoryRecord, type HomepageServiceIcon, type HomepageServiceInput, type HomepageServiceRecord } from "@/features/homepage/types";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";

type CategoryDraft = HomepageCategoryInput & { id: string | null };
type ServiceDraft = HomepageServiceInput & { id: string | null };

type AdminHomepageClientProps = {
  initialCategories: HomepageCategoryRecord[];
  initialServices: HomepageServiceRecord[];
};

function newCategory(): CategoryDraft {
  return {
    id: null,
    slug: "",
    name_en: "",
    name_ar: "",
    name_de: "",
    image_url: "/uploads/categories/",
    sort_order: 0,
    is_active: true,
  };
}

function newService(): ServiceDraft {
  return {
    id: null,
    slug: "",
    name_en: "",
    name_ar: "",
    name_de: "",
    description_en: "",
    description_ar: "",
    description_de: "",
    icon: "compass",
    sort_order: 0,
    is_active: true,
  };
}

function responseError(payload: unknown, fallback: string): string {
  if (payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string") {
    return payload.error;
  }
  return fallback;
}

export function AdminHomepageClient({
  initialCategories,
  initialServices,
}: AdminHomepageClientProps) {
  const { t } = useTranslation("common");
  const [categories, setCategories] = useState(initialCategories);
  const [services, setServices] = useState(initialServices);
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft | null>(null);
  const [serviceDraft, setServiceDraft] = useState<ServiceDraft | null>(null);
  const [saving, setSaving] = useState<"category" | "service" | null>(null);

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!categoryDraft) return;
    setSaving("category");

    const isEditing = Boolean(categoryDraft.id);
    const endpoint = isEditing
      ? API_ENDPOINTS.ADMIN.HOMEPAGE.CATEGORIES.BY_ID(categoryDraft.id as string)
      : API_ENDPOINTS.ADMIN.HOMEPAGE.CATEGORIES.CREATE;
    const response = await fetch(endpoint, {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(categoryDraft),
    });
    const payload: unknown = await response.json().catch(() => null);
    setSaving(null);

    if (!response.ok) {
      toast.error(responseError(payload, t("admin.homepageSaveFailed", "Could not save category.")));
      return;
    }

    const category = payload as { category: HomepageCategoryRecord };
    setCategories((current) =>
      isEditing
        ? current.map((item) => (item.id === category.category.id ? category.category : item))
        : [...current, category.category],
    );
    setCategoryDraft(null);
    toast.success(t("admin.homepageSaved", "Changes saved."));
  }

  async function saveService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!serviceDraft) return;
    setSaving("service");

    const isEditing = Boolean(serviceDraft.id);
    const endpoint = isEditing
      ? API_ENDPOINTS.ADMIN.HOMEPAGE.SERVICES.BY_ID(serviceDraft.id as string)
      : API_ENDPOINTS.ADMIN.HOMEPAGE.SERVICES.CREATE;
    const response = await fetch(endpoint, {
      method: isEditing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serviceDraft),
    });
    const payload: unknown = await response.json().catch(() => null);
    setSaving(null);

    if (!response.ok) {
      toast.error(responseError(payload, t("admin.homepageSaveFailed", "Could not save service.")));
      return;
    }

    const service = payload as { service: HomepageServiceRecord };
    setServices((current) =>
      isEditing
        ? current.map((item) => (item.id === service.service.id ? service.service : item))
        : [...current, service.service],
    );
    setServiceDraft(null);
    toast.success(t("admin.homepageSaved", "Changes saved."));
  }

  async function deleteCategory(id: string) {
    if (!window.confirm(t("admin.deleteCategoryConfirm", "Delete this category?"))) return;
    const response = await fetch(API_ENDPOINTS.ADMIN.HOMEPAGE.CATEGORIES.BY_ID(id), { method: "DELETE" });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      toast.error(responseError(payload, t("admin.homepageDeleteFailed", "Could not delete category.")));
      return;
    }
    setCategories((current) => current.filter((item) => item.id !== id));
    toast.success(t("admin.homepageDeleted", "Item deleted."));
  }

  async function deleteService(id: string) {
    if (!window.confirm(t("admin.deleteServiceConfirm", "Delete this service?"))) return;
    const response = await fetch(API_ENDPOINTS.ADMIN.HOMEPAGE.SERVICES.BY_ID(id), { method: "DELETE" });
    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      toast.error(responseError(payload, t("admin.homepageDeleteFailed", "Could not delete service.")));
      return;
    }
    setServices((current) => current.filter((item) => item.id !== id));
    toast.success(t("admin.homepageDeleted", "Item deleted."));
  }

  function editCategory(category: HomepageCategoryRecord) {
    setCategoryDraft({
      id: category.id,
      slug: category.slug,
      name_en: category.name_en,
      name_ar: category.name_ar,
      name_de: category.name_de,
      image_url: category.image_url,
      sort_order: category.sort_order,
      is_active: category.is_active,
    });
  }

  function editService(service: HomepageServiceRecord) {
    setServiceDraft({
      id: service.id,
      slug: service.slug,
      name_en: service.name_en,
      name_ar: service.name_ar,
      name_de: service.name_de,
      description_en: service.description_en,
      description_ar: service.description_ar,
      description_de: service.description_de,
      icon: service.icon,
      sort_order: service.sort_order,
      is_active: service.is_active,
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("admin.homepage", "Homepage")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("admin.manageHomepage", "Manage the homepage services and categories.")}
        </p>
      </div>

      <section className="rounded-2xl border bg-card p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{t("admin.categories", "Categories")}</h2>
            <p className="text-sm text-muted-foreground">{t("admin.categoriesDescription", "Displayed below Services on the homepage.")}</p>
          </div>
          <Button type="button" onClick={() => setCategoryDraft(newCategory())}>
            <Plus aria-hidden />
            {t("admin.addCategory", "Add category")}
          </Button>
        </div>

        {categoryDraft && (
          <form onSubmit={saveCategory} className="mb-6 grid gap-4 rounded-xl border border-gold/20 bg-sand/20 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{categoryDraft.id ? t("admin.editCategory", "Edit category") : t("admin.addCategory", "Add category")}</h3>
              <Button type="button" variant="ghost" size="icon" onClick={() => setCategoryDraft(null)} aria-label={t("common.close", "Close")}>
                <X aria-hidden />
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t("admin.slug", "Slug")}>
                <Input required value={categoryDraft.slug} onChange={(event) => setCategoryDraft({ ...categoryDraft, slug: event.target.value })} placeholder="desert-safari" />
              </Field>
              <Field label={t("admin.imagePath", "Local image path")}>
                <Input required value={categoryDraft.image_url} onChange={(event) => setCategoryDraft({ ...categoryDraft, image_url: event.target.value })} placeholder="Image address" />
              </Field>
              <Field label="English name">
                <Input required value={categoryDraft.name_en} onChange={(event) => setCategoryDraft({ ...categoryDraft, name_en: event.target.value })} />
              </Field>
              <Field label="الاسم بالعربية">
                <Input required dir="rtl" value={categoryDraft.name_ar} onChange={(event) => setCategoryDraft({ ...categoryDraft, name_ar: event.target.value })} />
              </Field>
              <Field label="Deutscher Name">
                <Input required value={categoryDraft.name_de} onChange={(event) => setCategoryDraft({ ...categoryDraft, name_de: event.target.value })} />
              </Field>
              <Field label={t("admin.sortOrder", "Sort order")}>
                <Input required type="number" value={categoryDraft.sort_order} onChange={(event) => setCategoryDraft({ ...categoryDraft, sort_order: Number(event.target.value) })} />
              </Field>
            </div>
            {categoryDraft.image_url.startsWith("/uploads/") && (
              <Image src={categoryDraft.image_url} alt="" width={280} height={120} className="h-28 w-full max-w-sm rounded-lg object-cover" unoptimized />
            )}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={categoryDraft.is_active} onChange={(event) => setCategoryDraft({ ...categoryDraft, is_active: event.target.checked })} />
              {t("admin.active", "Active")}
            </label>
            <Button type="submit" disabled={saving === "category"}>
              <Save aria-hidden />
              {saving === "category" ? t("common.saving", "Saving...") : t("common.save", "Save")}
            </Button>
          </form>
        )}

        <ItemTable
          items={categories}
          primary={(item) => item.name_en}
          secondary={(item) => `/${item.slug}`}
          selectedId={categoryDraft?.id ?? null}
          onEdit={editCategory}
          onDelete={deleteCategory}
          editLabel={t("admin.edit", "Edit")}
          deleteLabel={t("admin.delete", "Delete")}
          emptyLabel={t("admin.noCategories", "No categories yet.")}
        />
      </section>

      <section className="rounded-2xl border bg-card p-5">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{t("admin.services", "Services")}</h2>
            <p className="text-sm text-muted-foreground">{t("admin.servicesDescription", "Displayed in the moving services strip.")}</p>
          </div>
          <Button type="button" onClick={() => setServiceDraft(newService())}>
            <Plus aria-hidden />
            {t("admin.addService", "Add service")}
          </Button>
        </div>

        {serviceDraft && (
          <form onSubmit={saveService} className="mb-6 grid gap-4 rounded-xl border border-gold/20 bg-sand/20 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{serviceDraft.id ? t("admin.editService", "Edit service") : t("admin.addService", "Add service")}</h3>
              <Button type="button" variant="ghost" size="icon" onClick={() => setServiceDraft(null)} aria-label={t("common.close", "Close")}>
                <X aria-hidden />
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t("admin.slug", "Slug")}>
                <Input required value={serviceDraft.slug} onChange={(event) => setServiceDraft({ ...serviceDraft, slug: event.target.value })} placeholder="guided-tours" />
              </Field>
              <Field label={t("admin.icon", "Icon")}>
                <select value={serviceDraft.icon} onChange={(event) => setServiceDraft({ ...serviceDraft, icon: event.target.value as HomepageServiceIcon })} className="h-10 w-full rounded-lg border border-sand/60 bg-white px-3 text-sm">
                  {HOMEPAGE_SERVICE_ICONS.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
                </select>
              </Field>
              <Field label="English name">
                <Input required value={serviceDraft.name_en} onChange={(event) => setServiceDraft({ ...serviceDraft, name_en: event.target.value })} />
              </Field>
              <Field label="الاسم بالعربية">
                <Input required dir="rtl" value={serviceDraft.name_ar} onChange={(event) => setServiceDraft({ ...serviceDraft, name_ar: event.target.value })} />
              </Field>
              <Field label="Deutscher Name">
                <Input required value={serviceDraft.name_de} onChange={(event) => setServiceDraft({ ...serviceDraft, name_de: event.target.value })} />
              </Field>
              <Field label={t("admin.sortOrder", "Sort order")}>
                <Input required type="number" value={serviceDraft.sort_order} onChange={(event) => setServiceDraft({ ...serviceDraft, sort_order: Number(event.target.value) })} />
              </Field>
              <Field label="English description">
                <Textarea required value={serviceDraft.description_en} onChange={(event) => setServiceDraft({ ...serviceDraft, description_en: event.target.value })} />
              </Field>
              <Field label="الوصف بالعربية">
                <Textarea required dir="rtl" value={serviceDraft.description_ar} onChange={(event) => setServiceDraft({ ...serviceDraft, description_ar: event.target.value })} />
              </Field>
              <Field label="Deutsche Beschreibung">
                <Textarea required value={serviceDraft.description_de} onChange={(event) => setServiceDraft({ ...serviceDraft, description_de: event.target.value })} />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={serviceDraft.is_active} onChange={(event) => setServiceDraft({ ...serviceDraft, is_active: event.target.checked })} />
              {t("admin.active", "Active")}
            </label>
            <Button type="submit" disabled={saving === "service"}>
              <Save aria-hidden />
              {saving === "service" ? t("common.saving", "Saving...") : t("common.save", "Save")}
            </Button>
          </form>
        )}

        <ItemTable
          items={services}
          primary={(item) => item.name_en}
          secondary={(item) => `/${item.slug}`}
          selectedId={serviceDraft?.id ?? null}
          onEdit={editService}
          onDelete={deleteService}
          editLabel={t("admin.edit", "Edit")}
          deleteLabel={t("admin.delete", "Delete")}
          emptyLabel={t("admin.noServices", "No services yet.")}
        />
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}

type ItemTableProps<T extends { id: string; is_active: boolean }> = {
  items: T[];
  primary: (item: T) => string;
  secondary: (item: T) => string;
  selectedId: string | null;
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
  editLabel: string;
  deleteLabel: string;
  emptyLabel: string;
};

function ItemTable<T extends { id: string; is_active: boolean }>({
  items,
  primary,
  secondary,
  selectedId,
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
  emptyLabel,
}: ItemTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-start text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Slug</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 text-end font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">{emptyLabel}</td></tr>
          ) : items.map((item) => (
            <tr key={item.id} className={`border-t ${selectedId === item.id ? "bg-gold/5" : ""}`}>
              <td className="px-4 py-3 font-medium">{primary(item)}</td>
              <td className="px-4 py-3 text-muted-foreground">{secondary(item)}</td>
              <td className="px-4 py-3"><span className={item.is_active ? "text-green-600" : "text-muted-foreground"}>{item.is_active ? "Active" : "Hidden"}</span></td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Button type="button" variant="ghost" size="icon" onClick={() => onEdit(item)} aria-label={editLabel}><Pencil aria-hidden /></Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => onDelete(item.id)} aria-label={deleteLabel}><Trash2 aria-hidden /></Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
