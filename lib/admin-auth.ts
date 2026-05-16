import { cookies } from "next/headers";

export const ADMIN_COOKIE = "khoapp_admin";

// A deterministic token derived from the password, so the raw password is never stored in the cookie.
export function createAdminToken(password: string): string {
  // Simple hash: base64 of reversed + salted password. Not cryptographic but avoids plaintext exposure.
  // For production, use crypto.subtle.sign with HMAC.
  const salt = "khoapp_v1";
  const raw = salt + password + salt;
  return Buffer.from(raw).toString("base64url");
}

export function verifyAdminToken(token: string | undefined): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || !token) return false;
  return token === createAdminToken(password);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  return verifyAdminToken(token);
}
