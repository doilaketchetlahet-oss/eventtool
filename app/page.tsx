import HomePageClient from "@/components/home-page-client";
import { getApps } from "@/lib/get-apps";

export default async function HomePage() {
  const { apps, source } = await getApps();

  return <HomePageClient apps={apps} dataSource={source} />;
}
