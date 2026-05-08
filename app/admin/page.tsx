import AdminDashboard from "@/components/admin-dashboard";
import { getApps } from "@/lib/get-apps";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { apps } = await getApps();

  return <AdminDashboard initialApps={apps} />;
}
