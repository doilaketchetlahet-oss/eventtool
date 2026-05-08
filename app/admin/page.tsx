import AdminDashboard from "@/components/admin-dashboard";
import { getCategories } from "@/lib/get-categories";
import { getApps } from "@/lib/get-apps";
import { getDownloads } from "@/lib/get-downloads";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [{ apps }, categories, downloads] = await Promise.all([getApps({ includeAll: true }), getCategories(), getDownloads()]);

  return <AdminDashboard initialApps={apps} initialCategories={categories} initialDownloads={downloads} />;
}
