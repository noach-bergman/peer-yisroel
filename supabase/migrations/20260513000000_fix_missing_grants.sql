grant select on public.updates to anon;
grant select, insert, update, delete on public.updates to authenticated;

grant insert on public.newsletter_subscribers to anon;
grant select, insert, update, delete on public.newsletter_subscribers to authenticated;
