create extension if not exists "http" with schema "extensions";


drop trigger if exists "bet_push_notifications" on "public"."bet";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.hello_world()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN 'Hello, World!';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.end_round(_round_number integer, team_score_changes jsonb)
 RETURNS void
 LANGUAGE plpgsql
AS $function$DECLARE
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
END;$function$
;

CREATE OR REPLACE FUNCTION public.resolve_chaos_event_bets()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$declare
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
end;$function$
;

CREATE OR REPLACE FUNCTION public.resolve_duel_bets()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$declare
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
end;$function$
;

CREATE OR REPLACE FUNCTION public.submit_event_scores(team_scores jsonb)
 RETURNS void
 LANGUAGE plpgsql
AS $function$DECLARE
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
END;$function$
;

CREATE OR REPLACE FUNCTION public.submit_special_space_event_score(special_space_event_id bigint, score bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$DECLARE
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

END;$function$
;

CREATE TRIGGER bet_push_notifications AFTER INSERT OR UPDATE ON public.bet FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://bbptbpmmfformxfzkdgl.supabase.co/functions/v1/push', 'POST', '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJicHRicG1tZmZvcm14ZnprZGdsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMDU2OTI5MiwiZXhwIjoyMDM2MTQ1MjkyfQ.yLVD_l-Nrmo0aZCO0rbJ3pi4YRI5Y_VNTj_deyZKYqk"}', '{}', '1000');


