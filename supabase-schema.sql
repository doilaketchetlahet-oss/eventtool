-- KhoApp production schema
-- Run this in Supabase SQL Editor before enabling all advanced features.

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists apps (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  description text not null,
  long_description text,
  category text,
  version text default '1.0.0',
  changelog text,
  thumbnail_url text,
  download_url text,
  url text,
  tags text[] default '{}',
  featured boolean not null default false,
  featured_order integer,
  status text not null default 'approved' check (status in ('pending', 'approved', 'rejected')),
  downloads_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists downloads (
  id uuid primary key default gen_random_uuid(),
  app_id uuid references apps(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table categories enable row level security;
alter table apps enable row level security;
alter table downloads enable row level security;

drop policy if exists "Public can read categories" on categories;
create policy "Public can read categories" on categories for select using (true);

drop policy if exists "Public can read apps" on apps;
create policy "Public can read apps" on apps for select using (status = 'approved' or status is null);

drop policy if exists "Public can submit apps" on apps;
create policy "Public can submit apps" on apps for insert with check (true);

drop policy if exists "Public can update download count" on apps;
create policy "Public can update download count" on apps for update using (true) with check (true);

drop policy if exists "Public can record downloads" on downloads;
create policy "Public can record downloads" on downloads for insert with check (true);

create index if not exists apps_slug_idx on apps(slug);
create index if not exists apps_featured_idx on apps(featured);
create index if not exists apps_featured_order_idx on apps(featured_order);
create index if not exists apps_category_idx on apps(category);
create index if not exists apps_status_idx on apps(status);
create index if not exists downloads_app_id_idx on downloads(app_id);

insert into storage.buckets (id, name, public)
values ('app-assets', 'app-assets', true)
on conflict (id) do nothing;

drop policy if exists "Public can read app assets" on storage.objects;
create policy "Public can read app assets" on storage.objects for select using (bucket_id = 'app-assets');

drop policy if exists "Admin can upload app assets" on storage.objects;
create policy "Admin can upload app assets" on storage.objects for insert with check (bucket_id = 'app-assets');
