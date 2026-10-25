SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_space_stats_for_session (
  sessionid bigint
)
  RETURNS SETOF record
  LANGUAGE sql
  AS $function$
    SELECT p.user_id, p.id AS player_id, u.display_name, u.avatar_url, json_object_agg(landings.gameboard_space_id, landings.cnt) AS space_stats
    FROM (
        SELECT latest.player_id, latest.gameboard_space_id, count(*) AS cnt
        FROM (
            SELECT DISTINCT ON (gm.player_id, gm.round_number) gm.player_id, gm.gameboard_space_id
            FROM gameboard_move gm
            JOIN player p ON gm.player_id = p.id
            WHERE p.session_id = sessionid
            ORDER BY gm.player_id, gm.round_number, gm.created_at DESC, gm.id DESC
        ) latest
        GROUP BY latest.player_id, latest.gameboard_space_id
    ) landings
    JOIN player p ON landings.player_id = p.id
    JOIN "user" u ON p.user_id = u.id
    GROUP BY p.user_id, p.id, u.display_name, u.avatar_url
    ORDER BY u.display_name, p.user_id, p.id;
$function$;
