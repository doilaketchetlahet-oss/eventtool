export type AppRecord = {
  id: string | number;
  slug?: string | null;
  title?: string | null;
  description?: string | null;
  long_description?: string | null;
  category?: string | null;
  version?: string | null;
  changelog?: string | null;
  thumbnail_url?: string | null;
  download_url?: string | null;
  downloads_count?: number | null;
  featured?: boolean | null;
  created_at?: string | null;
  signal?: string | null;
  tags?: string[] | string | null;
  detail?: string | null;
  url?: string | null;
  meta?: string | null;
};

export type AppFormInput = {
  title: string;
  slug: string;
  description: string;
  long_description?: string;
  category?: string;
  version?: string;
  changelog?: string;
  thumbnail_url?: string;
  download_url?: string;
  tags?: string;
  featured?: boolean;
};
