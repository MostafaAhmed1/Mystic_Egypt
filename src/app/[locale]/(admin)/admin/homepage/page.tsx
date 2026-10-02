import type { Metadata } from "next";
import { AdminHomepageClient } from "@/app/[locale]/(admin)/admin/homepage/admin-homepage-client";
import {
  listAdminHomepageCategories,
  listAdminHomepageOffers,
  listAdminHomepageServices,
} from "@/features/homepage/service";
import type {
  HomepageCategoryRecord,
  HomepageOfferRecord,
  HomepageServiceRecord,
} from "@/features/homepage/types";

export const metadata: Metadata = {
  title: "Homepage",
};

export default async function AdminHomepagePage() {
  let categories: HomepageCategoryRecord[] = [];
  let services: HomepageServiceRecord[] = [];
  let offers: HomepageOfferRecord[] = [];

  try {
    [categories, services, offers] = await Promise.all([
      listAdminHomepageCategories(),
      listAdminHomepageServices(),
      listAdminHomepageOffers(),
    ]);
  } catch {
    categories = [];
    services = [];
    offers = [];
  }

  return (
    <AdminHomepageClient
      initialCategories={categories}
      initialServices={services}
      initialOffers={offers}
    />
  );
}
