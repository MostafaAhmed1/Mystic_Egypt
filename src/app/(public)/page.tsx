import { listPublicTours } from "@/features/tour/service";
import { HomePageClient } from "@/app/(public)/home-page-client";

export const dynamic = "force-static";
export const revalidate = 300;

export default async function HomePage() {
  const tours = await listPublicTours();

  return <HomePageClient tours={tours} />;
}
