set check_function_bodies = off;
CREATE OR REPLACE FUNCTION public.sync_user_to_public_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_name text;
BEGIN
  v_name := initcap(substring(NEW.email from 1 for position('@' in NEW.email) - 1));

  INSERT INTO public.user (id, display_name, real_name)
  VALUES (NEW.id, v_name, v_name); RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.update_event_teams(event_team_updates json)
 RETURNS void
 LANGUAGE plpgsql
AS $function$BEGIN
-- Delete event teams that were removed in team editor
DELETE FROM public.event_team
WHERE
  id IN (
    SELECT
      (removed_team_json ->> 'id')::BIGINT AS id
    FROM
      JSON_ARRAY_ELEMENTS(event_team_updates::json -> 'removedTeams') AS removed_team_json
  );

-- Insert new event teams
INSERT INTO
  public.event_team (event_id, seed)
SELECT
  (new_event_team_json ->> 'event_id')::BIGINT AS event_id,
  (new_event_team_json ->> 'seed')::SMALLINT AS seed
FROM
  JSON_ARRAY_ELEMENTS(event_team_updates -> 'newEventTeams') AS new_event_team_json;

WITH
-- Get new teams from json
original_team AS (
  SELECT
  (new_event_team_json ->> 'id')::BIGINT AS old_id,
  (new_event_team_json ->> 'event_id')::BIGINT AS event_id,
  (new_event_team_json ->> 'seed')::BIGINT AS seed
FROM
  JSON_ARRAY_ELEMENTS(event_team_updates -> 'newEventTeams') AS new_event_team_json
),
-- Create a mapping of new teams' json id to the id generated on insert
old_id_to_new_id AS (
SELECT
old_id, id
FROM (
    original_team o
  INNER JOIN public.event_team e
  ON o.event_id = e.event_id AND o.seed = e.seed
)
),
-- Get updated participants from json
updated_participant AS (
SELECT
  (updated_participant_json ->> 'id')::BIGINT AS id,
  (updated_participant_json ->> 'team_id')::BIGINT AS team_id
FROM
  JSON_ARRAY_ELEMENTS(event_team_updates -> 'updatedParticipants') AS updated_participant_json
)
-- Update existing participants with their new team id
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
-- Get new teams from json
original_team AS (
  SELECT
  (new_event_team_json ->> 'id')::BIGINT AS old_id,
  (new_event_team_json ->> 'event_id')::BIGINT AS event_id,
  (new_event_team_json ->> 'seed')::BIGINT AS seed
FROM
  JSON_ARRAY_ELEMENTS(event_team_updates -> 'newEventTeams') AS new_event_team_json
),
-- Create a mapping of new teams' json id to the id generated on insert
old_id_to_new_id AS (
SELECT
old_id, id
FROM (
    original_team o
  INNER JOIN public.event_team e
  ON o.event_id = e.event_id AND o.seed = e.seed
)
),
-- Get new participants from json
new_participant AS (
SELECT
  (new_participant_json ->> 'player_id')::BIGINT AS player_id,
  (new_participant_json ->> 'team_id')::BIGINT AS team_id
FROM
  JSON_ARRAY_ELEMENTS(event_team_updates -> 'newParticipants') AS new_participant_json
)

-- Insert new participants
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
-- Delete event participants that were removed in team editor
DELETE FROM public.event_participant
WHERE
  id IN (
    SELECT
      (removed_participant_json ->> 'id')::BIGINT AS id
    FROM
      JSON_ARRAY_ELEMENTS(event_team_updates::json -> 'removedParticipants') AS removed_participant_json
  );

-- Update event team seeds
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
END;$function$;
