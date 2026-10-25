SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_player_round_scores_from_session (
  sessionid bigint
)
  RETURNS TABLE (
    player_id    bigint,
    display_name text,
    avatar_url   text,
    scores       bigint[]
  )
  LANGUAGE plpgsql
  AS $function$
BEGIN
    RETURN QUERY
    SELECT pr.player_id, u.display_name, u.avatar_url, array_agg(pr.score ORDER BY pr.round_number) as scores
    FROM (
        SELECT DISTINCT ON (s.player_id, s.round_number) s.player_id, s.round_number, s.score
        FROM player_round_score s
        JOIN player p ON s.player_id = p.id
        WHERE p.session_id = sessionId
        ORDER BY s.player_id, s.round_number, s.created_at DESC, s.id DESC
    ) pr
    JOIN player p ON pr.player_id = p.id
    JOIN "user" u ON p.user_id = u.id
    GROUP BY pr.player_id, u.display_name, u.avatar_url
    ORDER BY pr.player_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_roll_history_for_session (
  sessionid bigint
)
  RETURNS SETOF json
  LANGUAGE plpgsql
  AS $function$ 
DECLARE 
    player_record RECORD; 
    gameboard_move_record RECORD; 
    result json; 
    gameboard_moves json[]; 
    max_round_number INT; 
BEGIN 
    SELECT MAX(round_number) INTO max_round_number 
    FROM gameboard_move 
    WHERE player_id IN ( 
        SELECT id 
        FROM player 
        WHERE session_id = sessionid 
    ); 
    
    FOR player_record IN 
        SELECT p.id AS player_id, u.display_name, u.avatar_url, u.id AS user_id 
        FROM player p 
        JOIN "user" u ON p.user_id = u.id 
        WHERE p.session_id = sessionid 
        ORDER BY u.display_name, u.id 
    LOOP 
        gameboard_moves := ARRAY[]::json[]; 
        
        FOR i IN 1..max_round_number LOOP 
            SELECT gm.distance_traveled, gs.color, gs.icon_class 
            INTO gameboard_move_record 
            FROM gameboard_move gm 
            JOIN gameboard_space gs ON gm.gameboard_space_id = gs.id 
            WHERE gm.player_id = player_record.player_id 
            AND gm.round_number = i
            ORDER BY gm.created_at DESC, gm.id DESC
            LIMIT 1; 
            
            gameboard_moves := array_append(gameboard_moves, 
                json_build_object( 
                    'distance', gameboard_move_record.distance_traveled, 
                    'gameboard_space', json_build_object( 
                        'color', gameboard_move_record.color, 
                        'icon_class', gameboard_move_record.icon_class 
                    ) 
                ) 
            ); 
        END LOOP; 
        
        result := json_build_object( 
            'player_id', player_record.player_id, 
            'user_id', player_record.user_id, 
            'display_name', player_record.display_name, 
            'avatar_url', player_record.avatar_url, 
            'gameboard_moves', gameboard_moves 
        ); 
        
        RETURN NEXT result; 
    END LOOP; 
END; 
$function$;
