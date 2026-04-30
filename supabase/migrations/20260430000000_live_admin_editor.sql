alter table if exists public.gallery
  add column if not exists alt_he text default '',
  add column if not exists alt_en text default '';

alter table if exists public.hero_slideshow
  add column if not exists order_index integer,
  add column if not exists alt_he text default '',
  add column if not exists alt_en text default '';

update public.hero_slideshow
set order_index = ranked.position
from (
  select id, row_number() over (order by created_at desc) - 1 as position
  from public.hero_slideshow
) as ranked
where public.hero_slideshow.id = ranked.id
  and public.hero_slideshow.order_index is null;
