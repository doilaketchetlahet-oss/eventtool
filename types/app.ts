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
  file_size?: string | null;
  file_type?: string | null;
  platform?: string | null;
  source_url?: string | null;
  checksum?: string | null;
  notes?: string | null;
  license?: string | null;
  virus_scan_status?: string | null;
  last_verified_at?: string | null;
  downloads_count?: number | null;
  featured?: boolean | null;
  featured_order?: number | null;
  status?: "pending" | "approved" | "rejected" | string | null;
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
  file_size?: string;
  file_type?: string;
  platform?: string;
  source_url?: string;
  checksum?: string;
  notes?: string;
  license?: string;
  virus_scan_status?: string;
  last_verified_at?: string;
  tags?: string;
  featured?: boolean;
  featured_order?: number;
  status?: string;
};

export type CategoryRecord = {
  id: string | number;
  name: string;
  slug: string;
  created_at?: string | null;
};

export type DownloadRecord = {
  id: string | number;
  app_id?: string | number | null;
  created_at?: string | null;
};
