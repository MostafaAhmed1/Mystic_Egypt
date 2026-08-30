import { TourWizard } from "@/features/admin/components/TourWizard";

export const metadata = {
  title: "Create Tour",
};

export default function AdminTourCreatePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Create New Tour</h1>
      <TourWizard />
    </div>
  );
}
