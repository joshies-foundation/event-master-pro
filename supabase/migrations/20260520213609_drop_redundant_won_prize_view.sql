-- Drops the redundant won_prize_with_session_info view; user_prize covers this.
drop view if exists "public"."won_prize_with_session_info";
