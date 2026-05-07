export type AppRecord = {
  id: string | number;
  title?: string | null;
  description?: string | null;
  category?: string | null;
  signal?: string | null;
  tags?: string[] | string | null;
  detail?: string | null;
  url?: string | null;
  meta?: string | null;
};
