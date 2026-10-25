SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.end_round (
  _round_number      integer,
  team_score_changes jsonb
)
  RETURNS jsonb
  LANGUAGE plpgsql
  AS $function$
declare
    event_team_id int8;
    points int8;
    team_player_id int8;
    event_name text;
    _session_id int8;
    _auto_mint boolean;
    _max_points int8;
    _token_recipient_user_ids uuid[] := '{}';
    _affected int;
begin
    perform 1 from game_state
    where id = 1 and round_phase = 'event' and round_number = _round_number
    for update;
    if not found then
        raise exception 'Round % is not waiting for event results', _round_number;
    end if;

    select session_id into _session_id from game_state where id = 1;

    select name into event_name from event
    where session_id = _session_id and round_number = _round_number;

    select prize_token_on_event_win into _auto_mint
    from session where id = _session_id;

    select max((value)::int8) into _max_points
    from jsonb_each_text(team_score_changes) as t(key, value);

    for event_team_id, points in select * from jsonb_each_text(team_score_changes) loop
        for team_player_id in
            select player_id from event_participant where team_id = event_team_id
        loop
            insert into public.transaction (player_id, num_points, description)
            values (team_player_id, points, 'Points earned from ' || event_name);

            insert into public.player_round_score (player_id, round_number, score)
            values (team_player_id, _round_number,
                (select score from public.player where id = team_player_id)
            );

            if _auto_mint and points = _max_points and points > 0 then
                update public.player
                set prize_tokens = prize_tokens + 1,
                    updated_at = now()
                where id = team_player_id and enabled = true;
                get diagnostics _affected = row_count;
                if _affected > 0 then
                    _token_recipient_user_ids := _token_recipient_user_ids ||
                        (select user_id from public.player where id = team_player_id);
                end if;
            end if;
        end loop;
    end loop;

    update public.game_state
    set round_phase = 'waiting_for_next_round'
    where id = 1;

    return jsonb_build_object('token_recipient_user_ids', _token_recipient_user_ids);
end;
$function$;

CREATE OR REPLACE FUNCTION public.log_round_moves (
  playermoves json,
  roundnumber integer
)
  RETURNS void
  LANGUAGE plpgsql
  AS $function$DECLARE
    v_player_id INT;
    distance_traveled INT;
    v_gameboard_space_id INT;
    points_gained INT;
    space_name TEXT;
    gameboard_space_effect TEXT;
    decision TEXT;
    values JSON;
    num_players_who_landed_on_bank_space INT;
    v_bank_balance INT;
    points_to_gain INT;
    v_session_id BIGINT;
    chance_points_amount INT;
BEGIN
    PERFORM 1 FROM game_state
    WHERE id = 1 AND round_phase = 'gameboard_moves' AND round_number = roundnumber
    FOR UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Round % is not waiting for gameboard moves', roundnumber;
    END IF;

    num_players_who_landed_on_bank_space := (SELECT COUNT(*) FROM json_object_keys(playerMoves::json) pm WHERE (playerMoves->pm->>'gameboardSpaceId')::INT IN (SELECT id FROM gameboard_space gs WHERE gs.effect = 'bank'));

    FOR v_player_id, values IN SELECT * FROM json_each_text(playerMoves::json)
    LOOP
        v_gameboard_space_id := values -> 'gameboardSpaceId';
        distance_traveled := values -> 'distanceTraveled';
        chance_points_amount := values -> 'chancePointsAmount';
        
        SELECT effect, effect_data->>'pointsGained', name INTO gameboard_space_effect, points_gained, space_name
        FROM gameboard_space WHERE id = v_gameboard_space_id;
        
        SELECT values ->> 'decision' INTO decision;
        
        INSERT INTO gameboard_move (player_id, round_number, distance_traveled, gameboard_space_id, created_at, updated_at)
        VALUES (v_player_id, roundNumber, distance_traveled, v_gameboard_space_id, now(), now());
        
        IF gameboard_space_effect = 'gain_points' OR
           (gameboard_space_effect = 'gain_points_or_do_activity' AND decision = 'points') THEN
            INSERT INTO transaction (player_id, num_points, description, created_at, updated_at)
            VALUES (v_player_id, points_gained, space_name || ' Space on turn ' || roundNumber, now(), now());

                IF points_gained < 0 THEN
                    v_session_id := (SELECT p.session_id from player p WHERE p.id = v_player_id);

                    UPDATE session
                    SET bank_balance = bank_balance - points_gained
                    WHERE id = v_session_id;
                END IF;
        END IF;
        
        IF gameboard_space_effect = 'special' THEN
            INSERT INTO special_space_event (session_id, round_number, player_id, status, special_space_id, created_at, updated_at)
            VALUES ((SELECT session_id FROM player p WHERE p.id = v_player_id), roundNumber, v_player_id, 'event_not_selected', v_gameboard_space_id, now(), now());
        END IF;
        
        IF gameboard_space_effect = 'duel' THEN
            INSERT INTO duel (session_id, round_number, challenger_player_id, status, duel_space_id, created_at, updated_at)
            VALUES ((SELECT session_id FROM player p WHERE p.id = v_player_id), roundNumber, v_player_id, 'opponent_not_selected', v_gameboard_space_id, now(), now());
        END IF;
        
        IF gameboard_space_effect = 'chaos' THEN
            INSERT INTO chaos_space_event (session_id, round_number, player_id, status, chaos_space_id, created_at, updated_at)
            VALUES ((SELECT session_id FROM player p WHERE p.id = v_player_id), roundNumber, v_player_id, 'event_not_selected', v_gameboard_space_id, now(), now());
        END IF;
        
        IF gameboard_space_effect = 'bank' THEN
            SELECT bank_balance INTO v_bank_balance FROM session WHERE id = (SELECT session_id FROM player WHERE id = v_player_id);
            
            points_to_gain := v_bank_balance / num_players_who_landed_on_bank_space;
            
            INSERT INTO transaction (player_id, num_points, description, created_at, updated_at)
            VALUES (v_player_id, points_to_gain, space_name || ' Space on turn ' || roundNumber, now(), now());
        END IF;

        IF gameboard_space_effect = 'chance_points' THEN
            INSERT INTO transaction (player_id, num_points, description, created_at, updated_at)
            VALUES (v_player_id, chance_points_amount, space_name || ' Space on turn ' || roundNumber, now(), now());

                IF chance_points_amount < 0 THEN
                    v_session_id := (SELECT p.session_id from player p WHERE p.id = v_player_id);

                    UPDATE session
                    SET bank_balance = bank_balance - chance_points_amount
                    WHERE id = v_session_id;
                END IF;
        END IF;
    END LOOP;

    IF num_players_who_landed_on_bank_space > 0 THEN
        UPDATE session SET bank_balance = 0 WHERE id = (SELECT session_id FROM player WHERE id = v_player_id);
    END IF;
    
    UPDATE game_state SET round_phase = 'special_space_events' WHERE id = 1;
    
    RETURN;
END;$function$;
