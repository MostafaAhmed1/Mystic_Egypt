import { TourWizard } from "@/features/admin/components/TourWizard";
import { listTourCategoryOptions } from "@/features/admin/service";

export const metadata = {
  title: "Create Tour",
};

export default async function AdminTourCreatePage() {
  const categories = await listTourCategoryOptions();
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Create New Tour</h1>
      <TourWizard categories={categories} />
    </div>
  );
}
