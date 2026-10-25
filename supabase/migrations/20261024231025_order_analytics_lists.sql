SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_duel_history_for_session (
  sessionid bigint
)
  RETURNS SETOF json
  LANGUAGE plpgsql
  AS $function$
BEGIN
    RETURN QUERY
    SELECT json_build_object(
        'id', d.id,
        'round_number', d.round_number,
        'challenger_user_id', p1.user_id,
        'challenger_display_name', u1.display_name,
        'challenger_avatar_url', u1.avatar_url,
        'opponent_user_id', p2.user_id,
        'opponent_display_name', u2.display_name,
        'opponent_avatar_url', u2.avatar_url,
        'status', d.status,
        'game_name', d.game_name,
        'wager_percentage', d.wager_percentage,
        'points_gained_by_winner', d.points_gained_by_winner
    )
    FROM duel d
    JOIN player p1 ON d.challenger_player_id = p1.id
    JOIN "user" u1 ON p1.user_id = u1.id
    JOIN player p2 ON d.opponent_player_id = p2.id
    JOIN "user" u2 ON p2.user_id = u2.id
    WHERE d.session_id = sessionid
    AND d.status IN ('challenger_won', 'opponent_won')
    ORDER BY d.round_number ASC, d.updated_at DESC, d.id DESC;

END;
$function$;

CREATE OR REPLACE FUNCTION public.get_player_duel_stats_for_session (
  sessionid bigint
)
  RETURNS SETOF json
  LANGUAGE plpgsql
  AS $function$
DECLARE
    player_record RECORD;
    player_stats json;
BEGIN
    FOR player_record IN
        SELECT p.user_id, u.display_name, u.avatar_url, p.id
        FROM player p
        JOIN "user" u ON p.user_id = u.id
        WHERE p.session_id = sessionid
        ORDER BY u.display_name, u.id
    LOOP
        SELECT json_build_object(
            'user_id', player_record.user_id,
            'display_name', player_record.display_name,
            'avatar_url', player_record.avatar_url,
            'num_duels_participated', COALESCE((SELECT COUNT(*) FROM duel WHERE (challenger_player_id = player_record.id OR opponent_player_id = player_record.id) AND status IN ('challenger_won', 'opponent_won')), 0),
            'num_duels_won', COALESCE((SELECT COUNT(*) FROM duel WHERE (challenger_player_id = player_record.id AND status = 'challenger_won') OR (opponent_player_id = player_record.id AND status = 'opponent_won')), 0),
            'total_points_won', COALESCE((SELECT SUM(points_gained_by_winner) FROM duel WHERE (challenger_player_id = player_record.id AND status = 'challenger_won') OR (opponent_player_id = player_record.id AND status = 'opponent_won')), 0),
            'total_points_lost', COALESCE((SELECT SUM(points_gained_by_winner) FROM duel WHERE (challenger_player_id = player_record.id AND status = 'opponent_won') OR (opponent_player_id = player_record.id AND status = 'challenger_won')), 0) * -1
        ) INTO player_stats;
        RETURN NEXT player_stats;
    END LOOP;
END;
$function$;

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
        WHERE player_id IN (SELECT player_id FROM player WHERE session_id = sessionid)
        GROUP BY player_id, gameboard_space_id
    ) counts ON gm.player_id = counts.player_id AND gm.gameboard_space_id = counts.gameboard_space_id
    GROUP BY p.user_id, gm.player_id, u.display_name, u.avatar_url
    ORDER BY u.display_name, p.user_id, gm.player_id;
$function$;
