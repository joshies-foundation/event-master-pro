set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_all_scores_from_session(sessionid integer)
 RETURNS SETOF record
 LANGUAGE sql
AS $function$ SELECT p.user_id, p.score, u.display_name, u.avatar_url FROM player p JOIN "user" u ON p.user_id = u.id WHERE p.session_id = sessionId ORDER BY p.score DESC, u.display_name, u.id; $function$
;

CREATE OR REPLACE FUNCTION public.get_roll_history_for_session(sessionid bigint)
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
            AND gm.round_number = i; 
            
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
$function$
;


