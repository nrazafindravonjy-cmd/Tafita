-- Lets the photo upload function confirm who a Neon Auth token belongs to:
-- it calls this through the Data API with the visitor's token.
create function current_user_id() returns text
language sql stable as $$ select auth.user_id() $$;

revoke execute on function current_user_id from public;
grant execute on function current_user_id to authenticated;
