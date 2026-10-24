create or replace function public.adjust_prize_tokens(_player_id bigint, _delta integer)
 returns void
 language sql
as $function$
    update public.player
    set prize_tokens = greatest(0, prize_tokens + _delta)
    where id = _player_id;
$function$
;
