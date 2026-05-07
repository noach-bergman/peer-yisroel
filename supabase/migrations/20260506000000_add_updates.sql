create table if not exists public.updates (
  id                   uuid primary key default gen_random_uuid(),
  title_he             text not null default '',
  title_en             text not null default '',
  body_he              text not null default '',
  body_en              text not null default '',
  date                 date,
  image_url            text default '',
  storage_path         text default '',
  cloudinary_public_id text default '',
  order_index          integer not null default 0,
  published            boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_updates on public.updates;
create trigger set_updated_at_updates
  before update on public.updates
  for each row execute function public.set_updated_at();

alter table public.updates enable row level security;

create policy "Public read published updates"
  on public.updates for select
  using (published = true);

create policy "Auth users manage updates"
  on public.updates for all
  using (auth.role() = 'authenticated');
