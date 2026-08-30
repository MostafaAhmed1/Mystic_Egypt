import { listAdmins } from "@/features/admin/service";
import { AdminAdminsClient } from "@/app/(admin)/admin/admins/admin-admins-client";

export const metadata = {
  title: "Admin Management",
};

export default async function AdminAdminsPage() {
  const admins = await listAdmins();

  return <AdminAdminsClient admins={admins} />;
}
