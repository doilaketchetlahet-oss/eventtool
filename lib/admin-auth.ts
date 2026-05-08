import { cookies } from "next/headers";

export const ADMIN_COOKIE = "khoapp_admin";

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === process.env.ADMIN_PASSWORD;
}
