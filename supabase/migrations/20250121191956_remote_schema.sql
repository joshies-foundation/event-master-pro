SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";
COMMENT ON SCHEMA "public" IS 'standard public schema';
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "moddatetime" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
CREATE TYPE "public"."bet_status" AS ENUM (
    'pending_acceptance',
    'canceled_by_requester',
    'canceled_by_gm',
    'rejected',
    'active',
    'requester_won',
    'opponent_won',
    'push'
);
ALTER TYPE "public"."bet_status" OWNER TO "postgres";
CREATE TYPE "public"."bet_subtype" AS ENUM (
    'player_loses',
    'number_of_losers',
    'team_position',
    'score'
);
ALTER TYPE "public"."bet_subtype" OWNER TO "postgres";
CREATE TYPE "public"."bet_type" AS ENUM (
    'duel',
    'special_space_event',
    'chaos_space_event',
    'custom',
    'main_event',
    'gameboard_move'
);
ALTER TYPE "public"."bet_type" OWNER TO "postgres";
CREATE TYPE "public"."chaos_space_event_type" AS ENUM (
    'everyone_gains_points_based_on_rank',
    'everyone_loses_percentage_of_their_points',
    'everyone_loses_percentage_of_their_points_based_on_task_failure',
    'point_swap'
);
ALTER TYPE "public"."chaos_space_event_type" OWNER TO "postgres";
CREATE TYPE "public"."duel_status" AS ENUM (
    'opponent_not_selected',
    'wager_not_selected',
    'game_not_selected',
    'waiting_to_begin',
    'in_progress',
    'challenger_won',
    'opponent_won',
    'canceled'
);
ALTER TYPE "public"."duel_status" OWNER TO "postgres";
CREATE TYPE "public"."event_format" AS ENUM (
    'single_elimination_tournament',
    'double_elimination_tournament',
    'score_based_single_round'
);
ALTER TYPE "public"."event_format" OWNER TO "postgres";
CREATE TYPE "public"."gameboard_space_effect" AS ENUM (
    'gain_points',
    'gain_points_or_do_activity',
    'special',
    'duel',
    'chaos',
    'bank'
);
ALTER TYPE "public"."gameboard_space_effect" OWNER TO "postgres";
CREATE TYPE "public"."round_phase" AS ENUM (
    'gameboard_moves',
    'special_space_events',
    'duels',
    'chaos_space_events',
    'event',
    'waiting_for_next_round'
);
ALTER TYPE "public"."round_phase" OWNER TO "postgres";
CREATE TYPE "public"."session_status" AS ENUM (
    'not_started',
    'in_progress',
    'finished'
);
ALTER TYPE "public"."session_status" OWNER TO "postgres";
CREATE TYPE "public"."space_event_status" AS ENUM (
    'event_not_selected',
    'waiting_to_begin',
    'in_progress',
    'finished',
    'canceled'
);
ALTER TYPE "public"."space_event_status" OWNER TO "postgres";
CREATE TYPE "public"."special_space_event_type" AS ENUM (
    'player_gains_points_based_on_game_score',
    'everyone_gains_points_based_on_rank'
);
ALTER TYPE "public"."special_space_event_type" OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."bulk_cancel_bets"("player_id" bigint, "includeactive" boolean) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$declare
  bet record;
begin
  for bet in
    select id from bet 
      where requester_player_id = player_id
        and (status = 'pending_acceptance' or
          (includeActive and status = 'active'))
  loop
    perform submit_bet_canceled_by_gm(bet.id);
  end loop;
end;$$;
ALTER FUNCTION "public"."bulk_cancel_bets"("player_id" bigint, "includeactive" boolean) OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."create_session"("session_name" "text", "session_start_date" timestamp without time zone, "session_end_date" timestamp without time zone, "num_rounds" smallint, "player_user_ids" "uuid"[]) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$DECLARE
    new_session_id bigint;
    last_rules text;
    previous_session_id bigint;
BEGIN
    previous_session_id := (SELECT id FROM public.session ORDER BY id DESC LIMIT 1);

    -- add a row to the `session` table with this session's parameters
    INSERT INTO public.session (name, start_date, end_date, num_rounds, bank_balance, created_at, updated_at)
    VALUES (session_name, session_start_date, session_end_date, num_rounds, 0, now(), now())
    RETURNING id INTO new_session_id;

    -- add rows to the `player` table with this session's ID and the selected players' user IDs
    INSERT INTO public.player (user_id, session_id, score, enabled, created_at, updated_at)
    SELECT unnest(array(SELECT unnest(player_user_ids))), new_session_id, 0, TRUE, now(), now();

    -- copy rules from last session into this session
    INSERT INTO public.rules (session_id, created_at, updated_at, intro, events, gameboard, special_space_events, chaos_space_events)
    SELECT new_session_id, now(), now(), intro, events, gameboard, special_space_events, chaos_space_events FROM public.rules WHERE id = previous_session_id;

    -- copy chaos_space_event_template rows from previous session to new session
    INSERT INTO public.chaos_space_event_template (session_id, name, description, type, details, created_at, updated_at)
    SELECT new_session_id, name, description, type, details, now(), now()
    FROM public.chaos_space_event_template
    WHERE session_id = previous_session_id;

    -- copy special_space_event_template rows from previous session to new session
    INSERT INTO public.special_space_event_template (session_id, name, description, type, details, created_at, updated_at)
    SELECT new_session_id, name, description, type, details, now(), now()
    FROM public.special_space_event_template
    WHERE session_id = previous_session_id;

    -- copy gameboard_space rows from previous session to new session
    INSERT INTO public.gameboard_space (name, color, icon_class, effect, effect_data, created_at, updated_at, session_id)
    SELECT name, color, icon_class, effect, effect_data, now(), now(), new_session_id
    FROM public.gameboard_space
    WHERE session_id = previous_session_id;

    -- copy event rows from previous session to new session
    INSERT INTO public.event (round_number, name, description, rules, team_size, scoring_map, image_url, points_label, lower_scores_are_better, format, created_at, updated_at, session_id)
    SELECT round_number, name, description, rules, team_size, scoring_map, image_url, points_label, lower_scores_are_better, format, now(), now(), new_session_id
    FROM public.event
    WHERE session_id = previous_session_id;

    -- update the `game_state` table to use the new session ID, session status `not_started`, `round_number` 0, and round phase `waiting_for_next_round`
    UPDATE public.game_state
    SET session_id = new_session_id, round_number = 0, session_status = 'not_started', round_phase = 'waiting_for_next_round'
    WHERE id = 1;

    RETURN;
