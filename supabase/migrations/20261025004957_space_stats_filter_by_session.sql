SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_space_stats_for_session (
  sessionid bigint
)
  RETURNS SETOF record
  LANGUAGE sql
  AS $function$
    SELECT p.user_id, gm.player_id, u.display_name, u.avatar_url, json_object_agg(gm.gameboard_space_id, cnt) as space_stats
    FROM gameboard_move gm
    JOIN player p ON gm.player_id = p.id
    JOIN "user" u ON p.user_id = u.id
    JOIN (
        SELECT player_id, gameboard_space_id, count(*) as cnt
        FROM gameboard_move
        WHERE player_id IN (SELECT id FROM player WHERE session_id = sessionid)
        GROUP BY player_id, gameboard_space_id
    ) counts ON gm.player_id = counts.player_id AND gm.gameboard_space_id = counts.gameboard_space_id
    GROUP BY p.user_id, gm.player_id, u.display_name, u.avatar_url
    ORDER BY u.display_name, p.user_id, gm.player_id;
$function$;
