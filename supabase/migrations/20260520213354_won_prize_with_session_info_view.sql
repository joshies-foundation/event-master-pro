-- Flat view of every won prize joined to its owner's user_id and session info.
-- The frontend filters by owner_user_id and (optionally) excludes the current
-- session, then groups by session in TypeScript.
create or replace view "public"."won_prize_with_session_info" as
  select
    p.id,
    p.session_id,
    p.image_url,
    p.won_at,
    p.won_by_player_id,
    p.created_at,
    p.updated_at,
    pl.user_id as owner_user_id,
    s.name as session_name,
    s.end_date as session_end_date
  from prize p
    join player pl on pl.id = p.won_by_player_id
    join session s on s.id = p.session_id
  where p.won_by_player_id is not null;
