import HomePageClient from "@/components/home-page-client";
import { getCategories } from "@/lib/get-categories";
import { getApps } from "@/lib/get-apps";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ apps, source }, categories] = await Promise.all([getApps(), getCategories()]);

  return <HomePageClient apps={apps} categories={categories} dataSource={source} />;
}
