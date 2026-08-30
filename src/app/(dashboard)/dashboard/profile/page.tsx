import { requireUser } from "@/core/lib/session";
import { getUserProfile } from "@/features/dashboard/service";
import { DashboardProfileClient } from "@/app/(dashboard)/dashboard/profile/dashboard-profile-client";

export const metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const user = await requireUser();
  const profile = await getUserProfile(user.id);
  if (!profile) {
    return null;
  }

  return <DashboardProfileClient profile={profile} />;
}
