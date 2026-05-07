create table if not exists public.newsletter_subscribers (
  id            uuid        primary key default gen_random_uuid(),
  email         text        not null unique,
  first_name    text        not null default '',
  last_name     text        not null default '',
  language      text        not null default 'he' check (language in ('he', 'en')),
  subscribed_at timestamptz not null default now(),
  active        boolean     not null default true
);

alter table public.newsletter_subscribers enable row level security;

-- Anyone (anon) may subscribe
create policy "Public insert subscribers"
  on public.newsletter_subscribers for insert
  with check (true);

-- Only authenticated admins can read/update/delete
create policy "Auth users manage subscribers"
  on public.newsletter_subscribers for all
  using (auth.role() = 'authenticated');
