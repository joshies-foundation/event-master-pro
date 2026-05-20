-- View of won prizes joined to their winning user and source session.
-- Used by the analytics "Past Prizes" page to list a user's prizes across
-- past sessions. Mirrors the style of lifetime_user_stats.

create or replace view "public"."user_prize" as
  select
    pr.id,
    pr.session_id,
    pr.image_url,
    pr.won_at,
    pr.won_by_player_id,
    pr.created_at,
    pr.updated_at,
    p.user_id,
    s.name as session_name,
    s.end_date as session_end_date
  from prize pr
    join player p on pr.won_by_player_id = p.id
    join session s on pr.session_id = s.id
  where pr.won_by_player_id is not null;
