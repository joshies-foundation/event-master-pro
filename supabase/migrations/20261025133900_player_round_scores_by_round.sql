SET local check_function_bodies = off;

DROP FUNCTION "public"."get_player_round_scores_from_session"(bigint);

CREATE FUNCTION public.get_player_round_scores_from_session (
  sessionid bigint
)
  RETURNS TABLE (
    player_id     bigint,
    display_name  text,
    avatar_url    text,
    round_numbers smallint[],
    scores        bigint[]
  )
  LANGUAGE plpgsql
  AS $function$
begin
    return query
    select s.player_id, u.display_name, u.avatar_url,
        array_agg(s.round_number order by s.round_number),
        array_agg(s.score order by s.round_number)
    from player_round_score s
    join player p on s.player_id = p.id
    join "user" u on p.user_id = u.id
    where p.session_id = sessionid
    group by s.player_id, u.display_name, u.avatar_url
    order by s.player_id;
end;
$function$;

GRANT ALL ON FUNCTION "public"."get_player_round_scores_from_session"(bigint) TO "anon", "authenticated", "service_role";
