import type { AppRecord } from "@/types/app";

export function createSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "ung-dung";
}

export function parseTags(tags: AppRecord["tags"], fallback: string) {
  if (Array.isArray(tags)) {
    return tags.length > 0 ? tags : [fallback];
  }

  if (typeof tags === "string") {
    const parsed = tags.split(",").map((tag) => tag.trim()).filter(Boolean);

    return parsed.length > 0 ? parsed : [fallback];
  }

  return [fallback];
}

export function getAppSlug(app: AppRecord) {
  return app.slug || String(app.id);
}

export function getAppUrl(app: AppRecord) {
  return `/apps/${getAppSlug(app)}`;
}
