import type { Metadata } from "next";
import { AdminHomepageClient } from "@/app/[locale]/(admin)/admin/homepage/admin-homepage-client";
import {
  listAdminHomepageCategories,
  listAdminHomepageServices,
} from "@/features/homepage/service";
import type {
  HomepageCategoryRecord,
  HomepageServiceRecord,
} from "@/features/homepage/types";

export const metadata: Metadata = {
  title: "Homepage",
};

export default async function AdminHomepagePage() {
  let categories: HomepageCategoryRecord[] = [];
  let services: HomepageServiceRecord[] = [];

  try {
    [categories, services] = await Promise.all([
      listAdminHomepageCategories(),
      listAdminHomepageServices(),
    ]);
  } catch {
    categories = [];
    services = [];
  }

  return (
    <AdminHomepageClient
      initialCategories={categories}
      initialServices={services}
    />
  );
}
