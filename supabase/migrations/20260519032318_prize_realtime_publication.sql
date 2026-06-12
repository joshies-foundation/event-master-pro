-- Add prize table to realtime publication so realtimeUpdatesFromTable() picks up changes.
-- REPLICA IDENTITY FULL ensures UPDATE events include the full row (needed so the
-- client receives the won_by_player_id transition on prize award).
alter publication supabase_realtime add table "public"."prize";
alter table "public"."prize" replica identity full;
