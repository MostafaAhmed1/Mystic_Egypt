import { notFound } from "next/navigation";
import { getTourById } from "@/features/admin/service";
import { TourWizard } from "@/features/admin/components/TourWizard";

export const metadata = {
  title: "Edit Tour",
};

export default async function AdminTourEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tour = await getTourById(id);
  if (!tour) notFound();

  const wizardData = {
    id: tour.id,
    title: tour.title,
    slug: tour.slug,
    description: tour.description,
    inclusions: tour.inclusions ?? "",
    exclusions: tour.exclusions ?? "",
    base_price: tour.base_price,
    currency: tour.currency,
    status: tour.status,
    itinerary: tour.itinerary.map((d) => ({
      day_number: d.day_number,
      title: d.title,
      description: d.description,
    })),
    images: tour.images.map((img) => ({
      image_url: img.image_url,
      is_primary: img.is_primary,
    })),
    route: tour.route.map((r) => ({
      order: r.order,
      label: r.label,
      lat: r.lat,
      lng: r.lng,
      is_stop: r.is_stop,
    })),
    tour_dates: tour.tour_dates.map((td) => ({
      date: td.date.toISOString().split("T")[0],
      is_closed: td.is_closed,
    })),
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Edit: {tour.title}</h1>
      <TourWizard tour={wizardData} />
    </div>
  );
}
