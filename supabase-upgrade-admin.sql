-- Safe upgrade for existing KhoApp database.
-- Adds admin-only fields and storage bucket without deleting data.

alter table apps add column if not exists status text not null default 'approved';
alter table apps add column if not exists updated_at timestamptz not null default now();
alter table apps add column if not exists featured_order integer;

create index if not exists apps_status_idx on apps(status);
create index if not exists apps_featured_order_idx on apps(featured_order);

insert into storage.buckets (id, name, public)
values ('app-assets', 'app-assets', true)
on conflict (id) do nothing;

drop policy if exists "Public can read app assets" on storage.objects;
create policy "Public can read app assets" on storage.objects for select using (bucket_id = 'app-assets');

drop policy if exists "Admin can upload app assets" on storage.objects;
create policy "Admin can upload app assets" on storage.objects for insert with check (bucket_id = 'app-assets');
