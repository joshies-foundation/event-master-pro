create or replace function public.send_bet_push_notification()
  returns trigger
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  push_url text;
  push_key text;
begin
  select decrypted_secret into push_url from vault.decrypted_secrets where name = 'push_function_url';
  select decrypted_secret into push_key from vault.decrypted_secrets where name = 'push_function_key';

  if push_url is null or push_key is null then
    raise warning 'bet push notification skipped: push_function_url or push_function_key is missing from vault';
    return new;
  end if;

  perform net.http_post(
    url := push_url,
    body := jsonb_build_object(
      'old_record', case when tg_op = 'UPDATE' then to_jsonb(old) end,
      'record', to_jsonb(new),
      'type', tg_op,
      'table', tg_table_name,
      'schema', tg_table_schema
    ),
    headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || push_key),
    timeout_milliseconds := 1000
  );

  return new;
end;
$$;

revoke execute on function public.send_bet_push_notification() from public, anon, authenticated;

drop trigger if exists bet_push_notifications on public.bet;
create trigger bet_push_notifications
  after insert or update on public.bet
  for each row execute function public.send_bet_push_notification();