END;$$;
ALTER FUNCTION "public"."create_session"("session_name" "text", "session_start_date" timestamp without time zone, "session_end_date" timestamp without time zone, "num_rounds" smallint, "player_user_ids" "uuid"[]) OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."delete_gameboard_space"("v_gameboard_space_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- disallow deleting a space a player has already landed on
    IF EXISTS (SELECT 1 FROM gameboard_move WHERE gameboard_space_id = v_gameboard_space_id) THEN
        RAISE EXCEPTION 'Cannot delete a space a player has already landed on';
    END IF;

    -- disallow deleting a session's only duel space
    IF (SELECT effect FROM gameboard_space WHERE id = v_gameboard_space_id) = 'duel' THEN
        IF NOT EXISTS (SELECT 1 FROM gameboard_space WHERE session_id = (SELECT session_id FROM gameboard_space WHERE id = v_gameboard_space_id) AND effect = 'duel' AND id <> v_gameboard_space_id) THEN
            RAISE EXCEPTION 'Must have at least 1 duel space';
        END IF;
    END IF;

    DELETE FROM gameboard_space WHERE id = v_gameboard_space_id;
END;
$$;
ALTER FUNCTION "public"."delete_gameboard_space"("v_gameboard_space_id" bigint) OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."end_round"("_round_number" integer, "team_score_changes" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$DECLARE
    event_team_id int8;
    points int8;
	team_player_id int8;
	event_name text;
BEGIN
		SELECT name INTO event_name FROM event WHERE session_id = (SELECT session_id FROM game_state WHERE id = 1) AND round_number = _round_number;

    FOR event_team_id, points IN SELECT * FROM jsonb_each_text(team_score_changes) LOOP
		for team_player_id In
			select player_id from event_participant where team_id = event_team_id
		loop
			-- add trasnsaction
			INSERT INTO public.transaction (player_id, num_points, description)
			VALUES (team_player_id, points, 'Points earned from ' || event_name);

			-- save player round score snapshot
			INSERT INTO public.player_round_score (player_id, round_number, score)
			VALUES (team_player_id, _round_number, 
				(SELECT score FROM public.player WHERE id = team_player_id)
			);
		end loop;
    END LOOP;
    UPDATE public.game_state
    SET round_phase = 'waiting_for_next_round'
    WHERE id = 1;
END;$$;
ALTER FUNCTION "public"."end_round"("_round_number" integer, "team_score_changes" "jsonb") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."get_all_scores_from_session"("sessionid" integer) RETURNS SETOF "record"
    LANGUAGE "sql"
    AS $$ SELECT p.user_id, p.score, u.display_name, u.avatar_url FROM player p JOIN "user" u ON p.user_id = u.id WHERE p.session_id = sessionId ORDER BY score DESC; $$;
ALTER FUNCTION "public"."get_all_scores_from_session"("sessionid" integer) OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."get_duel_history_for_session"("sessionid" bigint) RETURNS SETOF "json"
    LANGUAGE "plpgsql"
    AS $$
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
    ORDER BY d.round_number ASC, d.updated_at DESC;

END;
$$;
ALTER FUNCTION "public"."get_duel_history_for_session"("sessionid" bigint) OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."get_player_duel_stats_for_session"("sessionid" bigint) RETURNS SETOF "json"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    player_record RECORD;
    player_stats json;
BEGIN
    FOR player_record IN
        SELECT p.user_id, u.display_name, u.avatar_url, p.id
        FROM player p
        JOIN "user" u ON p.user_id = u.id
        WHERE p.session_id = sessionid
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
$$;
ALTER FUNCTION "public"."get_player_duel_stats_for_session"("sessionid" bigint) OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."get_player_round_scores_from_session"("sessionid" bigint) RETURNS TABLE("player_id" bigint, "display_name" "text", "avatar_url" "text", "scores" bigint[])
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT pr.player_id, u.display_name, u.avatar_url, array_agg(pr.score ORDER BY pr.round_number) as scores
    FROM player_round_score pr
    JOIN player p ON pr.player_id = p.id
    JOIN "user" u ON p.user_id = u.id
    WHERE p.session_id = sessionId
    GROUP BY pr.player_id, u.display_name, u.avatar_url
    ORDER BY pr.player_id;
END;
$$;
ALTER FUNCTION "public"."get_player_round_scores_from_session"("sessionid" bigint) OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."get_roll_history_for_session"("sessionid" bigint) RETURNS SETOF "json"
    LANGUAGE "plpgsql"
    AS $$ 
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
$$;
ALTER FUNCTION "public"."get_roll_history_for_session"("sessionid" bigint) OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."get_space_stats_for_session"("sessionid" bigint) RETURNS SETOF "record"
    LANGUAGE "sql"
    AS $$
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
    GROUP BY p.user_id, gm.player_id, u.display_name, u.avatar_url;
$$;
ALTER FUNCTION "public"."get_space_stats_for_session"("sessionid" bigint) OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."hello_world"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN 'Hello, World!';
END;
$$;
ALTER FUNCTION "public"."hello_world"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."log_round_moves"("playermoves" "json", "roundnumber" integer) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$DECLARE
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
BEGIN
    num_players_who_landed_on_bank_space := (SELECT COUNT(*) FROM json_object_keys(playerMoves::json) pm WHERE (playerMoves->pm->>'gameboardSpaceId')::INT IN (SELECT id FROM gameboard_space gs WHERE gs.effect = 'bank'));

    FOR v_player_id, values IN SELECT * FROM json_each_text(playerMoves::json)
    LOOP
        v_gameboard_space_id := values -> 'gameboardSpaceId';
        distance_traveled := values -> 'distanceTraveled';
        
        SELECT effect, effect_data->>'pointsGained', name INTO gameboard_space_effect, points_gained, space_name
        FROM gameboard_space WHERE id = v_gameboard_space_id;
        
        SELECT values ->> 'decision' INTO decision;
        
        -- log gameboard move
        INSERT INTO gameboard_move (player_id, round_number, distance_traveled, gameboard_space_id, created_at, updated_at)
        VALUES (v_player_id, roundNumber, distance_traveled, v_gameboard_space_id, now(), now());
        
        -- Only add points when either:
        IF gameboard_space_effect = 'gain_points' OR
           (gameboard_space_effect = 'gain_points_or_do_activity' AND decision = 'points') THEN
            INSERT INTO transaction (player_id, num_points, description, created_at, updated_at)
            VALUES (v_player_id, points_gained, space_name || ' Space on turn ' || roundNumber, now(), now());

                -- add lost points to the bank balance
                IF points_gained < 0 THEN
                    v_session_id := (SELECT p.session_id from player p WHERE p.id = v_player_id);

                    UPDATE session
                    SET bank_balance = bank_balance - points_gained
                    WHERE id = v_session_id;
                END IF;
        END IF;
        
        -- Add Special Space Events for special spaces:
        IF gameboard_space_effect = 'special' THEN
            INSERT INTO special_space_event (session_id, round_number, player_id, status, special_space_id, created_at, updated_at)
            VALUES ((SELECT session_id FROM player p WHERE p.id = v_player_id), roundNumber, v_player_id, 'event_not_selected', v_gameboard_space_id, now(), now());
        END IF;
        
        -- Add duels for duel spaces:
        IF gameboard_space_effect = 'duel' THEN
            INSERT INTO duel (session_id, round_number, challenger_player_id, status, duel_space_id, created_at, updated_at)
            VALUES ((SELECT session_id FROM player p WHERE p.id = v_player_id), roundNumber, v_player_id, 'opponent_not_selected', v_gameboard_space_id, now(), now());
        END IF;
        
        -- Add Chaos Space Events for special spaces:
        IF gameboard_space_effect = 'chaos' THEN
            INSERT INTO chaos_space_event (session_id, round_number, player_id, status, chaos_space_id, created_at, updated_at)
            VALUES ((SELECT session_id FROM player p WHERE p.id = v_player_id), roundNumber, v_player_id, 'event_not_selected', v_gameboard_space_id, now(), now());
        END IF;
        
        -- Distribute bank balance when player(s) land on bank space
        IF gameboard_space_effect = 'bank' THEN
            SELECT bank_balance INTO v_bank_balance FROM session WHERE id = (SELECT session_id FROM player WHERE id = v_player_id);
            
            points_to_gain := v_bank_balance / num_players_who_landed_on_bank_space;
            
            INSERT INTO transaction (player_id, num_points, description, created_at, updated_at)
            VALUES (v_player_id, points_to_gain, space_name || ' Space on turn ' || roundNumber, now(), now());
        END IF;
    END LOOP;

    -- Reset bank balance to 0 if someone landed on the bank space
    IF num_players_who_landed_on_bank_space > 0 THEN
        UPDATE session SET bank_balance = 0 WHERE id = (SELECT session_id FROM player WHERE id = v_player_id);
    END IF;
    
    -- go to next round phase
    UPDATE game_state SET round_phase = 'special_space_events' WHERE id = 1;
    
    RETURN;
END;$$;
ALTER FUNCTION "public"."log_round_moves"("playermoves" "json", "roundnumber" integer) OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."override_bank_balance"("data" "json") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_session_id bigint := (data->>'sessionId')::bigint;
    v_change_amount bigint := (data->>'change')::bigint;
    v_replace_value boolean := (data->>'replace')::boolean;
BEGIN
    IF v_replace_value THEN
        UPDATE session
        SET bank_balance = v_change_amount
        WHERE id = v_session_id;
    ELSE
        UPDATE session
        SET bank_balance = bank_balance + v_change_amount
        WHERE id = v_session_id;
    END IF;
END;
$$;
ALTER FUNCTION "public"."override_bank_balance"("data" "json") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."override_points"("data" "json", "add_lost_points_to_bank_balance" boolean) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    player_id bigint := (data->>'playerId')::bigint;
    change_amount bigint := (data->>'change')::bigint;
    replace_value boolean := (data->>'replace')::boolean;
    comment_text text := (data->>'comment');
    player_score bigint;
    v_transaction_amount BIGINT;
    v_session_id BIGINT;
BEGIN
    SELECT score INTO player_score FROM player WHERE id = player_id;

    IF replace_value THEN
        v_transaction_amount := change_amount - player_score;
    ELSE
        v_transaction_amount := change_amount;
    END IF;

    INSERT INTO transaction (player_id, num_points, description)
    VALUES (player_id, v_transaction_amount, 
        CASE WHEN comment_text = '' THEN 'GM Discretion' ELSE 'GM Discretion: ' || comment_text END);

    -- add lost points to the bank balance
    IF v_transaction_amount < 0 AND add_lost_points_to_bank_balance THEN
        v_session_id := (SELECT p.session_id FROM player p WHERE p.id = player_id);
        
        UPDATE session
        SET bank_balance = bank_balance - v_transaction_amount
        WHERE id = v_session_id;
    END IF;
END;
$$;
ALTER FUNCTION "public"."override_points"("data" "json", "add_lost_points_to_bank_balance" boolean) OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."reorder_events"("events_with_new_round_number" "json") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    event_id bigint;
    new_round_number smallint;
BEGIN
    FOR event_id, new_round_number IN SELECT * FROM json_each_text(events_with_new_round_number)
    LOOP
        UPDATE public.event
        SET round_number = new_round_number
        WHERE id = event_id;
    END LOOP;
END;
$$;
ALTER FUNCTION "public"."reorder_events"("events_with_new_round_number" "json") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."resolve_chaos_event_bets"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$declare
	chaos_status space_event_status;
	chaos_results jsonb;
	bet_data jsonb;
	bet_chaos_id int8;
	bet_subtype bet_subtype;
	bet_player_id int8;
	bet_is_loser boolean;
	bet_direction_is_over boolean;
	bet_ou_value float;
	player_score int8;
	player_score_changed boolean;
	number_of_losers int8;
	row_record record;
begin
	select status, chaos_space_event.results into chaos_status, chaos_results from chaos_space_event where id=NEW.id;
	
	if chaos_status != 'finished' then
		return NEW;
	end if;
	
	for row_record in
		select * from bet where bet_type = 'chaos_space_event' and status = 'active'
	loop
		bet_data := row_record.details;
		bet_chaos_id := (bet_data->>'chaosEventId')::int8;
		if bet_chaos_id = NEW.id then
			bet_subtype := (bet_data->>'subtype')::bet_subtype;
			if bet_subtype = 'player_loses' then
				bet_player_id := (bet_data->>'playerId')::int8;
				select score into player_score from player where id=bet_player_id;
				if player_score=0 then
					perform submit_bet_canceled_by_gm(row_record.id);
					continue;
				end if;
				bet_is_loser := bet_data->>'isLoser';
				player_score_changed := (chaos_results->>(bet_player_id::text))::int8 != 0;
				if bet_is_loser = player_score_changed then
					perform submit_bet_requester_won(row_record.id);
				else
					perform submit_bet_opponent_won(row_record.id);
				end if;
			end if;
			if bet_subtype = 'number_of_losers' then
				bet_direction_is_over := bet_data->>'directionIsOver';
				bet_ou_value := (bet_data->>'ouValue')::float;
				select count(key) into number_of_losers 
					from jsonb_each(chaos_results) 
					where value::float != 0;
				if bet_ou_value = number_of_losers then
					perform submit_bet_push(row_record.id);
					continue;
				end if;
				if (bet_direction_is_over and number_of_losers > bet_ou_value)
					or ((not bet_direction_is_over) and number_of_losers < bet_ou_value) then
					perform submit_bet_requester_won(row_record.id);
					continue;
				end if;
				perform submit_bet_opponent_won(row_record.id);
			end if;
		end if;
	end loop;
	return NEW;
end;$$;
ALTER FUNCTION "public"."resolve_chaos_event_bets"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."resolve_duel_bets"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$declare
	duel_status duel_status;
	row_record RECORD;
	bet_data jsonb;
	bet_duel_id int8;
	bet_challenger_wins boolean;
	duel_challenger_won boolean;
begin
	select status into duel_status from duel where id=NEW.id;
	
	if duel_status != 'challenger_won' and duel_status != 'opponent_won' then
		return NEW;
	end if;
	
	duel_challenger_won := (duel_status = 'challenger_won');
	
	for row_record in
		select * from bet where bet_type = 'duel' and status='active'
	loop
		bet_data := row_record.details;
		bet_duel_id := (bet_data->>'duelId')::int8;
		if bet_duel_id = NEW.id then
			bet_challenger_wins := (bet_data->>'challengerWins')::boolean;
			if bet_challenger_wins = duel_challenger_won then
				perform submit_bet_requester_won(row_record.id);
			else
				perform submit_bet_opponent_won(row_record.id);
			end if;
		end if;
	end loop;
	return NEW;
end;$$;
ALTER FUNCTION "public"."resolve_duel_bets"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."resolve_gameboard_move_bets"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$declare
	bet_row RECORD;
begin
	for bet_row in
		select
			id,
			status,
			(details->>'gameboardSpaceId')::int8 as gameboard_space_id
		from
			bet
		where
			bet_type = 'gameboard_move' and
			(details->>'playerId')::int8 = NEW.player_id
	loop
		if bet_row.status = 'pending_acceptance' then
			--Cancel pending bets that would be recontextualized
			perform submit_bet_canceled_by_gm(bet_row.id);
			continue;
		end if;
		if bet_row.status != 'active' then
			continue;
		end if;
		
		if NEW.gameboard_space_id = bet_row.gameboard_space_id then
			perform submit_bet_requester_won(bet_row.id);
		else
			perform submit_bet_opponent_won(bet_row.id);
		end if;
	end loop;
	return NEW;
end;$$;
ALTER FUNCTION "public"."resolve_gameboard_move_bets"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."resolve_ss_event_bets"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$declare
	ss_event_results jsonb;
	ss_event_status space_event_status;
	ss_event_score float;
	bet_data jsonb;
	bet_ss_event_id int8;
	bet_direction_is_over boolean;
	bet_ou_value float;
	row_record RECORD;
begin
  select status, results into ss_event_status, ss_event_results from special_space_event where id = NEW.id;

  if ss_event_status != 'finished' then
		return NEW;
  end if;
  
  ss_event_score := CAST(ss_event_results->>'score' as float);

  FOR row_record in  
		select * from bet where bet_type = 'special_space_event' and status = 'active'
  loop
		bet_data := row_record.details;
		bet_ss_event_id := cast(bet_data->>'ssEventId' as int8);
		if bet_ss_event_id = NEW.id then
	  	bet_direction_is_over := bet_data->>'directionIsOver';
	  	bet_ou_value := CAST(bet_data->>'ouValue' as float);
	  	if bet_ou_value = ss_event_score then
				perform submit_bet_push(row_record.id);
	  	elsif (bet_direction_is_over and ss_event_score > bet_ou_value)
				or ((not bet_direction_is_over) and ss_event_score < bet_ou_value) then
				perform submit_bet_requester_won(row_record.id);
	  	else
				perform submit_bet_opponent_won(row_record.id);
	  	end if;
		end if;
  end loop;
  return NEW;
end;$$;
ALTER FUNCTION "public"."resolve_ss_event_bets"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."set_new_event_round_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
    NEW.round_number := COALESCE((SELECT MAX(round_number) FROM event WHERE session_id = NEW.session_id) + 1, -1);
    RETURN NEW;
END;$$;
ALTER FUNCTION "public"."set_new_event_round_number"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."start_session_early"("now" timestamp without time zone) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- set start time to "now" (from the client, so timezone is correct)
    UPDATE public.session
    SET start_date = now
    WHERE id = (SELECT session_id FROM public.game_state WHERE id = 1);

    -- set session status to in_progress
    UPDATE public.game_state
    SET session_status = 'in_progress'
    WHERE id = 1;
END;
$$;
ALTER FUNCTION "public"."start_session_early"("now" timestamp without time zone) OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."submit_bet_accepted"("bet_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  v_requester_player_id int8;
  v_requester_wager int8;
  v_requester_name text;
  v_opponent_player_id int8;
  v_opponent_wager int8;
  v_opponent_name text;
  v_description text;
BEGIN
  SELECT 
    requester_player_id,
    requester_wager,
    opponent_player_id,
    opponent_wager,
    description
  INTO
    v_requester_player_id,
    v_requester_wager,
    v_opponent_player_id,
    v_opponent_wager,
    v_description
  FROM bet
  WHERE id = bet_id;

  SELECT u.display_name
  INTO v_requester_name
  FROM player p
  JOIN "user" u ON p.user_id = u.id
  WHERE p.id = v_requester_player_id;

  SELECT u.display_name
  INTO v_opponent_name
  FROM player p
  JOIN "user" u ON p.user_id = u.id
  WHERE p.id = v_opponent_player_id;

  INSERT INTO transaction 
    (player_id, 
    num_points, 
    description, 
    created_at, 
    updated_at)
  VALUES (
    v_requester_player_id, 
    -v_requester_wager,
    'Wager for bet against ' || v_opponent_name || ' that ''' || v_description || '''',
    now(),
    now());

  INSERT INTO transaction 
    (player_id, 
    num_points, 
    description, 
    created_at, 
    updated_at)
  VALUES (
    v_opponent_player_id, 
    -v_opponent_wager,
    'Wager for ' || v_requester_name || '''s bet that ''' || v_description || '''',
    now(),
    now());

  UPDATE bet
  SET status = 'active'
  WHERE id = bet_id;
END;$$;
ALTER FUNCTION "public"."submit_bet_accepted"("bet_id" bigint) OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."submit_bet_canceled_by_gm"("bet_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  v_requester_player_id int8;
  v_requester_wager int8;
  v_requester_name text;
  v_opponent_player_id int8;
  v_opponent_wager int8;
  v_opponent_name text;
  v_description text;
  v_old_status bet_status;
BEGIN
  SELECT 
    requester_player_id,
    requester_wager,
    opponent_player_id,
    opponent_wager,
    description,
    status
  INTO
    v_requester_player_id,
    v_requester_wager,
    v_opponent_player_id,
    v_opponent_wager,
    v_description,
    v_old_status
  FROM bet
  WHERE id = bet_id;

  IF v_old_status = 'active' THEN
    SELECT u.display_name
    INTO v_requester_name
    FROM player p
    JOIN "user" u ON p.user_id = u.id
    WHERE p.id = v_requester_player_id;

    SELECT u.display_name
    INTO v_opponent_name
    FROM player p
    JOIN "user" u ON p.user_id = u.id
    WHERE p.id = v_opponent_player_id;

    INSERT INTO transaction 
      (player_id, 
      num_points, 
      description, 
      created_at, 
      updated_at)
    VALUES (
      v_requester_player_id, 
      v_requester_wager,
      'Canceled by GM: Bet against ' || v_opponent_name || ' that ''' || v_description || '''',
      now(),
      now());

    INSERT INTO transaction 
      (player_id, 
      num_points, 
      description, 
      created_at, 
      updated_at)
    VALUES (
      v_opponent_player_id, 
      v_opponent_wager,
      'Canceled by GM: ' || v_requester_name || '''s bet that ''' || v_description || '''',
      now(),
      now());
  END IF;

  UPDATE bet
  SET status = 'canceled_by_gm'
  WHERE id = bet_id;
END;$$;
ALTER FUNCTION "public"."submit_bet_canceled_by_gm"("bet_id" bigint) OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."submit_bet_opponent_won"("bet_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  v_requester_player_id int8;
  v_requester_wager int8;
  v_requester_name text;
  v_opponent_player_id int8;
  v_opponent_wager int8;
  v_description text;
BEGIN
  SELECT 
    requester_player_id,
    requester_wager,
    opponent_player_id,
    opponent_wager,
    description
  INTO
    v_requester_player_id,
    v_requester_wager,
    v_opponent_player_id,
    v_opponent_wager,
    v_description
  FROM bet
  WHERE id = bet_id;

  SELECT u.display_name
  INTO v_requester_name
  FROM player p
  JOIN "user" u ON p.user_id = u.id
  WHERE p.id = v_requester_player_id;

  INSERT INTO transaction 
    (player_id, 
    num_points, 
    description, 
    created_at, 
    updated_at)
  VALUES (
    v_opponent_player_id, 
    v_opponent_wager + v_requester_wager,
    'Won ' || v_requester_name || '''s bet that ''' || v_description || '''',
    now(),
    now());

  UPDATE bet
  SET status = 'opponent_won'
  WHERE id = bet_id;
END;$$;
ALTER FUNCTION "public"."submit_bet_opponent_won"("bet_id" bigint) OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."submit_bet_push"("bet_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  v_requester_player_id int8;
  v_requester_wager int8;
  v_requester_name text;
  v_opponent_player_id int8;
  v_opponent_wager int8;
  v_opponent_name text;
  v_description text;
BEGIN
  SELECT 
    requester_player_id,
    requester_wager,
    opponent_player_id,
    opponent_wager,
    description
  INTO
    v_requester_player_id,
    v_requester_wager,
    v_opponent_player_id,
    v_opponent_wager,
    v_description
  FROM bet
  WHERE id = bet_id;

  SELECT u.display_name
  INTO v_requester_name
  FROM player p
  JOIN "user" u ON p.user_id = u.id
  WHERE p.id = v_requester_player_id;

  SELECT u.display_name
  INTO v_opponent_name
  FROM player p
  JOIN "user" u ON p.user_id = u.id
  WHERE p.id = v_opponent_player_id;

  INSERT INTO transaction 
    (player_id, 
    num_points, 
    description, 
    created_at, 
    updated_at)
  VALUES (
    v_requester_player_id, 
    v_requester_wager,
    'Push for bet against ' || v_opponent_name || ' that ''' || v_description || '''',
    now(),
    now());

  INSERT INTO transaction 
    (player_id, 
    num_points, 
    description, 
    created_at, 
    updated_at)
  VALUES (
    v_opponent_player_id, 
    v_opponent_wager,
    'Push for ' || v_requester_name || '''s bet that ''' || v_description || '''',
    now(),
    now());

  UPDATE bet
  SET status = 'push'
  WHERE id = bet_id;
END;$$;
ALTER FUNCTION "public"."submit_bet_push"("bet_id" bigint) OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."submit_bet_requester_won"("bet_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  v_requester_player_id int8;
  v_requester_wager int8;
  v_opponent_player_id int8;
  v_opponent_wager int8;
  v_opponent_name text;
  v_description text;
BEGIN
  SELECT 
    requester_player_id,
    requester_wager,
    opponent_player_id,
    opponent_wager,
    description
  INTO
    v_requester_player_id,
    v_requester_wager,
    v_opponent_player_id,
    v_opponent_wager,
    v_description
  FROM bet
  WHERE id = bet_id;

  SELECT u.display_name
  INTO v_opponent_name
  FROM player p
  JOIN "user" u ON p.user_id = u.id
  WHERE p.id = v_opponent_player_id;

  INSERT INTO transaction 
    (player_id, 
    num_points, 
    description, 
    created_at, 
    updated_at)
  VALUES (
    v_requester_player_id, 
    v_requester_wager + v_opponent_wager,
    'Won bet against ' || v_opponent_name || ' that ''' || v_description || '''',
    now(),
    now());

  UPDATE bet
  SET status = 'requester_won'
  WHERE id = bet_id;
END;$$;
ALTER FUNCTION "public"."submit_bet_requester_won"("bet_id" bigint) OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."submit_duel_results"("duel_id" bigint, "challenger_won" boolean, "player_score_changes" "json") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    duel_status duel_status;
    winner_id bigint;
    winner_display_name text;
    loser_id bigint;
    loser_display_name text;
    duel_round_number smallint;
    duel_game_name text;
    player_id bigint;
    transaction_description text;
    player_score bigint;
BEGIN
    -- Update duel status based on challenger_won parameter
    IF challenger_won THEN
        duel_status := 'challenger_won';
        winner_id := (SELECT challenger_player_id FROM duel WHERE id = duel_id);
        loser_id := (SELECT opponent_player_id FROM duel WHERE id = duel_id);
    ELSE
        duel_status := 'opponent_won';
        winner_id := (SELECT opponent_player_id FROM duel WHERE id = duel_id);
        loser_id := (SELECT challenger_player_id FROM duel WHERE id = duel_id);
    END IF;

    -- Get round number and game name
    SELECT round_number, game_name
    INTO duel_round_number, duel_game_name
    FROM duel
    WHERE id = duel_id;

    -- Get winning player's display name from the user table
    SELECT u.display_name
    INTO winner_display_name
    FROM player p
    JOIN "user" u ON p.user_id = u.id
    WHERE p.id = winner_id;

    -- Get losing player's display name from the user table
    SELECT u.display_name
    INTO loser_display_name
    FROM player p
    JOIN "user" u ON p.user_id = u.id
    WHERE p.id = loser_id;

    -- Loop through player_score_changes JSON object
    FOR player_id, player_score IN SELECT * FROM json_each_text(player_score_changes)
    LOOP
        -- Insert transaction record for each player
        INSERT INTO transaction (player_id, num_points, description, created_at, updated_at)
        VALUES (player_id, player_score,
            CASE WHEN (player_id = winner_id)
                THEN 'Duel in turn ' || duel_round_number || ': You beat ' || loser_display_name || ' in ' || duel_game_name
                ELSE 'Duel in turn ' || duel_round_number || ': ' || winner_display_name || ' beat you in ' || duel_game_name
            END,
            now(), now()
        );

        -- Update points_gained_by_winner for the winner
        IF player_id = winner_id THEN
            UPDATE duel
            SET points_gained_by_winner = player_score
            WHERE id = duel_id;
        END IF;
    END LOOP;

    -- Update duel status
    UPDATE duel
    SET status = duel_status
    WHERE id = duel_id;
END;
$$;
ALTER FUNCTION "public"."submit_duel_results"("duel_id" bigint, "challenger_won" boolean, "player_score_changes" "json") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."submit_event_scores"("team_scores" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  event_team RECORD;
  bet_row RECORD;
  position_from_bottom int;
BEGIN
	create temp table if not exists temp_team_scores as
		select
			(value->>'team_id')::int8 as team_id,
			(value->>'score')::int8 as score,
			(value->>'position')::int as position
		from
			jsonb_array_elements(team_scores);
		
	create temp table if not exists temp_team_position_bets as
		select
			id,
			status,
			(details->>'teamId')::int8 as team_id,
			(details->>'eventId')::int8 as event_id,
			(details->>'numberOfTeams')::int as number_of_teams,
			(details->>'directionIsTop')::boolean as direction_is_top
		from
			bet
		where
			(details->>'subtype')::bet_subtype = 'team_position'
			and bet_type = 'main_event';
			
	create temp table if not exists temp_score_bets as
		select
			id,
			status,
			(details->>'teamId')::int8 as team_id,
			(details->>'eventId')::int8 as event_id,
			(details->>'ouValue')::float as ou_value,
			(details->>'directionIsOver')::boolean as direction_is_over
		from
			bet
		where
			bet_type = 'main_event' and
			(details->>'subtype')::bet_subtype = 'score';

	for event_team in 
		select * from temp_team_scores
	loop
		insert into event_team_round_score (team_id, round_number, score) 
		  values (event_team.team_id, 1, event_team.score)
		  on conflict on constraint
			/* Added for debugging. In practice, a round should only be submitted once
			   so as to not generate extra transactions */
			team_round_pair
			  do update set score = excluded.score;

		for bet_row in
			select * from temp_team_position_bets
			where team_id = event_team.team_id
		loop
			if bet_row.status != 'active' then
				continue; 
			end if;
			if bet_row.direction_is_top then
				if event_team.position <= bet_row.number_of_teams then
					perform submit_bet_requester_won(bet_row.id);
				else
					perform submit_bet_opponent_won(bet_row.id);
				end if;
				continue;
			end if;
			
			if not bet_row.direction_is_top then
				select 1+count(team_id) into position_from_bottom
				from temp_team_scores
				where position > event_team.position;
				
				if position_from_bottom <= bet_row.number_of_teams then
					perform submit_bet_requester_won(bet_row.id);
				else
					perform submit_bet_opponent_won(bet_row.id);
				end if;		
			end if;
		end loop;
		
		for bet_row in
			select * from temp_score_bets
			where team_id = event_team.team_id
		loop
			if bet_row.status != 'active' then
				continue;
			end if;
			
			if bet_row.ou_value = event_team.score then
				perform submit_bet_push(bet_row.id);
				continue;
			end if;
			if (bet_row.direction_is_over and event_team.score > bet_row.ou_value)
				or ((not bet_row.direction_is_over) and event_team.score < bet_row.ou_value) then
				perform submit_bet_requester_won(bet_row.id);
				continue;
			end if;
			perform submit_bet_opponent_won(bet_row.id);
		end loop;
	end loop;
END;$$;
ALTER FUNCTION "public"."submit_event_scores"("team_scores" "jsonb") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."submit_space_event_player_score_changes"("space_event_id" bigint, "space_event_template_id" bigint, "player_score_changes" "json", "event_description" "text", "is_chaos_space_event" boolean, "add_lost_points_to_bank_balance" boolean DEFAULT false) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    player_id bigint;
    points bigint;
    round_num smallint;
    display_name_of_player_who_landed_on_space text;
    space_name text;
    v_session_id bigint;
BEGIN
    IF is_chaos_space_event THEN
        SELECT u.display_name, cse.round_number, gs.name
        INTO display_name_of_player_who_landed_on_space, round_num, space_name
        FROM "user" u
        JOIN player p ON u.id = p.user_id
        JOIN chaos_space_event cse ON p.id = cse.player_id
        JOIN gameboard_space gs ON cse.chaos_space_id = gs.id
        WHERE cse.id = space_event_id;
    ELSE
        SELECT u.display_name, sse.round_number, gs.name
        INTO display_name_of_player_who_landed_on_space, round_num, space_name
        FROM "user" u
        JOIN player p ON u.id = p.user_id
        JOIN special_space_event sse ON p.id = sse.player_id
        JOIN gameboard_space gs ON sse.special_space_id = gs.id
        WHERE sse.id = space_event_id;
    END IF;

    -- Add a row in the transaction table for each player in player_score_changes
    FOR player_id, points IN SELECT * FROM json_each_text(player_score_changes) LOOP
        IF points <> 0 THEN
            INSERT INTO transaction (player_id, num_points, description, created_at, updated_at)
            VALUES (player_id, points, display_name_of_player_who_landed_on_space || '''s ' || space_name || ' Space event for turn ' || round_num || ': ' || event_description, now(), now());

            -- add lost points to bank balance
            IF add_lost_points_to_bank_balance AND points < 0 THEN
                v_session_id := (SELECT p.session_id from player p WHERE p.id = player_id);

                UPDATE session
                SET bank_balance = bank_balance - points
                WHERE id = v_session_id;
            END IF;
        END IF;
    END LOOP;

    IF is_chaos_space_event THEN
        -- Set the status of the chaos_space_event to 'finished', and set results to player_score_changes JSON
        UPDATE chaos_space_event
        SET template_id = space_event_template_id, status = 'finished', results = player_score_changes
        WHERE id = space_event_id;
    ELSE
        -- Set the status of the special_space_event to 'finished', and set results to player_score_changes JSON
        UPDATE special_space_event
        SET template_id = space_event_template_id, status = 'finished', results = player_score_changes
        WHERE id = space_event_id;
    END IF;
END;
$$;
ALTER FUNCTION "public"."submit_space_event_player_score_changes"("space_event_id" bigint, "space_event_template_id" bigint, "player_score_changes" "json", "event_description" "text", "is_chaos_space_event" boolean, "add_lost_points_to_bank_balance" boolean) OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."submit_special_space_event_score"("special_space_event_id" bigint, "score" bigint) RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$DECLARE
    player_id_val bigint;
    session_points_per_game_point_val float;
    space_name_val text;
    points_label_plural_val text;
    template_name_val text;
    round_number_val smallint;
BEGIN
    -- Update special_space_event row
    UPDATE public.special_space_event
    SET status = 'finished',
        results = jsonb_build_object('score', score)
    WHERE id = special_space_event_id;

    -- Get player_id from special_space_event
    SELECT player_id, round_number INTO player_id_val, round_number_val
    FROM public.special_space_event
    WHERE id = special_space_event_id;

    -- Get session_points_per_game_point from special_space_event_template
    SELECT sset.details->>'sessionPointsPerGamePoint' INTO session_points_per_game_point_val
    FROM public.special_space_event sse
    JOIN public.special_space_event_template sset ON sse.template_id = sset.id
    WHERE sse.id = special_space_event_id;

    -- Get space_name, points_label_plural, and template_name
    SELECT gs.name, sset.details->>'pointsLabelPlural', sset.name
    INTO space_name_val, points_label_plural_val, template_name_val
    FROM public.special_space_event sse
    JOIN public.gameboard_space gs ON sse.special_space_id = gs.id
    JOIN public.special_space_event_template sset ON sse.template_id = sset.id
    WHERE sse.id = special_space_event_id;

    -- Create transaction for player
    INSERT INTO public.transaction (player_id, num_points, description)
    VALUES (player_id_val, score * session_points_per_game_point_val, 
    space_name_val || ' Space event for turn ' || round_number_val || ': ' || score || ' ' || points_label_plural_val || ' in ' || template_name_val);

END;$$;
ALTER FUNCTION "public"."submit_special_space_event_score"("special_space_event_id" bigint, "score" bigint) OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."sync_user_to_public_user"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_name text;
BEGIN
  v_name := initcap(substring(NEW.email from 1 for position('@' in NEW.email) - 1));

  INSERT INTO public.user (id, display_name, real_name)
  VALUES (NEW.id, v_name, v_name); RETURN NEW;
END;
$$;
ALTER FUNCTION "public"."sync_user_to_public_user"() OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."update_event_teams"("event_team_updates" "json") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$BEGIN
DELETE FROM public.event_team
WHERE
  id IN (
    SELECT
      (removed_team_json ->> 'id')::BIGINT AS id
    FROM
      JSON_ARRAY_ELEMENTS(event_team_updates::json -> 'removedTeams') AS removed_team_json
  );

INSERT INTO
  public.event_team (event_id, seed)
SELECT
  (new_event_team_json ->> 'event_id')::BIGINT AS event_id,
  (new_event_team_json ->> 'seed')::SMALLINT AS seed
FROM
  JSON_ARRAY_ELEMENTS(event_team_updates -> 'newEventTeams') AS new_event_team_json;

WITH
original_team AS (
  SELECT
  (new_event_team_json ->> 'id')::BIGINT AS old_id,
  (new_event_team_json ->> 'event_id')::BIGINT AS event_id,
  (new_event_team_json ->> 'seed')::BIGINT AS seed
FROM
  JSON_ARRAY_ELEMENTS(event_team_updates -> 'newEventTeams') AS new_event_team_json
),
old_id_to_new_id AS (
SELECT
old_id, id
FROM (
    original_team o
  INNER JOIN public.event_team e
  ON o.event_id = e.event_id AND o.seed = e.seed
)
),
updated_participant AS (
SELECT
  (updated_participant_json ->> 'id')::BIGINT AS id,
  (updated_participant_json ->> 'team_id')::BIGINT AS team_id
FROM
  JSON_ARRAY_ELEMENTS(event_team_updates -> 'updatedParticipants') AS updated_participant_json
)
UPDATE public.event_participant ep
SET
  team_id = updated_participant_with_team_id.team_id
FROM
  (
    SELECT
      elem.id,
      elem.team_id
    FROM
      (
        -- If the participant is on a newly-created team, use the auto-generated id of the new team.  Otherwise, use the id provided in the json
        (
          SELECT
            up.id,
            otn.id AS team_id
          FROM
            updated_participant up
            INNER JOIN old_id_to_new_id otn ON up.team_id = otn.old_id
        )
        UNION
        (
          SELECT
            up.id,
            up.team_id
          FROM
            updated_participant up
          WHERE
            up.team_id NOT IN (
              SELECT
                ot.old_id
              FROM
                original_team ot
            )
        )
      ) AS elem
  ) AS updated_participant_with_team_id
WHERE
  updated_participant_with_team_id.id = ep.id;

WITH
original_team AS (
  SELECT
  (new_event_team_json ->> 'id')::BIGINT AS old_id,
  (new_event_team_json ->> 'event_id')::BIGINT AS event_id,
  (new_event_team_json ->> 'seed')::BIGINT AS seed
FROM
  JSON_ARRAY_ELEMENTS(event_team_updates -> 'newEventTeams') AS new_event_team_json
),
old_id_to_new_id AS (
SELECT
old_id, id
FROM (
    original_team o
  INNER JOIN public.event_team e
  ON o.event_id = e.event_id AND o.seed = e.seed
)
),
new_participant AS (
SELECT
  (new_participant_json ->> 'player_id')::BIGINT AS player_id,
  (new_participant_json ->> 'team_id')::BIGINT AS team_id
FROM
  JSON_ARRAY_ELEMENTS(event_team_updates -> 'newParticipants') AS new_participant_json
)

INSERT INTO
  public.event_participant (player_id, team_id)
SELECT
  elem.player_id,
  elem.team_id
FROM
  (
    -- If the participant is on a newly-created team, use the auto-generated id of the new team.  Otherwise, use the id provided in the json
    (
      SELECT
        np.player_id,
        otn.id AS team_id
      FROM
        new_participant np
        INNER JOIN old_id_to_new_id otn ON np.team_id = otn.old_id
    )
    UNION
    (
      SELECT
        player_id,
        team_id
      FROM
        new_participant
      WHERE
        team_id NOT IN (
          SELECT
            ot.old_id
          FROM
            original_team ot
        )
    )
  ) as elem;
DELETE FROM public.event_participant
WHERE
  id IN (
    SELECT
      (removed_participant_json ->> 'id')::BIGINT AS id
    FROM
      JSON_ARRAY_ELEMENTS(event_team_updates::json -> 'removedParticipants') AS removed_participant_json
  );

UPDATE public.event_team
SET
  seed = updated_team.seed
FROM
  (
    SELECT
      (updated_team_json ->> 'id')::BIGINT AS id,
      (updated_team_json ->> 'seed')::SMALLINT AS seed
    FROM
      JSON_ARRAY_ELEMENTS(event_team_updates::json -> 'updatedTeams') AS updated_team_json
  ) AS updated_team
WHERE
  public.event_team.id = updated_team.id;
END;$$;
ALTER FUNCTION "public"."update_event_teams"("event_team_updates" "json") OWNER TO "postgres";
CREATE OR REPLACE FUNCTION "public"."update_player_score"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    UPDATE player
    SET score = score + NEW.num_points
    WHERE id = NEW.player_id;
    RETURN NEW;
END;
$$;
ALTER FUNCTION "public"."update_player_score"() OWNER TO "postgres";
SET default_tablespace = '';
SET default_table_access_method = "heap";
CREATE TABLE IF NOT EXISTS "public"."bet" (
    "id" bigint NOT NULL,
    "session_id" bigint NOT NULL,
    "requester_player_id" bigint NOT NULL,
    "opponent_player_id" bigint NOT NULL,
    "requester_wager" bigint NOT NULL,
    "opponent_wager" bigint NOT NULL,
    "description" "text" NOT NULL,
    "status" "public"."bet_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "bet_type" "public"."bet_type",
    "details" "jsonb"
);
ALTER TABLE "public"."bet" OWNER TO "postgres";
ALTER TABLE "public"."bet" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."bet_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
CREATE TABLE IF NOT EXISTS "public"."bracket" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "event_id" bigint NOT NULL,
    "data" "text" DEFAULT ''::"text"
);
ALTER TABLE "public"."bracket" OWNER TO "postgres";
ALTER TABLE "public"."bracket" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."bracket_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
CREATE TABLE IF NOT EXISTS "public"."chaos_space_event" (
    "id" bigint NOT NULL,
    "session_id" bigint NOT NULL,
    "round_number" smallint NOT NULL,
    "player_id" bigint NOT NULL,
    "template_id" bigint,
    "status" "public"."space_event_status" NOT NULL,
    "results" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "chaos_space_id" bigint NOT NULL
);
ALTER TABLE "public"."chaos_space_event" OWNER TO "postgres";
ALTER TABLE "public"."chaos_space_event" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."chaos_space_event_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
CREATE TABLE IF NOT EXISTS "public"."chaos_space_event_template" (
    "id" bigint NOT NULL,
    "session_id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "details" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "type" "public"."chaos_space_event_type" NOT NULL
);
ALTER TABLE "public"."chaos_space_event_template" OWNER TO "postgres";
ALTER TABLE "public"."chaos_space_event_template" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."chaos_space_event_template_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
CREATE TABLE IF NOT EXISTS "public"."duel" (
    "id" bigint NOT NULL,
    "challenger_player_id" bigint NOT NULL,
    "opponent_player_id" bigint,
    "game_name" "text",
    "wager_percentage" smallint,
    "status" "public"."duel_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "session_id" bigint NOT NULL,
    "round_number" smallint NOT NULL,
    "duel_space_id" bigint NOT NULL,
    "points_gained_by_winner" bigint
);
ALTER TABLE "public"."duel" OWNER TO "postgres";
ALTER TABLE "public"."duel" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."duel_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
CREATE TABLE IF NOT EXISTS "public"."event" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "round_number" smallint NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "rules" "text",
    "team_size" smallint NOT NULL,
    "scoring_map" smallint[] NOT NULL,
    "image_url" "text",
    "points_label" "text",
    "lower_scores_are_better" boolean DEFAULT false NOT NULL,
    "format" "public"."event_format" DEFAULT 'score_based_single_round'::"public"."event_format" NOT NULL,
    "session_id" bigint NOT NULL
);
ALTER TABLE "public"."event" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."event_format_standard_scoring_formula" (
    "id" "public"."event_format" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "formula" "text" NOT NULL
);
ALTER TABLE "public"."event_format_standard_scoring_formula" OWNER TO "postgres";
ALTER TABLE "public"."event" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."event_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
CREATE TABLE IF NOT EXISTS "public"."event_participant" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "team_id" bigint,
    "player_id" bigint NOT NULL
);
ALTER TABLE "public"."event_participant" OWNER TO "postgres";
ALTER TABLE "public"."event_participant" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."event_participant_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
CREATE TABLE IF NOT EXISTS "public"."event_team" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "event_id" bigint NOT NULL,
    "seed" smallint,
    "name" "text"
);
ALTER TABLE "public"."event_team" OWNER TO "postgres";
ALTER TABLE "public"."event_team" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."event_team_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
CREATE TABLE IF NOT EXISTS "public"."event_team_round_score" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "team_id" bigint NOT NULL,
    "round_number" smallint NOT NULL,
    "score" bigint DEFAULT '0'::bigint NOT NULL
);
ALTER TABLE "public"."event_team_round_score" OWNER TO "postgres";
ALTER TABLE "public"."event_team_round_score" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."event_team_round_score_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
CREATE TABLE IF NOT EXISTS "public"."game_state" (
    "id" smallint NOT NULL,
    "session_id" bigint NOT NULL,
    "round_number" smallint NOT NULL,
    "session_status" "public"."session_status" DEFAULT 'not_started'::"public"."session_status" NOT NULL,
    "game_master_user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "round_phase" "public"."round_phase" DEFAULT 'gameboard_moves'::"public"."round_phase" NOT NULL
);
ALTER TABLE "public"."game_state" OWNER TO "postgres";
ALTER TABLE "public"."game_state" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."game_state_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
CREATE TABLE IF NOT EXISTS "public"."gameboard_move" (
    "id" bigint NOT NULL,
    "player_id" bigint NOT NULL,
    "round_number" smallint NOT NULL,
    "distance_traveled" smallint NOT NULL,
    "gameboard_space_id" bigint NOT NULL,
    "created_at" timestamp with time zone NOT NULL,
    "updated_at" timestamp with time zone NOT NULL
);
ALTER TABLE "public"."gameboard_move" OWNER TO "postgres";
ALTER TABLE "public"."gameboard_move" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."gameboard_move_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
CREATE TABLE IF NOT EXISTS "public"."gameboard_space" (
    "id" bigint NOT NULL,
    "name" "text" DEFAULT ''::"text" NOT NULL,
    "color" "text" DEFAULT 'var(--gray-600)'::"text" NOT NULL,
    "icon_class" "text",
    "effect" "public"."gameboard_space_effect" DEFAULT 'gain_points'::"public"."gameboard_space_effect" NOT NULL,
    "effect_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "session_id" bigint NOT NULL
);
ALTER TABLE "public"."gameboard_space" OWNER TO "postgres";
ALTER TABLE "public"."gameboard_space" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."gameboard_space_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
CREATE TABLE IF NOT EXISTS "public"."player" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "session_id" bigint NOT NULL,
    "score" bigint DEFAULT '0'::bigint NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);
ALTER TABLE "public"."player" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."user" (
    "display_name" "text" DEFAULT 'Unknown'::"text" NOT NULL,
    "id" "uuid" NOT NULL,
    "avatar_url" "text" DEFAULT 'https://hqomdxggwvkmaovkytld.supabase.co/storage/v1/object/public/avatars/default.webp'::"text" NOT NULL,
    "can_edit_profile" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "can_place_bets" boolean DEFAULT true NOT NULL,
    "squidward_mode" boolean DEFAULT false NOT NULL,
    "can_toggle_squidward_mode" boolean DEFAULT false NOT NULL,
    "real_name" "text" DEFAULT '''Unknown''::text'::"text" NOT NULL
);
ALTER TABLE "public"."user" OWNER TO "postgres";
CREATE OR REPLACE VIEW "public"."lifetime_user_stats" AS
 SELECT "p"."user_id",
    "ceil"("sum"("p"."score")) AS "lifetime_score",
    "ceil"("avg"("p"."score")) AS "average_score",
    "count"("p"."id") AS "num_sessions",
    "u"."display_name",
    "u"."avatar_url"
   FROM ("public"."player" "p"
     JOIN "public"."user" "u" ON (("p"."user_id" = "u"."id")))
  GROUP BY "p"."user_id", "u"."display_name", "u"."avatar_url"
  ORDER BY ("ceil"("sum"("p"."score"))) DESC;
ALTER TABLE "public"."lifetime_user_stats" OWNER TO "postgres";
CREATE OR REPLACE VIEW "public"."moves_for_current_round" AS
 SELECT "gm"."player_id",
    "gm"."gameboard_space_id",
    "u"."display_name",
    "u"."avatar_url"
   FROM (("public"."gameboard_move" "gm"
     JOIN "public"."player" "p" ON (("gm"."player_id" = "p"."id")))
     JOIN "public"."user" "u" ON (("p"."user_id" = "u"."id")))
  WHERE (("gm"."round_number" = ( SELECT "game_state"."round_number"
           FROM "public"."game_state"
          ORDER BY "game_state"."id"
         LIMIT 1)) AND ("gm"."player_id" IN ( SELECT "gm"."player_id"
           FROM "public"."player"
          WHERE ("player"."session_id" = ( SELECT "game_state"."session_id"
                   FROM "public"."game_state"
                  ORDER BY "game_state"."id"
                 LIMIT 1)))));
ALTER TABLE "public"."moves_for_current_round" OWNER TO "postgres";
ALTER TABLE "public"."player" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."player_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
CREATE TABLE IF NOT EXISTS "public"."player_round_score" (
    "id" bigint NOT NULL,
    "player_id" bigint NOT NULL,
    "round_number" smallint NOT NULL,
    "score" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);
ALTER TABLE "public"."player_round_score" OWNER TO "postgres";
ALTER TABLE "public"."player_round_score" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."player_round_score_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
CREATE TABLE IF NOT EXISTS "public"."rules" (
    "id" bigint NOT NULL,
    "intro" "text" DEFAULT ''::"text",
    "session_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "events" "text",
    "gameboard" "text",
    "special_space_events" "text",
    "chaos_space_events" "text"
);
ALTER TABLE "public"."rules" OWNER TO "postgres";
ALTER TABLE "public"."rules" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."rules_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
CREATE TABLE IF NOT EXISTS "public"."session" (
    "id" bigint NOT NULL,
    "name" "text" DEFAULT 'Untitled'::"text" NOT NULL,
    "start_date" timestamp without time zone DEFAULT "now"() NOT NULL,
    "end_date" timestamp without time zone DEFAULT "now"() NOT NULL,
    "num_rounds" smallint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "bank_balance" bigint DEFAULT '0'::bigint NOT NULL,
    CONSTRAINT "session_bank_balance_check" CHECK (("bank_balance" >= 0))
);
ALTER TABLE "public"."session" OWNER TO "postgres";
ALTER TABLE "public"."session" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."session_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
CREATE TABLE IF NOT EXISTS "public"."special_space_event" (
    "id" bigint NOT NULL,
    "session_id" bigint NOT NULL,
    "round_number" smallint NOT NULL,
    "player_id" bigint NOT NULL,
    "template_id" bigint,
    "status" "public"."space_event_status" NOT NULL,
    "results" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "special_space_id" bigint NOT NULL
);
ALTER TABLE "public"."special_space_event" OWNER TO "postgres";
ALTER TABLE "public"."special_space_event" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."special_space_event_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
CREATE TABLE IF NOT EXISTS "public"."special_space_event_template" (
    "id" bigint NOT NULL,
    "session_id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "type" "public"."special_space_event_type" NOT NULL,
    "details" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);
ALTER TABLE "public"."special_space_event_template" OWNER TO "postgres";
ALTER TABLE "public"."special_space_event_template" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."special_space_event_template_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
CREATE OR REPLACE VIEW "public"."special_space_events_for_current_round" AS
 SELECT "sse"."id",
    "sse"."player_id",
    "sse"."template_id",
    "sset"."name" AS "template_name",
    "sse"."status",
    "u"."display_name",
    "u"."avatar_url"
   FROM ((("public"."special_space_event" "sse"
     JOIN "public"."player" "p" ON (("sse"."player_id" = "p"."id")))
     JOIN "public"."user" "u" ON (("p"."user_id" = "u"."id")))
     LEFT JOIN "public"."special_space_event_template" "sset" ON (("sse"."template_id" = "sset"."id")))
  WHERE (("sse"."round_number" = ( SELECT "gs"."round_number"
           FROM "public"."game_state" "gs"
          WHERE ("gs"."id" = 1))) AND ("sse"."session_id" = ( SELECT "gs"."session_id"
           FROM "public"."game_state" "gs"
          WHERE ("gs"."id" = 1))));
ALTER TABLE "public"."special_space_events_for_current_round" OWNER TO "postgres";
CREATE TABLE IF NOT EXISTS "public"."transaction" (
    "id" bigint NOT NULL,
    "player_id" bigint NOT NULL,
    "num_points" bigint NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);
ALTER TABLE "public"."transaction" OWNER TO "postgres";
ALTER TABLE "public"."transaction" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."transaction_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
CREATE TABLE IF NOT EXISTS "public"."user_notifications_subscription" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "notifications_subscription" "json" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);
ALTER TABLE "public"."user_notifications_subscription" OWNER TO "postgres";
ALTER TABLE "public"."user_notifications_subscription" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_notifications_subscription_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);
ALTER TABLE ONLY "public"."game_state"
    ADD CONSTRAINT "active_session_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."bet"
    ADD CONSTRAINT "bet_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."bracket"
    ADD CONSTRAINT "bracket_event_id_key" UNIQUE ("event_id");
ALTER TABLE ONLY "public"."bracket"
    ADD CONSTRAINT "bracket_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."chaos_space_event"
    ADD CONSTRAINT "chaos_space_event_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."chaos_space_event_template"
    ADD CONSTRAINT "chaos_space_event_template_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."duel"
    ADD CONSTRAINT "duel_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."event_format_standard_scoring_formula"
    ADD CONSTRAINT "event_format_standard_scoring_formula_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."event_participant"
    ADD CONSTRAINT "event_participant_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."event"
    ADD CONSTRAINT "event_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."event_team"
    ADD CONSTRAINT "event_team_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."event_team_round_score"
    ADD CONSTRAINT "event_team_round_score_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."gameboard_move"
    ADD CONSTRAINT "gameboard_move_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."gameboard_space"
    ADD CONSTRAINT "gameboard_space_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."player"
    ADD CONSTRAINT "player_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."player_round_score"
    ADD CONSTRAINT "player_round_score_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."rules"
    ADD CONSTRAINT "rules_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."rules"
    ADD CONSTRAINT "rules_session_id_key" UNIQUE ("session_id");
ALTER TABLE ONLY "public"."session"
    ADD CONSTRAINT "session_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."special_space_event"
    ADD CONSTRAINT "special_space_event_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."special_space_event_template"
    ADD CONSTRAINT "special_space_event_template_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."event_team_round_score"
    ADD CONSTRAINT "team_round_pair" UNIQUE ("team_id", "round_number");
ALTER TABLE ONLY "public"."transaction"
    ADD CONSTRAINT "transaction_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."user_notifications_subscription"
    ADD CONSTRAINT "user_notifications_subscription_pkey" PRIMARY KEY ("id");
ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");
CREATE INDEX "chaos_space_event_player_id_idx" ON "public"."chaos_space_event" USING "btree" ("player_id");
CREATE INDEX "chaos_space_event_session_id_idx" ON "public"."chaos_space_event" USING "btree" ("session_id");
CREATE INDEX "chaos_space_event_session_id_round_number_idx" ON "public"."chaos_space_event" USING "btree" ("session_id", "round_number");
CREATE INDEX "chaos_space_event_special_space_id_idx" ON "public"."chaos_space_event" USING "btree" ("chaos_space_id");
CREATE INDEX "chaos_space_event_template_id_idx" ON "public"."chaos_space_event" USING "btree" ("template_id");
CREATE INDEX "chaos_space_event_template_session_id_idx" ON "public"."chaos_space_event_template" USING "btree" ("session_id");
CREATE INDEX "event_participant_player_id_idx" ON "public"."event_participant" USING "btree" ("player_id");
CREATE INDEX "event_participant_team_id_idx" ON "public"."event_participant" USING "btree" ("team_id");
CREATE INDEX "event_participant_team_id_player_id_idx" ON "public"."event_participant" USING "btree" ("team_id", "player_id");
CREATE INDEX "event_session_id_idx" ON "public"."event" USING "btree" ("session_id");
CREATE INDEX "event_team_event_id_idx" ON "public"."event_team" USING "btree" ("event_id");
CREATE INDEX "event_team_round_score_team_id_idx" ON "public"."event_team_round_score" USING "btree" ("team_id");
CREATE INDEX "game_state_game_master_user_id_idx" ON "public"."game_state" USING "btree" ("game_master_user_id");
CREATE INDEX "game_state_session_id_idx" ON "public"."game_state" USING "btree" ("session_id");
CREATE INDEX "gameboard_move_gameboard_space_id_idx" ON "public"."gameboard_move" USING "btree" ("gameboard_space_id");
CREATE INDEX "gameboard_move_gameboard_space_id_player_id_idx" ON "public"."gameboard_move" USING "btree" ("gameboard_space_id", "player_id");
CREATE INDEX "gameboard_move_player_id_idx" ON "public"."gameboard_move" USING "btree" ("player_id");
CREATE INDEX "gameboard_move_player_id_round_number_idx" ON "public"."gameboard_move" USING "btree" ("player_id", "round_number");
CREATE INDEX "gameboard_space_session_id_idx" ON "public"."gameboard_space" USING "btree" ("session_id");
CREATE INDEX "player_round_score_player_id_idx" ON "public"."player_round_score" USING "btree" ("player_id");
CREATE INDEX "player_session_id_idx" ON "public"."player" USING "btree" ("session_id");
CREATE INDEX "player_user_id_idx" ON "public"."player" USING "btree" ("user_id");
CREATE INDEX "special_space_event_player_id_idx" ON "public"."special_space_event" USING "btree" ("player_id");
CREATE INDEX "special_space_event_session_id_idx" ON "public"."special_space_event" USING "btree" ("session_id");
CREATE INDEX "special_space_event_session_id_round_number_idx" ON "public"."special_space_event" USING "btree" ("session_id", "round_number");
CREATE INDEX "special_space_event_special_space_id_idx" ON "public"."special_space_event" USING "btree" ("special_space_id");
CREATE INDEX "special_space_event_template_id_idx" ON "public"."special_space_event" USING "btree" ("template_id");
CREATE INDEX "special_space_event_template_session_id_idx" ON "public"."special_space_event_template" USING "btree" ("session_id");
CREATE INDEX "transaction_player_id_idx" ON "public"."transaction" USING "btree" ("player_id");
CREATE INDEX "user_notifications_subscription_user_id_idx" ON "public"."user_notifications_subscription" USING "btree" ("user_id");
CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."bet" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');
CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."bracket" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');
CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."chaos_space_event" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');
CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."chaos_space_event_template" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');
CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."duel" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');
CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."event" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');
CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."event_format_standard_scoring_formula" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');
CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."event_participant" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');
CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."event_team" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');
CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."event_team_round_score" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');
CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."game_state" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');
CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."gameboard_move" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');
CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."gameboard_space" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');
CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."player" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');
CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."player_round_score" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');
CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."rules" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');
CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."session" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');
CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."special_space_event" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');
CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."special_space_event_template" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');
CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."transaction" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');
CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."user" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');
CREATE OR REPLACE TRIGGER "handle_updated_at" BEFORE UPDATE ON "public"."user_notifications_subscription" FOR EACH ROW EXECUTE FUNCTION "extensions"."moddatetime"('updated_at');
CREATE OR REPLACE TRIGGER "resolve_chaos_event_bets" AFTER UPDATE ON "public"."chaos_space_event" FOR EACH ROW EXECUTE FUNCTION "public"."resolve_chaos_event_bets"();
CREATE OR REPLACE TRIGGER "resolve_duel_bets_trigger" AFTER UPDATE ON "public"."duel" FOR EACH ROW EXECUTE FUNCTION "public"."resolve_duel_bets"();
CREATE OR REPLACE TRIGGER "resolve_gameboard_move_bets" AFTER INSERT ON "public"."gameboard_move" FOR EACH ROW EXECUTE FUNCTION "public"."resolve_gameboard_move_bets"();
CREATE OR REPLACE TRIGGER "resolve_ss_event_bets" AFTER UPDATE ON "public"."special_space_event" FOR EACH ROW EXECUTE FUNCTION "public"."resolve_ss_event_bets"();
CREATE OR REPLACE TRIGGER "set_new_event_round_number_trigger" BEFORE INSERT ON "public"."event" FOR EACH ROW EXECUTE FUNCTION "public"."set_new_event_round_number"();
CREATE OR REPLACE TRIGGER "update_player_score_trigger" AFTER INSERT ON "public"."transaction" FOR EACH ROW EXECUTE FUNCTION "public"."update_player_score"();
ALTER TABLE ONLY "public"."game_state"
    ADD CONSTRAINT "active_session_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id") ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY "public"."bet"
    ADD CONSTRAINT "bet_opponent_player_id_fkey" FOREIGN KEY ("opponent_player_id") REFERENCES "public"."player"("id") ON UPDATE CASCADE;
ALTER TABLE ONLY "public"."bet"
    ADD CONSTRAINT "bet_requester_player_id_fkey" FOREIGN KEY ("requester_player_id") REFERENCES "public"."player"("id") ON UPDATE CASCADE;
ALTER TABLE ONLY "public"."bet"
    ADD CONSTRAINT "bet_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id");
ALTER TABLE ONLY "public"."bracket"
    ADD CONSTRAINT "bracket_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "public"."chaos_space_event"
    ADD CONSTRAINT "chaos_space_event_chaos_space_id_fkey" FOREIGN KEY ("chaos_space_id") REFERENCES "public"."gameboard_space"("id") ON UPDATE CASCADE;
ALTER TABLE ONLY "public"."chaos_space_event"
    ADD CONSTRAINT "chaos_space_event_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."player"("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "public"."chaos_space_event"
    ADD CONSTRAINT "chaos_space_event_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "public"."chaos_space_event"
    ADD CONSTRAINT "chaos_space_event_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."chaos_space_event_template"("id") ON UPDATE CASCADE;
ALTER TABLE ONLY "public"."chaos_space_event_template"
    ADD CONSTRAINT "chaos_space_event_template_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "public"."duel"
    ADD CONSTRAINT "duel_challenger_player_id_fkey" FOREIGN KEY ("challenger_player_id") REFERENCES "public"."player"("id") ON UPDATE CASCADE;
ALTER TABLE ONLY "public"."duel"
    ADD CONSTRAINT "duel_duel_space_id_fkey" FOREIGN KEY ("duel_space_id") REFERENCES "public"."gameboard_space"("id") ON UPDATE CASCADE;
ALTER TABLE ONLY "public"."duel"
    ADD CONSTRAINT "duel_opponent_player_id_fkey" FOREIGN KEY ("opponent_player_id") REFERENCES "public"."player"("id") ON UPDATE CASCADE;
ALTER TABLE ONLY "public"."duel"
    ADD CONSTRAINT "duel_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "public"."event_participant"
    ADD CONSTRAINT "event_participant_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."player"("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "public"."event_participant"
    ADD CONSTRAINT "event_participant_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."event_team"("id") ON UPDATE CASCADE ON DELETE SET DEFAULT;
ALTER TABLE ONLY "public"."event"
    ADD CONSTRAINT "event_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "public"."event_team"
    ADD CONSTRAINT "event_team_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "public"."event_team_round_score"
    ADD CONSTRAINT "event_team_round_score_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."event_team"("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "public"."game_state"
    ADD CONSTRAINT "game_state_game_master_user_id_fkey" FOREIGN KEY ("game_master_user_id") REFERENCES "public"."user"("id") ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY "public"."gameboard_move"
    ADD CONSTRAINT "gameboard_move_gameboard_space_id_fkey" FOREIGN KEY ("gameboard_space_id") REFERENCES "public"."gameboard_space"("id") ON UPDATE CASCADE;
ALTER TABLE ONLY "public"."gameboard_move"
    ADD CONSTRAINT "gameboard_move_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."player"("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "public"."gameboard_space"
    ADD CONSTRAINT "gameboard_space_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "public"."player"
    ADD CONSTRAINT "player_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON UPDATE CASCADE;
ALTER TABLE ONLY "public"."player_round_score"
    ADD CONSTRAINT "public_player_round_score_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."player"("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "public"."player"
    ADD CONSTRAINT "public_player_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "public"."rules"
    ADD CONSTRAINT "public_rules_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "public"."special_space_event"
    ADD CONSTRAINT "special_space_event_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."player"("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "public"."special_space_event"
    ADD CONSTRAINT "special_space_event_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "public"."special_space_event"
    ADD CONSTRAINT "special_space_event_special_space_id_fkey" FOREIGN KEY ("special_space_id") REFERENCES "public"."gameboard_space"("id") ON UPDATE CASCADE;
ALTER TABLE ONLY "public"."special_space_event"
    ADD CONSTRAINT "special_space_event_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."special_space_event_template"("id") ON UPDATE CASCADE;
ALTER TABLE ONLY "public"."special_space_event_template"
    ADD CONSTRAINT "special_space_event_template_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "public"."transaction"
    ADD CONSTRAINT "transaction_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."player"("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "public"."user_notifications_subscription"
    ADD CONSTRAINT "user_notifications_subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON UPDATE CASCADE ON DELETE CASCADE;
CREATE POLICY "Enable ALL for authenticated users" ON "public"."bet" TO "authenticated" USING (true);
CREATE POLICY "Enable all for authenticated users only" ON "public"."bracket" TO "authenticated" USING (true);
CREATE POLICY "Enable all for authenticated users only" ON "public"."chaos_space_event" TO "authenticated" USING (true);
CREATE POLICY "Enable all for authenticated users only" ON "public"."chaos_space_event_template" TO "authenticated" USING (true);
CREATE POLICY "Enable all for authenticated users only" ON "public"."duel" TO "authenticated" USING (true);
CREATE POLICY "Enable all for authenticated users only" ON "public"."event" TO "authenticated" USING (true);
CREATE POLICY "Enable all for authenticated users only" ON "public"."event_format_standard_scoring_formula" TO "authenticated" USING (true);
CREATE POLICY "Enable all for authenticated users only" ON "public"."event_participant" TO "authenticated" USING (true);
CREATE POLICY "Enable all for authenticated users only" ON "public"."event_team" TO "authenticated" USING (true);
CREATE POLICY "Enable all for authenticated users only" ON "public"."event_team_round_score" TO "authenticated" USING (true);
CREATE POLICY "Enable all for authenticated users only" ON "public"."game_state" TO "authenticated" USING (true);
CREATE POLICY "Enable all for authenticated users only" ON "public"."gameboard_move" TO "authenticated" USING (true);
CREATE POLICY "Enable all for authenticated users only" ON "public"."gameboard_space" TO "authenticated" USING (true);
CREATE POLICY "Enable all for authenticated users only" ON "public"."player" TO "authenticated" USING (true);
CREATE POLICY "Enable all for authenticated users only" ON "public"."player_round_score" TO "authenticated" USING (true);
CREATE POLICY "Enable all for authenticated users only" ON "public"."rules" TO "authenticated" USING (true);
CREATE POLICY "Enable all for authenticated users only" ON "public"."session" TO "authenticated" USING (true);
CREATE POLICY "Enable all for authenticated users only" ON "public"."special_space_event" TO "authenticated" USING (true);
CREATE POLICY "Enable all for authenticated users only" ON "public"."special_space_event_template" TO "authenticated" USING (true);
CREATE POLICY "Enable all for authenticated users only" ON "public"."transaction" TO "authenticated" USING (true);
CREATE POLICY "Enable all for authenticated users only" ON "public"."user" TO "authenticated" USING (true);
CREATE POLICY "Enable all for authenticated users only" ON "public"."user_notifications_subscription" TO "authenticated" USING (true);
ALTER TABLE "public"."bet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."bracket" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."chaos_space_event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."chaos_space_event_template" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."duel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."event_format_standard_scoring_formula" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."event_participant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."event_team" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."event_team_round_score" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."game_state" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."gameboard_move" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."gameboard_space" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."player" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."player_round_score" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."rules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."special_space_event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."special_space_event_template" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_notifications_subscription" ENABLE ROW LEVEL SECURITY;
ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."bet";
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."bracket";
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."chaos_space_event";
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."chaos_space_event_template";
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."duel";
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."event";
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."event_format_standard_scoring_formula";
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."event_participant";
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."event_team";
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."event_team_round_score";
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."game_state";
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."gameboard_move";
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."gameboard_space";
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."player";
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."player_round_score";
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."rules";
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."session";
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."special_space_event";
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."special_space_event_template";
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."transaction";
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."user";
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."user_notifications_subscription";
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT ALL ON FUNCTION "public"."bulk_cancel_bets"("player_id" bigint, "includeactive" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."bulk_cancel_bets"("player_id" bigint, "includeactive" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."bulk_cancel_bets"("player_id" bigint, "includeactive" boolean) TO "service_role";
GRANT ALL ON FUNCTION "public"."create_session"("session_name" "text", "session_start_date" timestamp without time zone, "session_end_date" timestamp without time zone, "num_rounds" smallint, "player_user_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."create_session"("session_name" "text", "session_start_date" timestamp without time zone, "session_end_date" timestamp without time zone, "num_rounds" smallint, "player_user_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_session"("session_name" "text", "session_start_date" timestamp without time zone, "session_end_date" timestamp without time zone, "num_rounds" smallint, "player_user_ids" "uuid"[]) TO "service_role";
GRANT ALL ON FUNCTION "public"."delete_gameboard_space"("v_gameboard_space_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."delete_gameboard_space"("v_gameboard_space_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_gameboard_space"("v_gameboard_space_id" bigint) TO "service_role";
GRANT ALL ON FUNCTION "public"."end_round"("_round_number" integer, "team_score_changes" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."end_round"("_round_number" integer, "team_score_changes" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."end_round"("_round_number" integer, "team_score_changes" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."get_all_scores_from_session"("sessionid" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_all_scores_from_session"("sessionid" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_scores_from_session"("sessionid" integer) TO "service_role";
GRANT ALL ON FUNCTION "public"."get_duel_history_for_session"("sessionid" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_duel_history_for_session"("sessionid" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_duel_history_for_session"("sessionid" bigint) TO "service_role";
GRANT ALL ON FUNCTION "public"."get_player_duel_stats_for_session"("sessionid" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_player_duel_stats_for_session"("sessionid" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_player_duel_stats_for_session"("sessionid" bigint) TO "service_role";
GRANT ALL ON FUNCTION "public"."get_player_round_scores_from_session"("sessionid" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_player_round_scores_from_session"("sessionid" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_player_round_scores_from_session"("sessionid" bigint) TO "service_role";
GRANT ALL ON FUNCTION "public"."get_roll_history_for_session"("sessionid" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_roll_history_for_session"("sessionid" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_roll_history_for_session"("sessionid" bigint) TO "service_role";
GRANT ALL ON FUNCTION "public"."get_space_stats_for_session"("sessionid" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_space_stats_for_session"("sessionid" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_space_stats_for_session"("sessionid" bigint) TO "service_role";
GRANT ALL ON FUNCTION "public"."hello_world"() TO "anon";
GRANT ALL ON FUNCTION "public"."hello_world"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."hello_world"() TO "service_role";
GRANT ALL ON FUNCTION "public"."log_round_moves"("playermoves" "json", "roundnumber" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."log_round_moves"("playermoves" "json", "roundnumber" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_round_moves"("playermoves" "json", "roundnumber" integer) TO "service_role";
GRANT ALL ON FUNCTION "public"."override_bank_balance"("data" "json") TO "anon";
GRANT ALL ON FUNCTION "public"."override_bank_balance"("data" "json") TO "authenticated";
GRANT ALL ON FUNCTION "public"."override_bank_balance"("data" "json") TO "service_role";
GRANT ALL ON FUNCTION "public"."override_points"("data" "json", "add_lost_points_to_bank_balance" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."override_points"("data" "json", "add_lost_points_to_bank_balance" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."override_points"("data" "json", "add_lost_points_to_bank_balance" boolean) TO "service_role";
GRANT ALL ON FUNCTION "public"."reorder_events"("events_with_new_round_number" "json") TO "anon";
GRANT ALL ON FUNCTION "public"."reorder_events"("events_with_new_round_number" "json") TO "authenticated";
GRANT ALL ON FUNCTION "public"."reorder_events"("events_with_new_round_number" "json") TO "service_role";
GRANT ALL ON FUNCTION "public"."resolve_chaos_event_bets"() TO "anon";
GRANT ALL ON FUNCTION "public"."resolve_chaos_event_bets"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."resolve_chaos_event_bets"() TO "service_role";
GRANT ALL ON FUNCTION "public"."resolve_duel_bets"() TO "anon";
GRANT ALL ON FUNCTION "public"."resolve_duel_bets"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."resolve_duel_bets"() TO "service_role";
GRANT ALL ON FUNCTION "public"."resolve_gameboard_move_bets"() TO "anon";
GRANT ALL ON FUNCTION "public"."resolve_gameboard_move_bets"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."resolve_gameboard_move_bets"() TO "service_role";
GRANT ALL ON FUNCTION "public"."resolve_ss_event_bets"() TO "anon";
GRANT ALL ON FUNCTION "public"."resolve_ss_event_bets"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."resolve_ss_event_bets"() TO "service_role";
GRANT ALL ON FUNCTION "public"."set_new_event_round_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_new_event_round_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_new_event_round_number"() TO "service_role";
GRANT ALL ON FUNCTION "public"."start_session_early"("now" timestamp without time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."start_session_early"("now" timestamp without time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."start_session_early"("now" timestamp without time zone) TO "service_role";
GRANT ALL ON FUNCTION "public"."submit_bet_accepted"("bet_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."submit_bet_accepted"("bet_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_bet_accepted"("bet_id" bigint) TO "service_role";
GRANT ALL ON FUNCTION "public"."submit_bet_canceled_by_gm"("bet_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."submit_bet_canceled_by_gm"("bet_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_bet_canceled_by_gm"("bet_id" bigint) TO "service_role";
GRANT ALL ON FUNCTION "public"."submit_bet_opponent_won"("bet_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."submit_bet_opponent_won"("bet_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_bet_opponent_won"("bet_id" bigint) TO "service_role";
GRANT ALL ON FUNCTION "public"."submit_bet_push"("bet_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."submit_bet_push"("bet_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_bet_push"("bet_id" bigint) TO "service_role";
GRANT ALL ON FUNCTION "public"."submit_bet_requester_won"("bet_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."submit_bet_requester_won"("bet_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_bet_requester_won"("bet_id" bigint) TO "service_role";
GRANT ALL ON FUNCTION "public"."submit_duel_results"("duel_id" bigint, "challenger_won" boolean, "player_score_changes" "json") TO "anon";
GRANT ALL ON FUNCTION "public"."submit_duel_results"("duel_id" bigint, "challenger_won" boolean, "player_score_changes" "json") TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_duel_results"("duel_id" bigint, "challenger_won" boolean, "player_score_changes" "json") TO "service_role";
GRANT ALL ON FUNCTION "public"."submit_event_scores"("team_scores" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."submit_event_scores"("team_scores" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_event_scores"("team_scores" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "public"."submit_space_event_player_score_changes"("space_event_id" bigint, "space_event_template_id" bigint, "player_score_changes" "json", "event_description" "text", "is_chaos_space_event" boolean, "add_lost_points_to_bank_balance" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."submit_space_event_player_score_changes"("space_event_id" bigint, "space_event_template_id" bigint, "player_score_changes" "json", "event_description" "text", "is_chaos_space_event" boolean, "add_lost_points_to_bank_balance" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_space_event_player_score_changes"("space_event_id" bigint, "space_event_template_id" bigint, "player_score_changes" "json", "event_description" "text", "is_chaos_space_event" boolean, "add_lost_points_to_bank_balance" boolean) TO "service_role";
GRANT ALL ON FUNCTION "public"."submit_special_space_event_score"("special_space_event_id" bigint, "score" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."submit_special_space_event_score"("special_space_event_id" bigint, "score" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_special_space_event_score"("special_space_event_id" bigint, "score" bigint) TO "service_role";
GRANT ALL ON FUNCTION "public"."sync_user_to_public_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_user_to_public_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_user_to_public_user"() TO "service_role";
GRANT ALL ON FUNCTION "public"."update_event_teams"("event_team_updates" "json") TO "anon";
GRANT ALL ON FUNCTION "public"."update_event_teams"("event_team_updates" "json") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_event_teams"("event_team_updates" "json") TO "service_role";
GRANT ALL ON FUNCTION "public"."update_player_score"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_player_score"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_player_score"() TO "service_role";
GRANT ALL ON TABLE "public"."bet" TO "anon";
GRANT ALL ON TABLE "public"."bet" TO "authenticated";
GRANT ALL ON TABLE "public"."bet" TO "service_role";
GRANT ALL ON SEQUENCE "public"."bet_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bet_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bet_id_seq" TO "service_role";
GRANT ALL ON TABLE "public"."bracket" TO "anon";
GRANT ALL ON TABLE "public"."bracket" TO "authenticated";
GRANT ALL ON TABLE "public"."bracket" TO "service_role";
GRANT ALL ON SEQUENCE "public"."bracket_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bracket_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bracket_id_seq" TO "service_role";
GRANT ALL ON TABLE "public"."chaos_space_event" TO "anon";
GRANT ALL ON TABLE "public"."chaos_space_event" TO "authenticated";
GRANT ALL ON TABLE "public"."chaos_space_event" TO "service_role";
GRANT ALL ON SEQUENCE "public"."chaos_space_event_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."chaos_space_event_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."chaos_space_event_id_seq" TO "service_role";
GRANT ALL ON TABLE "public"."chaos_space_event_template" TO "anon";
GRANT ALL ON TABLE "public"."chaos_space_event_template" TO "authenticated";
GRANT ALL ON TABLE "public"."chaos_space_event_template" TO "service_role";
GRANT ALL ON SEQUENCE "public"."chaos_space_event_template_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."chaos_space_event_template_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."chaos_space_event_template_id_seq" TO "service_role";
GRANT ALL ON TABLE "public"."duel" TO "anon";
GRANT ALL ON TABLE "public"."duel" TO "authenticated";
GRANT ALL ON TABLE "public"."duel" TO "service_role";
GRANT ALL ON SEQUENCE "public"."duel_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."duel_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."duel_id_seq" TO "service_role";
GRANT ALL ON TABLE "public"."event" TO "anon";
GRANT ALL ON TABLE "public"."event" TO "authenticated";
GRANT ALL ON TABLE "public"."event" TO "service_role";
GRANT ALL ON TABLE "public"."event_format_standard_scoring_formula" TO "anon";
GRANT ALL ON TABLE "public"."event_format_standard_scoring_formula" TO "authenticated";
GRANT ALL ON TABLE "public"."event_format_standard_scoring_formula" TO "service_role";
GRANT ALL ON SEQUENCE "public"."event_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."event_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."event_id_seq" TO "service_role";
GRANT ALL ON TABLE "public"."event_participant" TO "anon";
GRANT ALL ON TABLE "public"."event_participant" TO "authenticated";
GRANT ALL ON TABLE "public"."event_participant" TO "service_role";
GRANT ALL ON SEQUENCE "public"."event_participant_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."event_participant_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."event_participant_id_seq" TO "service_role";
GRANT ALL ON TABLE "public"."event_team" TO "anon";
GRANT ALL ON TABLE "public"."event_team" TO "authenticated";
GRANT ALL ON TABLE "public"."event_team" TO "service_role";
GRANT ALL ON SEQUENCE "public"."event_team_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."event_team_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."event_team_id_seq" TO "service_role";
GRANT ALL ON TABLE "public"."event_team_round_score" TO "anon";
GRANT ALL ON TABLE "public"."event_team_round_score" TO "authenticated";
GRANT ALL ON TABLE "public"."event_team_round_score" TO "service_role";
GRANT ALL ON SEQUENCE "public"."event_team_round_score_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."event_team_round_score_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."event_team_round_score_id_seq" TO "service_role";
GRANT ALL ON TABLE "public"."game_state" TO "anon";
GRANT ALL ON TABLE "public"."game_state" TO "authenticated";
GRANT ALL ON TABLE "public"."game_state" TO "service_role";
GRANT ALL ON SEQUENCE "public"."game_state_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."game_state_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."game_state_id_seq" TO "service_role";
GRANT ALL ON TABLE "public"."gameboard_move" TO "anon";
GRANT ALL ON TABLE "public"."gameboard_move" TO "authenticated";
GRANT ALL ON TABLE "public"."gameboard_move" TO "service_role";
GRANT ALL ON SEQUENCE "public"."gameboard_move_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."gameboard_move_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."gameboard_move_id_seq" TO "service_role";
GRANT ALL ON TABLE "public"."gameboard_space" TO "anon";
GRANT ALL ON TABLE "public"."gameboard_space" TO "authenticated";
GRANT ALL ON TABLE "public"."gameboard_space" TO "service_role";
GRANT ALL ON SEQUENCE "public"."gameboard_space_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."gameboard_space_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."gameboard_space_id_seq" TO "service_role";
GRANT ALL ON TABLE "public"."player" TO "anon";
GRANT ALL ON TABLE "public"."player" TO "authenticated";
GRANT ALL ON TABLE "public"."player" TO "service_role";
GRANT ALL ON TABLE "public"."user" TO "anon";
GRANT ALL ON TABLE "public"."user" TO "authenticated";
GRANT ALL ON TABLE "public"."user" TO "service_role";
GRANT ALL ON TABLE "public"."lifetime_user_stats" TO "anon";
GRANT ALL ON TABLE "public"."lifetime_user_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."lifetime_user_stats" TO "service_role";
GRANT ALL ON TABLE "public"."moves_for_current_round" TO "anon";
GRANT ALL ON TABLE "public"."moves_for_current_round" TO "authenticated";
GRANT ALL ON TABLE "public"."moves_for_current_round" TO "service_role";
GRANT ALL ON SEQUENCE "public"."player_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."player_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."player_id_seq" TO "service_role";
GRANT ALL ON TABLE "public"."player_round_score" TO "anon";
GRANT ALL ON TABLE "public"."player_round_score" TO "authenticated";
GRANT ALL ON TABLE "public"."player_round_score" TO "service_role";
GRANT ALL ON SEQUENCE "public"."player_round_score_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."player_round_score_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."player_round_score_id_seq" TO "service_role";
GRANT ALL ON TABLE "public"."rules" TO "anon";
GRANT ALL ON TABLE "public"."rules" TO "authenticated";
GRANT ALL ON TABLE "public"."rules" TO "service_role";
GRANT ALL ON SEQUENCE "public"."rules_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."rules_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."rules_id_seq" TO "service_role";
GRANT ALL ON TABLE "public"."session" TO "anon";
GRANT ALL ON TABLE "public"."session" TO "authenticated";
GRANT ALL ON TABLE "public"."session" TO "service_role";
GRANT ALL ON SEQUENCE "public"."session_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."session_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."session_id_seq" TO "service_role";
GRANT ALL ON TABLE "public"."special_space_event" TO "anon";
GRANT ALL ON TABLE "public"."special_space_event" TO "authenticated";
GRANT ALL ON TABLE "public"."special_space_event" TO "service_role";
GRANT ALL ON SEQUENCE "public"."special_space_event_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."special_space_event_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."special_space_event_id_seq" TO "service_role";
GRANT ALL ON TABLE "public"."special_space_event_template" TO "anon";
GRANT ALL ON TABLE "public"."special_space_event_template" TO "authenticated";
GRANT ALL ON TABLE "public"."special_space_event_template" TO "service_role";
GRANT ALL ON SEQUENCE "public"."special_space_event_template_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."special_space_event_template_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."special_space_event_template_id_seq" TO "service_role";
GRANT ALL ON TABLE "public"."special_space_events_for_current_round" TO "anon";
GRANT ALL ON TABLE "public"."special_space_events_for_current_round" TO "authenticated";
GRANT ALL ON TABLE "public"."special_space_events_for_current_round" TO "service_role";
GRANT ALL ON TABLE "public"."transaction" TO "anon";
GRANT ALL ON TABLE "public"."transaction" TO "authenticated";
GRANT ALL ON TABLE "public"."transaction" TO "service_role";
GRANT ALL ON SEQUENCE "public"."transaction_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."transaction_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."transaction_id_seq" TO "service_role";
GRANT ALL ON TABLE "public"."user_notifications_subscription" TO "anon";
GRANT ALL ON TABLE "public"."user_notifications_subscription" TO "authenticated";
GRANT ALL ON TABLE "public"."user_notifications_subscription" TO "service_role";
GRANT ALL ON SEQUENCE "public"."user_notifications_subscription_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_notifications_subscription_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_notifications_subscription_id_seq" TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";
RESET ALL;
