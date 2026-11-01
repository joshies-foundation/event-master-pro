-- These views ran as their owner, which skips RLS, so the publishable key could
-- read them without signing in.
ALTER VIEW "public"."lifetime_user_stats" SET (security_invoker=true);

ALTER VIEW "public"."moves_for_current_round" SET (security_invoker=true);

ALTER VIEW "public"."special_space_events_for_current_round" SET (security_invoker=true);

ALTER VIEW "public"."user_prize" SET (security_invoker=true);

-- Exists only on TEST. No migration creates it and the app doesn't read it.
ALTER VIEW IF EXISTS "public"."event_team_with_player_info" SET (security_invoker=true);
