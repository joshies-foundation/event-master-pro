alter type public.gameboard_space_effect add value if not exists 'chance_points';

CREATE OR REPLACE FUNCTION public.log_round_moves(playermoves json, roundnumber integer)
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
    num_players_who_landed_on_bank_space := (SELECT COUNT(*) FROM json_object_keys(playerMoves::json) pm WHERE (playerMoves->pm->>'gameboardSpaceId')::INT IN (SELECT id FROM gameboard_space gs WHERE gs.effect = 'bank'));

    FOR v_player_id, values IN SELECT * FROM json_each_text(playerMoves::json)
    LOOP
        v_gameboard_space_id := values -> 'gameboardSpaceId';
        distance_traveled := values -> 'distanceTraveled';
        chance_points_amount := values -> 'chancePointsAmount';
        
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

        --Gain or lose points for Chance space
        IF gameboard_space_effect = 'chance_points' THEN
            INSERT INTO transaction (player_id, num_points, description, created_at, updated_at)
            VALUES (v_player_id, chance_points_amount, space_name || ' Space on turn ' || roundNumber, now(), now());

                -- add lost points to the bank balance
                IF chance_points_amount < 0 THEN
                    v_session_id := (SELECT p.session_id from player p WHERE p.id = v_player_id);

                    UPDATE session
                    SET bank_balance = bank_balance - chance_points_amount
                    WHERE id = v_session_id;
                END IF;
        END IF;
    END LOOP;

    -- Reset bank balance to 0 if someone landed on the bank space
    IF num_players_who_landed_on_bank_space > 0 THEN
        UPDATE session SET bank_balance = 0 WHERE id = (SELECT session_id FROM player WHERE id = v_player_id);
    END IF;
    
    -- go to next round phase
    UPDATE game_state SET round_phase = 'special_space_events' WHERE id = 1;
    
    RETURN;
END;$function$;

CREATE OR REPLACE FUNCTION public.delete_event_team_and_update_seeds(team_id integer, seed_updates jsonb)
 RETURNS void
 LANGUAGE plpgsql
AS $function$declare
  update_row jsonb;
begin
  delete from event_team where id = team_id;

  for update_row in select * from jsonb_array_elements(seed_updates)
  loop
    update event_team
    set
      seed = (update_row->>'seed')::int,
      updated_at = now()
    where id = (update_row->>'id')::int;
  end loop;
end;$function$
;

CREATE OR REPLACE FUNCTION public.randomize_event_teams(p_event_id integer, p_team_count integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$DECLARE
  v_session_id  INTEGER;
  v_team_ids    INTEGER[];
  v_player_ids  INTEGER[];
  v_player_id   INTEGER;
  i             INTEGER := 0;
BEGIN
  -- Validate team count
  IF p_team_count < 1 THEN
    RAISE EXCEPTION 'team_count must be at least 1';
  END IF;

  -- Resolve the session this event belongs to
  SELECT session_id
  INTO v_session_id
  FROM event
  WHERE id = p_event_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event % not found', p_event_id;
  END IF;

  -- Delete all existing teams for this event
  -- (cascades to event_participant via event_participant_team_id_fkey)
  DELETE FROM event_team WHERE event_id = p_event_id;

  -- Create the new teams and capture their IDs in order
  WITH inserted AS (
    INSERT INTO event_team (event_id, name, seed)
    SELECT
      p_event_id,
      'Team ' || gs,
      gs
    FROM generate_series(1, p_team_count) AS gs
    RETURNING id, seed
  )
  SELECT array_agg(id ORDER BY seed)
  INTO v_team_ids
  FROM inserted;

  -- Collect all enabled players in this session, shuffled randomly
  SELECT array_agg(id ORDER BY random())
  INTO v_player_ids
  FROM player
  WHERE session_id = v_session_id
    AND enabled = TRUE;

  -- Round-robin assign each player to a team slot
  -- e.g. 7 players across 3 teams → teams get 3, 2, 2 players
  FOREACH v_player_id IN ARRAY v_player_ids
  LOOP
    INSERT INTO event_participant (player_id, team_id)
    VALUES (v_player_id, v_team_ids[(i % p_team_count) + 1]);

    i := i + 1;
  END LOOP;
END;$function$
;

CREATE OR REPLACE FUNCTION public.update_event_team_seeds(updates jsonb)
 RETURNS void
 LANGUAGE plpgsql
AS $function$declare
  update_row jsonb;
begin
  for update_row in select * from jsonb_array_elements(updates)
  loop
    update event_team
    set
      seed = (update_row->>'seed')::int,
      updated_at = now()
    where id = (update_row->>'id')::int;
  end loop;
end;$function$
;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 6291456, array['image/*']),
  ('event-images', 'event-images', true, 6291456, array['image/*'])
on conflict (id) do nothing;

drop policy if exists "Allow authenticated avatar uploads 1oj01fe_0" on storage.objects;
create policy "Allow authenticated avatar uploads 1oj01fe_0"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars');

drop policy if exists "Allow authenticated event image uploads 1o4y39n_0" on storage.objects;
create policy "Allow authenticated event image uploads 1o4y39n_0"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'event-images');
