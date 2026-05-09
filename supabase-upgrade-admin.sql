-- Safe upgrade for existing KhoApp database.
-- Adds admin-only fields and storage bucket without deleting data.

alter table apps add column if not exists status text not null default 'approved';
alter table apps add column if not exists updated_at timestamptz not null default now();
alter table apps add column if not exists featured_order integer;
alter table apps add column if not exists file_size text;
alter table apps add column if not exists file_type text;
alter table apps add column if not exists platform text;
alter table apps add column if not exists source_url text;
alter table apps add column if not exists checksum text;
alter table apps add column if not exists notes text;
alter table apps add column if not exists license text;
alter table apps add column if not exists virus_scan_status text;
alter table apps add column if not exists last_verified_at timestamptz;

create index if not exists apps_status_idx on apps(status);
create index if not exists apps_featured_order_idx on apps(featured_order);

with ranked_featured as (
  select id, row_number() over (order by created_at desc, id) as next_order
  from apps
  where featured = true and featured_order is null
)
update apps
set featured_order = ranked_featured.next_order
from ranked_featured
where apps.id = ranked_featured.id;

insert into storage.buckets (id, name, public)
values ('app-assets', 'app-assets', true)
on conflict (id) do nothing;

drop policy if exists "Public can read app assets" on storage.objects;
create policy "Public can read app assets" on storage.objects for select using (bucket_id = 'app-assets');

drop policy if exists "Admin can upload app assets" on storage.objects;
create policy "Admin can upload app assets" on storage.objects for insert with check (bucket_id = 'app-assets');
