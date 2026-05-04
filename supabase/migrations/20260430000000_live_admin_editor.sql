create extension if not exists pgcrypto;

create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  content jsonb not null default '{}'::jsonb,
  contact_email text default '',
  contact_phone text default '',
  contact_address text default '',
  donation_url text default '',
  bank_name text default '',
  bank_name_en text default '',
  bank_account text default '',
  bank_branch text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.site_content
  add column if not exists key text,
  add column if not exists content jsonb not null default '{}'::jsonb,
  add column if not exists contact_email text default '',
  add column if not exists contact_phone text default '',
  add column if not exists contact_address text default '',
  add column if not exists donation_url text default '',
  add column if not exists bank_name text default '',
  add column if not exists bank_name_en text default '',
  add column if not exists bank_account text default '',
  add column if not exists bank_branch text default '',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists site_content_key_unique on public.site_content (key);

create table if not exists public.gallery_categories (
  id uuid primary key default gen_random_uuid(),
  name_he text not null default '',
  name_en text not null default '',
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.gallery_categories
  add column if not exists name_he text not null default '',
  add column if not exists name_en text not null default '',
  add column if not exists order_index integer not null default 0,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  storage_path text,
  category_id uuid references public.gallery_categories(id) on delete set null,
  category_he text default '',
  category_en text default '',
  alt_he text default '',
  alt_en text default '',
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.gallery
  add column if not exists image_url text,
  add column if not exists storage_path text,
  add column if not exists category_id uuid,
  add column if not exists category_he text default '',
  add column if not exists category_en text default '',
  add column if not exists alt_he text default '',
  add column if not exists alt_en text default '',
  add column if not exists order_index integer not null default 0,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.hero_slideshow (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  storage_path text,
  order_index integer not null default 0,
  alt_he text default '',
  alt_en text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.hero_slideshow
  add column if not exists image_url text,
  add column if not exists storage_path text,
  add column if not exists order_index integer,
  add column if not exists alt_he text default '',
  add column if not exists alt_en text default '',
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.gallery
set order_index = ranked.position
from (
  select id, row_number() over (order by created_at desc) - 1 as position
  from public.gallery
) as ranked
where public.gallery.id = ranked.id
  and public.gallery.order_index is null;

update public.hero_slideshow
set order_index = ranked.position
from (
  select id, row_number() over (order by created_at desc) - 1 as position
  from public.hero_slideshow
) as ranked
where public.hero_slideshow.id = ranked.id
  and public.hero_slideshow.order_index is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'gallery_category_id_fkey'
      and conrelid = 'public.gallery'::regclass
  ) then
    alter table public.gallery
      add constraint gallery_category_id_fkey
      foreign key (category_id)
      references public.gallery_categories(id)
      on delete set null
      not valid;
  end if;
end
$$;

create index if not exists gallery_order_index_idx on public.gallery (order_index);
create index if not exists gallery_category_id_idx on public.gallery (category_id);
create index if not exists gallery_categories_order_index_idx on public.gallery_categories (order_index);
create index if not exists hero_slideshow_order_index_idx on public.hero_slideshow (order_index);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_site_content_updated_at on public.site_content;
create trigger set_site_content_updated_at
before update on public.site_content
for each row execute function public.set_updated_at();

drop trigger if exists set_gallery_categories_updated_at on public.gallery_categories;
create trigger set_gallery_categories_updated_at
before update on public.gallery_categories
for each row execute function public.set_updated_at();

drop trigger if exists set_gallery_updated_at on public.gallery;
create trigger set_gallery_updated_at
before update on public.gallery
for each row execute function public.set_updated_at();

drop trigger if exists set_hero_slideshow_updated_at on public.hero_slideshow;
create trigger set_hero_slideshow_updated_at
before update on public.hero_slideshow
for each row execute function public.set_updated_at();

alter table public.site_content enable row level security;
alter table public.gallery_categories enable row level security;
alter table public.gallery enable row level security;
alter table public.hero_slideshow enable row level security;

drop policy if exists "Public read site content" on public.site_content;
create policy "Public read site content"
on public.site_content for select
using (true);

drop policy if exists "Authenticated write site content" on public.site_content;
create policy "Authenticated write site content"
on public.site_content for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public read gallery categories" on public.gallery_categories;
create policy "Public read gallery categories"
on public.gallery_categories for select
using (true);

drop policy if exists "Authenticated write gallery categories" on public.gallery_categories;
create policy "Authenticated write gallery categories"
on public.gallery_categories for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public read gallery" on public.gallery;
create policy "Public read gallery"
on public.gallery for select
using (true);

drop policy if exists "Authenticated write gallery" on public.gallery;
create policy "Authenticated write gallery"
on public.gallery for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public read hero slideshow" on public.hero_slideshow;
create policy "Public read hero slideshow"
on public.hero_slideshow for select
using (true);

drop policy if exists "Authenticated write hero slideshow" on public.hero_slideshow;
create policy "Authenticated write hero slideshow"
on public.hero_slideshow for all
to authenticated
using (true)
with check (true);

grant usage on schema public to anon, authenticated;
grant select on public.site_content, public.gallery_categories, public.gallery, public.hero_slideshow to anon;
grant all on public.site_content, public.gallery_categories, public.gallery, public.hero_slideshow to authenticated;

insert into storage.buckets (id, name, public)
values ('peeryisroel', 'peeryisroel', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Public read peeryisroel storage" on storage.objects;
create policy "Public read peeryisroel storage"
on storage.objects for select
using (bucket_id = 'peeryisroel');

drop policy if exists "Authenticated insert peeryisroel storage" on storage.objects;
create policy "Authenticated insert peeryisroel storage"
on storage.objects for insert
to authenticated
with check (bucket_id = 'peeryisroel');

drop policy if exists "Authenticated update peeryisroel storage" on storage.objects;
create policy "Authenticated update peeryisroel storage"
on storage.objects for update
to authenticated
using (bucket_id = 'peeryisroel')
with check (bucket_id = 'peeryisroel');

drop policy if exists "Authenticated delete peeryisroel storage" on storage.objects;
create policy "Authenticated delete peeryisroel storage"
on storage.objects for delete
to authenticated
using (bucket_id = 'peeryisroel');
