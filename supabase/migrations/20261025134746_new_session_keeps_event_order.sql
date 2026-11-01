SET local check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_session (
  session_name       text,
  session_start_date timestamp without time zone,
  session_end_date   timestamp without time zone,
  num_rounds         smallint,
  player_user_ids    uuid[]
)
  RETURNS void
  LANGUAGE plpgsql
  AS $function$DECLARE
    new_session_id bigint;
    previous_session_id bigint;
BEGIN
    previous_session_id := (SELECT id FROM public.session ORDER BY id DESC LIMIT 1);

    INSERT INTO public.session (name, start_date, end_date, num_rounds, bank_balance, created_at, updated_at)
    VALUES (session_name, session_start_date, session_end_date, num_rounds, 0, now(), now())
    RETURNING id INTO new_session_id;

    INSERT INTO public.player (user_id, session_id, score, enabled, created_at, updated_at)
    SELECT unnest(array(SELECT unnest(player_user_ids))), new_session_id, 0, TRUE, now(), now();

    INSERT INTO public.rules (session_id, created_at, updated_at, intro, events, gameboard, special_space_events, chaos_space_events)
    SELECT new_session_id, now(), now(), intro, events, gameboard, special_space_events, chaos_space_events FROM public.rules WHERE session_id = previous_session_id;

    IF NOT FOUND THEN
        INSERT INTO public.rules (session_id) VALUES (new_session_id);
    END IF;

    INSERT INTO public.chaos_space_event_template (session_id, name, description, type, details, created_at, updated_at)
    SELECT new_session_id, name, description, type, details, now(), now()
    FROM public.chaos_space_event_template
    WHERE session_id = previous_session_id;

    INSERT INTO public.special_space_event_template (session_id, name, description, type, details, created_at, updated_at)
    SELECT new_session_id, name, description, type, details, now(), now()
    FROM public.special_space_event_template
    WHERE session_id = previous_session_id;

    INSERT INTO public.gameboard_space (name, color, icon_class, effect, effect_data, created_at, updated_at, session_id)
    SELECT name, color, icon_class, effect, effect_data, now(), now(), new_session_id
    FROM public.gameboard_space
    WHERE session_id = previous_session_id;

    INSERT INTO public.event (round_number, name, description, rules, team_size, scoring_map, image_url, points_label, lower_scores_are_better, format, created_at, updated_at, session_id)
    SELECT round_number, name, description, rules, team_size, scoring_map, image_url, points_label, lower_scores_are_better, format, now(), now(), new_session_id
    FROM public.event
    WHERE session_id = previous_session_id
    ORDER BY round_number, id;

    UPDATE public.game_state
    SET session_id = new_session_id, round_number = 0, session_status = 'not_started', round_phase = 'waiting_for_next_round'
    WHERE id = 1;

    RETURN;
END;$function$;

CREATE OR REPLACE FUNCTION public.set_new_event_round_number()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $function$BEGIN
    NEW.round_number := COALESCE((SELECT MAX(round_number) FROM public.event WHERE session_id = NEW.session_id), 0) + 1;
    RETURN NEW;
END;$function$;
