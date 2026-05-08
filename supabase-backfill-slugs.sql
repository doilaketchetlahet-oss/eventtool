-- Backfill slug from Vietnamese app title.
-- Example: "Đồng Hồ Đếm Giờ" -> "dong-ho-dem-gio".
-- If duplicated, appends a short id suffix to keep slug unique.

create or replace function public.vn_unaccent(input text)
returns text
language sql
immutable
as $$
  select translate(
    lower(coalesce(input, '')),
    'àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ',
    'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd'
  );
$$;

with generated as (
  select
    id,
    nullif(
      trim(both '-' from regexp_replace(public.vn_unaccent(title), '[^a-z0-9]+', '-', 'g')),
      ''
    ) as base_slug
  from apps
  where slug is null or slug = ''
), ranked as (
  select
    id,
    coalesce(base_slug, 'ung-dung') as base_slug,
    row_number() over (partition by base_slug order by id) as duplicate_rank
  from generated
)
update apps
set slug = case
  when ranked.duplicate_rank = 1 then ranked.base_slug
  else ranked.base_slug || '-' || left(apps.id::text, 8)
end
from ranked
where apps.id = ranked.id;
