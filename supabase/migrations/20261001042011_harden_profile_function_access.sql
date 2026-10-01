-- Trigger-only function must not be exposed as an RPC.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
-- Only authenticated accounts may record their own login streak.
revoke execute on function public.record_daily_login_streak() from public, anon;
grant execute on function public.record_daily_login_streak() to authenticated;
