SET session_replication_role = replica;
--
-- PostgreSQL database dump
--

-- \restrict xQi0y0PQxXjmMWBB6tt7JRrCzDGdVJb8IRDA7wT48CF4a7zB3dNLBUtp6CMc4Kt

-- Dumped from database version 15.19
-- Dumped by pg_dump version 15.19

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

--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '6d1ca286-884f-4cc9-a58d-c6bc558b11e4', 'authenticated', 'authenticated', 'adamp@joshies.app', '$2a$06$lEELaQWe1AiLcmmA0GC7UuvLj4aLaL0yogTFZtaRDOxKIWbGWddZK', '2026-10-24 02:11:05.659366+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2024-02-25 21:41:10.989113+00', '2026-10-24 02:11:05.659366+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '2d605bfd-6468-40cc-a0de-f3732545ce27', 'authenticated', 'authenticated', 'carter@joshies.app', '$2a$06$CH03QSmAO3W36ouLk7VdeebraYL.eApaxPTEwC75AZ1wxHNbL.QWS', '2026-10-24 02:11:05.659366+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2024-05-03 05:52:18.13328+00', '2026-10-24 02:11:05.659366+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'be62a737-ed9f-4e88-8e74-ee8310131818', 'authenticated', 'authenticated', 'colin@joshies.app', '$2a$06$Fi/shvc6zSxbOA12b8PEb.JwX7Yd78oaEDuM/cUnGnHMnvscGne/6', '2026-10-24 02:11:05.659366+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2023-11-02 01:10:53.441209+00', '2026-10-24 02:11:05.659366+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'dca7707c-703e-4d23-ab22-3c1f236f9e86', 'authenticated', 'authenticated', 'dan@joshies.app', '$2a$06$dwflp9RHCNzrbDYCsbheb.sfvZeuhgVY1EDCV5OxF/zHOkhig7Yce', '2026-10-24 02:11:05.659366+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2024-02-25 21:40:44.972638+00', '2026-10-24 02:11:05.659366+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'f3cbb5f3-2938-4857-88b6-c52de3286472', 'authenticated', 'authenticated', 'jason@joshies.app', '$2a$06$Uksd71u45APwaa3UCCxnzea00WmWtSQXuBbQiz9.6V1YasM6NKb0q', '2026-10-24 02:11:05.659366+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2024-02-25 21:40:25.719857+00', '2026-10-24 02:11:05.659366+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '9e69f91e-93cb-44c2-9866-3e0680861e2a', 'authenticated', 'authenticated', 'josh@joshies.app', '$2a$06$oD19LTwAZ8K0S967xqiQcugtn68qPUoI4Nb9hXp7QCqjtnedcgtaa', '2026-10-24 02:11:05.659366+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2023-11-02 01:13:35.980512+00', '2026-10-24 02:11:05.659366+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '0bd99699-02ca-4657-8e5d-72cff694a41d', 'authenticated', 'authenticated', 'leo@joshies.app', '$2a$06$Aj2jUZwLBSk5a63hIxnqZe/vnY8E10U37zWb0HuaK.nzjaG1NZxeK', '2026-10-24 02:11:05.659366+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2024-05-02 04:02:53.870566+00', '2026-10-24 02:11:05.659366+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '5485c993-e83c-4788-9fba-6af888e3e2b8', 'authenticated', 'authenticated', 'leo.steinkerchner@joshies.app', '$2a$06$IKJ8bt5AV512roX7fs2FbuauC6JS3/Fh4B8PYcHCV08dyZnPnMnMS', '2026-10-24 02:11:05.659366+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2025-01-20 14:40:16.200026+00', '2026-10-24 02:11:05.659366+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '500ae3b3-0d0b-4ba5-98af-beda4e270057', 'authenticated', 'authenticated', 'tim@joshies.app', '$2a$06$hn/SEa6m4kq04JCIn3beCeCT0n6LnhBNlh9cl19hmGr5yvmoiss.S', '2026-10-24 02:11:05.659366+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2024-02-25 21:41:24.188381+00', '2026-10-24 02:11:05.659366+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '47ecd74d-58a0-4965-a92e-098ced431a0e', 'authenticated', 'authenticated', 'tyler@joshies.app', '$2a$06$0BOeqqKZBmCbHX4HptCK6ub3akwVFyWHCBaj7eFRvid1naJwkToLq', '2026-10-24 02:11:05.659366+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2024-01-28 22:38:58.204353+00', '2026-10-24 02:11:05.659366+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '2b084ccc-0563-436c-967e-fd268f2dcdad', 'authenticated', 'authenticated', 'will@joshies.app', '$2a$06$E6LPjMwmcjhbD01btOALTuqnNNxcEpSB.sVNlj4yOcXs3wUW/HF0u', '2026-10-24 02:11:05.659366+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2024-05-02 04:02:11.054017+00', '2026-10-24 02:11:05.659366+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('6d1ca286-884f-4cc9-a58d-c6bc558b11e4', '6d1ca286-884f-4cc9-a58d-c6bc558b11e4', '{"sub": "6d1ca286-884f-4cc9-a58d-c6bc558b11e4", "email": "adamp@joshies.app", "email_verified": true}', 'email', '2026-10-24 02:11:05.659366+00', '2026-10-24 02:11:05.659366+00', '2026-10-24 02:11:05.659366+00', 'c74eeeff-46dd-4075-ac72-9b0e4bf32bcf'),
	('2d605bfd-6468-40cc-a0de-f3732545ce27', '2d605bfd-6468-40cc-a0de-f3732545ce27', '{"sub": "2d605bfd-6468-40cc-a0de-f3732545ce27", "email": "carter@joshies.app", "email_verified": true}', 'email', '2026-10-24 02:11:05.659366+00', '2026-10-24 02:11:05.659366+00', '2026-10-24 02:11:05.659366+00', 'b5008d30-4cff-41aa-8f89-b569c9984d8e'),
	('be62a737-ed9f-4e88-8e74-ee8310131818', 'be62a737-ed9f-4e88-8e74-ee8310131818', '{"sub": "be62a737-ed9f-4e88-8e74-ee8310131818", "email": "colin@joshies.app", "email_verified": true}', 'email', '2026-10-24 02:11:05.659366+00', '2026-10-24 02:11:05.659366+00', '2026-10-24 02:11:05.659366+00', '9687f0d0-fbb7-4b69-9a0d-186ffc55aef4'),
	('dca7707c-703e-4d23-ab22-3c1f236f9e86', 'dca7707c-703e-4d23-ab22-3c1f236f9e86', '{"sub": "dca7707c-703e-4d23-ab22-3c1f236f9e86", "email": "dan@joshies.app", "email_verified": true}', 'email', '2026-10-24 02:11:05.659366+00', '2026-10-24 02:11:05.659366+00', '2026-10-24 02:11:05.659366+00', '7994cd47-766e-4d40-a009-2c1ee04e07eb'),
	('f3cbb5f3-2938-4857-88b6-c52de3286472', 'f3cbb5f3-2938-4857-88b6-c52de3286472', '{"sub": "f3cbb5f3-2938-4857-88b6-c52de3286472", "email": "jason@joshies.app", "email_verified": true}', 'email', '2026-10-24 02:11:05.659366+00', '2026-10-24 02:11:05.659366+00', '2026-10-24 02:11:05.659366+00', 'e80c26b7-d606-465f-80b5-0602f06b022a'),
	('9e69f91e-93cb-44c2-9866-3e0680861e2a', '9e69f91e-93cb-44c2-9866-3e0680861e2a', '{"sub": "9e69f91e-93cb-44c2-9866-3e0680861e2a", "email": "josh@joshies.app", "email_verified": true}', 'email', '2026-10-24 02:11:05.659366+00', '2026-10-24 02:11:05.659366+00', '2026-10-24 02:11:05.659366+00', '9e0fd88f-35fe-4706-a4cb-c2753c3393c0'),
	('0bd99699-02ca-4657-8e5d-72cff694a41d', '0bd99699-02ca-4657-8e5d-72cff694a41d', '{"sub": "0bd99699-02ca-4657-8e5d-72cff694a41d", "email": "leo@joshies.app", "email_verified": true}', 'email', '2026-10-24 02:11:05.659366+00', '2026-10-24 02:11:05.659366+00', '2026-10-24 02:11:05.659366+00', '6055c5bd-17a8-415a-8931-324a222089b2'),
	('5485c993-e83c-4788-9fba-6af888e3e2b8', '5485c993-e83c-4788-9fba-6af888e3e2b8', '{"sub": "5485c993-e83c-4788-9fba-6af888e3e2b8", "email": "leo.steinkerchner@joshies.app", "email_verified": true}', 'email', '2026-10-24 02:11:05.659366+00', '2026-10-24 02:11:05.659366+00', '2026-10-24 02:11:05.659366+00', 'b17fd673-4f83-4e4a-b484-12e540e3d723'),
	('500ae3b3-0d0b-4ba5-98af-beda4e270057', '500ae3b3-0d0b-4ba5-98af-beda4e270057', '{"sub": "500ae3b3-0d0b-4ba5-98af-beda4e270057", "email": "tim@joshies.app", "email_verified": true}', 'email', '2026-10-24 02:11:05.659366+00', '2026-10-24 02:11:05.659366+00', '2026-10-24 02:11:05.659366+00', '8f2e0e36-7772-4dfb-bcf1-c829b1c2714d'),
	('47ecd74d-58a0-4965-a92e-098ced431a0e', '47ecd74d-58a0-4965-a92e-098ced431a0e', '{"sub": "47ecd74d-58a0-4965-a92e-098ced431a0e", "email": "tyler@joshies.app", "email_verified": true}', 'email', '2026-10-24 02:11:05.659366+00', '2026-10-24 02:11:05.659366+00', '2026-10-24 02:11:05.659366+00', '0cf6d245-7bf8-4992-8934-010b90775e55'),
	('2b084ccc-0563-436c-967e-fd268f2dcdad', '2b084ccc-0563-436c-967e-fd268f2dcdad', '{"sub": "2b084ccc-0563-436c-967e-fd268f2dcdad", "email": "will@joshies.app", "email_verified": true}', 'email', '2026-10-24 02:11:05.659366+00', '2026-10-24 02:11:05.659366+00', '2026-10-24 02:11:05.659366+00', 'e9f16d17-73ec-4220-87bf-587c4b426352');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_recovery_code_sets; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_recovery_codes; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: scim_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: scim_users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."session" ("id", "name", "start_date", "end_date", "num_rounds", "created_at", "updated_at", "bank_balance", "prize_token_on_event_win") VALUES
	(3, 'Fun Party!!! 😋🚽💦', '2024-02-25 17:49:09', '2024-02-25 21:49:09.943', 0, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00', 0, true),
	(32, 'Test Create', '2024-05-01 02:05:00.067', '2024-05-05 18:00:24.067', 10, '2024-05-03 06:04:00.353772+00', '2024-05-03 06:04:00.353772+00', 0, true),
	(33, 'Test Create 2', '2024-05-03 02:07:00', '2024-05-06 02:05:30.035', 10, '2024-05-03 06:05:48.266577+00', '2024-05-03 06:06:39.032296+00', 0, true),
	(1, 'Test Session', '2024-02-06 00:00:00', '2028-10-06 00:00:00', 0, '2024-04-30 21:46:21.453976+00', '2024-05-04 02:25:46.070122+00', 0, true),
	(19, 'TEST DB', '2024-07-09 00:44:00', '2024-07-15 00:00:00', 10, '2024-04-30 21:46:21.453976+00', '2024-07-10 20:51:50.413344+00', 565, true),
	(34, 'Family Olympiad', '2024-08-03 16:00:00.961', '2024-08-06 00:00:00', 10, '2024-08-03 20:24:55.594252+00', '2024-08-03 20:24:55.594252+00', 0, true),
	(36, 'LZS', '2025-01-25 21:49:00.709', '2025-01-28 00:00:00', 10, '2025-01-26 02:54:07.727123+00', '2025-01-26 02:54:07.727123+00', 0, true),
	(37, 'Poop', '2026-02-19 11:06:00.713', '2026-02-22 11:06:56.713', 10, '2026-02-19 16:07:17.743372+00', '2026-02-19 16:07:17.743372+00', 0, true),
	(35, '(TEST) 🍑 The Buddies', '2024-08-05 22:06:00.109', '2024-08-08 00:00:00', 5, '2024-08-06 02:11:41.834458+00', '2026-05-19 03:12:53.855752+00', 2, true),
	(38, 'Test Jaybies', '2026-06-09 18:57:00', '2026-06-10 00:00:00', 3, '2026-06-09 22:59:18.051947+00', '2026-06-09 23:30:54.342407+00', 0, true);


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user" ("display_name", "id", "avatar_url", "can_edit_profile", "created_at", "updated_at", "can_place_bets", "squidward_mode", "can_toggle_squidward_mode", "real_name") VALUES
	('Olivia', '2b084ccc-0563-436c-967e-fd268f2dcdad', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', true, '2024-05-02 04:02:11.053675+00', '2025-01-24 15:47:38.977098+00', true, false, true, 'Olivia'),
	('Molly', '2d605bfd-6468-40cc-a0de-f3732545ce27', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', true, '2024-05-03 05:52:18.13222+00', '2025-01-24 15:47:40.827078+00', true, false, true, 'Molly'),
	('Brittany', 'f3cbb5f3-2938-4857-88b6-c52de3286472', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', true, '2024-04-30 21:46:21.453976+00', '2025-05-03 14:41:24.794725+00', true, false, true, 'Brittany'),
	('Ellie', '47ecd74d-58a0-4965-a92e-098ced431a0e', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', true, '2024-04-30 21:46:21.453976+00', '2025-05-03 14:41:25.721984+00', true, false, true, 'Ellie'),
	('Dan', 'dca7707c-703e-4d23-ab22-3c1f236f9e86', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', true, '2024-04-30 21:46:21.453976+00', '2025-05-03 14:41:28.017258+00', true, false, true, 'Dan'),
	('Alyssa', '6d1ca286-884f-4cc9-a58d-c6bc558b11e4', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', true, '2024-04-30 21:46:21.453976+00', '2025-05-03 14:41:28.555804+00', true, false, true, 'Alyssa'),
	('Tim', '500ae3b3-0d0b-4ba5-98af-beda4e270057', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', true, '2024-04-30 21:46:21.453976+00', '2025-05-03 14:41:29.687556+00', true, false, true, 'Tim'),
	('Leo', '0bd99699-02ca-4657-8e5d-72cff694a41d', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', true, '2024-05-02 04:02:53.870225+00', '2026-10-13 21:13:29.846187+00', true, false, true, 'Leo'),
	('Josh', '9e69f91e-93cb-44c2-9866-3e0680861e2a', 'https://jdwvtjrhfsciqttiueud.supabase.co/storage/v1/object/public/avatars/9e69f91e-93cb-44c2-9866-3e0680861e2a/1751830530574.webp', true, '2024-04-30 21:46:21.453976+00', '2025-07-06 19:35:36.821478+00', true, false, true, 'Josh'),
	('Leo', '5485c993-e83c-4788-9fba-6af888e3e2b8', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', true, '2025-01-20 14:40:16.199673+00', '2026-10-13 21:13:36.189157+00', true, false, false, 'Leo'),
	('Colin', 'be62a737-ed9f-4e88-8e74-ee8310131818', 'https://jdwvtjrhfsciqttiueud.supabase.co/storage/v1/object/public/avatars/be62a737-ed9f-4e88-8e74-ee8310131818/1741228416566.webp', true, '2024-04-30 21:46:21.453976+00', '2026-10-24 01:32:53.564263+00', true, false, true, 'Colin');


--
-- Data for Name: player; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."player" ("id", "user_id", "session_id", "score", "enabled", "created_at", "updated_at", "prize_tokens") VALUES
	(49, 'dca7707c-703e-4d23-ab22-3c1f236f9e86', 19, 264, true, '2024-04-30 21:46:21.453976+00', '2024-07-12 22:10:45.077935+00', 0),
	(53, 'be62a737-ed9f-4e88-8e74-ee8310131818', 19, 242, true, '2024-04-30 21:46:21.453976+00', '2024-07-12 22:10:45.077935+00', 0),
	(5, 'be62a737-ed9f-4e88-8e74-ee8310131818', 3, 2, true, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00', 0),
	(4, '9e69f91e-93cb-44c2-9866-3e0680861e2a', 3, 1, true, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00', 0),
	(6, 'dca7707c-703e-4d23-ab22-3c1f236f9e86', 3, 1, true, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00', 0),
	(3, '47ecd74d-58a0-4965-a92e-098ced431a0e', 1, -1000000, true, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00', 0),
	(1, '9e69f91e-93cb-44c2-9866-3e0680861e2a', 1, 69420, true, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00', 0),
	(52, 'f3cbb5f3-2938-4857-88b6-c52de3286472', 19, 0, false, '2024-04-30 21:46:21.453976+00', '2024-06-24 05:37:05.77532+00', 0),
	(72, '500ae3b3-0d0b-4ba5-98af-beda4e270057', 32, 0, true, '2024-05-03 06:04:00.353772+00', '2024-05-03 06:04:00.353772+00', 0),
	(73, '2b084ccc-0563-436c-967e-fd268f2dcdad', 32, 0, true, '2024-05-03 06:04:00.353772+00', '2024-05-03 06:04:00.353772+00', 0),
	(75, 'dca7707c-703e-4d23-ab22-3c1f236f9e86', 33, 9, true, '2024-05-03 06:05:48.266577+00', '2024-05-03 06:08:01.758304+00', 0),
	(74, '0bd99699-02ca-4657-8e5d-72cff694a41d', 33, 69, true, '2024-05-03 06:05:48.266577+00', '2024-05-03 06:09:19.798207+00', 0),
	(7, '500ae3b3-0d0b-4ba5-98af-beda4e270057', 3, 0, true, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00', 0),
	(48, '9e69f91e-93cb-44c2-9866-3e0680861e2a', 19, 237, true, '2024-04-30 21:46:21.453976+00', '2024-07-12 22:01:47.982381+00', 0),
	(50, '500ae3b3-0d0b-4ba5-98af-beda4e270057', 19, 88, true, '2024-04-30 21:46:21.453976+00', '2024-07-12 22:01:47.982381+00', 0),
	(54, '47ecd74d-58a0-4965-a92e-098ced431a0e', 19, 152, true, '2024-04-30 21:46:21.453976+00', '2024-07-12 22:01:47.982381+00', 0),
	(76, '0bd99699-02ca-4657-8e5d-72cff694a41d', 19, 10, true, '2024-07-09 04:20:49.309512+00', '2024-07-12 22:01:47.982381+00', 0),
	(51, '6d1ca286-884f-4cc9-a58d-c6bc558b11e4', 19, 424, true, '2024-04-30 21:46:21.453976+00', '2024-07-12 22:02:21.444698+00', 0),
	(77, '0bd99699-02ca-4657-8e5d-72cff694a41d', 34, 0, true, '2024-08-03 20:24:55.594252+00', '2024-08-03 20:24:55.594252+00', 0),
	(78, '2b084ccc-0563-436c-967e-fd268f2dcdad', 34, 0, true, '2024-08-03 20:24:55.594252+00', '2024-08-03 20:24:55.594252+00', 0),
	(79, '2d605bfd-6468-40cc-a0de-f3732545ce27', 34, 0, true, '2024-08-03 20:24:55.594252+00', '2024-08-03 20:24:55.594252+00', 0),
	(80, '47ecd74d-58a0-4965-a92e-098ced431a0e', 34, 0, true, '2024-08-03 20:24:55.594252+00', '2024-08-03 20:24:55.594252+00', 0),
	(81, 'be62a737-ed9f-4e88-8e74-ee8310131818', 34, 0, true, '2024-08-03 20:24:55.594252+00', '2024-08-03 20:24:55.594252+00', 0),
	(82, 'f3cbb5f3-2938-4857-88b6-c52de3286472', 34, 0, true, '2024-08-03 20:24:55.594252+00', '2024-08-03 20:24:55.594252+00', 0),
	(83, '9e69f91e-93cb-44c2-9866-3e0680861e2a', 34, 0, true, '2024-08-03 20:24:55.594252+00', '2024-08-03 20:24:55.594252+00', 0),
	(84, 'dca7707c-703e-4d23-ab22-3c1f236f9e86', 34, 0, true, '2024-08-03 20:24:55.594252+00', '2024-08-03 20:24:55.594252+00', 0),
	(85, '500ae3b3-0d0b-4ba5-98af-beda4e270057', 34, 0, true, '2024-08-03 20:24:55.594252+00', '2024-08-03 20:24:55.594252+00', 0),
	(86, '6d1ca286-884f-4cc9-a58d-c6bc558b11e4', 34, 0, true, '2024-08-03 20:24:55.594252+00', '2024-08-03 20:24:55.594252+00', 0),
	(97, '0bd99699-02ca-4657-8e5d-72cff694a41d', 36, 0, true, '2025-01-26 02:54:07.727123+00', '2025-01-26 02:54:07.727123+00', 0),
	(98, '2b084ccc-0563-436c-967e-fd268f2dcdad', 36, 0, true, '2025-01-26 02:54:07.727123+00', '2025-01-26 02:54:07.727123+00', 0),
	(99, '0bd99699-02ca-4657-8e5d-72cff694a41d', 37, 0, true, '2026-02-19 16:07:17.743372+00', '2026-02-19 16:07:17.743372+00', 0),
	(100, '2b084ccc-0563-436c-967e-fd268f2dcdad', 37, 0, true, '2026-02-19 16:07:17.743372+00', '2026-02-19 16:07:17.743372+00', 0),
	(101, '2d605bfd-6468-40cc-a0de-f3732545ce27', 37, 0, true, '2026-02-19 16:07:17.743372+00', '2026-02-19 16:07:17.743372+00', 0),
	(102, '5485c993-e83c-4788-9fba-6af888e3e2b8', 37, 0, true, '2026-02-19 16:07:17.743372+00', '2026-02-19 16:07:17.743372+00', 0),
	(103, 'f3cbb5f3-2938-4857-88b6-c52de3286472', 37, 0, true, '2026-02-19 16:07:17.743372+00', '2026-02-19 16:07:17.743372+00', 0),
	(104, '47ecd74d-58a0-4965-a92e-098ced431a0e', 37, 0, true, '2026-02-19 16:07:17.743372+00', '2026-02-19 16:07:17.743372+00', 0),
	(105, 'dca7707c-703e-4d23-ab22-3c1f236f9e86', 37, 0, true, '2026-02-19 16:07:17.743372+00', '2026-02-19 16:07:17.743372+00', 0),
	(106, '6d1ca286-884f-4cc9-a58d-c6bc558b11e4', 37, 0, true, '2026-02-19 16:07:17.743372+00', '2026-02-19 16:07:17.743372+00', 0),
	(107, '500ae3b3-0d0b-4ba5-98af-beda4e270057', 37, 0, true, '2026-02-19 16:07:17.743372+00', '2026-02-19 16:07:17.743372+00', 0),
	(108, '9e69f91e-93cb-44c2-9866-3e0680861e2a', 37, 0, true, '2026-02-19 16:07:17.743372+00', '2026-02-19 16:07:17.743372+00', 0),
	(94, '0bd99699-02ca-4657-8e5d-72cff694a41d', 35, 295, true, '2024-08-06 02:11:41.834458+00', '2026-05-17 19:33:06.854279+00', 0),
	(90, 'f3cbb5f3-2938-4857-88b6-c52de3286472', 35, 180, true, '2024-08-06 02:11:41.834458+00', '2026-05-17 19:37:57.282354+00', 0),
	(89, '47ecd74d-58a0-4965-a92e-098ced431a0e', 35, 143, true, '2024-08-06 02:11:41.834458+00', '2026-05-17 19:57:19.675446+00', 0),
	(2, 'be62a737-ed9f-4e88-8e74-ee8310131818', 1, 42069, true, '2024-04-30 21:46:21.453976+00', '2026-05-19 03:43:37.745711+00', 0),
	(109, '0bd99699-02ca-4657-8e5d-72cff694a41d', 38, 70, true, '2026-06-09 22:59:18.051947+00', '2026-06-11 12:37:09.008528+00', 1),
	(92, '500ae3b3-0d0b-4ba5-98af-beda4e270057', 35, 117, true, '2024-08-06 02:11:41.834458+00', '2026-04-26 23:37:40.105404+00', 0),
	(96, 'be62a737-ed9f-4e88-8e74-ee8310131818', 35, 185, true, '2024-08-06 02:11:41.834458+00', '2026-05-20 02:14:33.703714+00', 0),
	(95, '9e69f91e-93cb-44c2-9866-3e0680861e2a', 35, 250, true, '2024-08-06 02:11:41.834458+00', '2026-05-12 22:55:05.022139+00', 0),
	(87, '2b084ccc-0563-436c-967e-fd268f2dcdad', 35, 124, true, '2024-08-06 02:11:41.834458+00', '2026-05-12 22:55:05.022139+00', 0),
	(91, 'dca7707c-703e-4d23-ab22-3c1f236f9e86', 35, 179, true, '2024-08-06 02:11:41.834458+00', '2026-05-12 22:55:05.022139+00', 0),
	(93, '6d1ca286-884f-4cc9-a58d-c6bc558b11e4', 35, 157, true, '2024-08-06 02:11:41.834458+00', '2026-05-12 22:55:05.022139+00', 0),
	(88, '2d605bfd-6468-40cc-a0de-f3732545ce27', 35, 164, true, '2024-08-06 02:11:41.834458+00', '2026-05-12 22:55:05.022139+00', 0),
	(110, '2b084ccc-0563-436c-967e-fd268f2dcdad', 38, 51, true, '2026-06-09 22:59:18.051947+00', '2026-06-09 23:41:03.307563+00', 1),
	(111, '2d605bfd-6468-40cc-a0de-f3732545ce27', 38, 40, true, '2026-06-09 22:59:18.051947+00', '2026-06-09 23:41:03.307563+00', 1),
	(115, 'dca7707c-703e-4d23-ab22-3c1f236f9e86', 38, 20, true, '2026-06-09 22:59:18.051947+00', '2026-06-09 23:41:03.307563+00', 1),
	(118, '9e69f91e-93cb-44c2-9866-3e0680861e2a', 38, 40, true, '2026-06-09 22:59:18.051947+00', '2026-06-09 23:41:03.307563+00', 1),
	(119, 'be62a737-ed9f-4e88-8e74-ee8310131818', 38, 33, true, '2026-06-09 22:59:18.051947+00', '2026-06-09 23:41:03.307563+00', 1),
	(112, '5485c993-e83c-4788-9fba-6af888e3e2b8', 38, -10, true, '2026-06-09 22:59:18.051947+00', '2026-06-09 23:41:03.307563+00', 0),
	(113, 'f3cbb5f3-2938-4857-88b6-c52de3286472', 38, 10, true, '2026-06-09 22:59:18.051947+00', '2026-06-09 23:41:03.307563+00', 0),
	(114, '47ecd74d-58a0-4965-a92e-098ced431a0e', 38, 10, true, '2026-06-09 22:59:18.051947+00', '2026-06-09 23:41:03.307563+00', 0),
	(116, '6d1ca286-884f-4cc9-a58d-c6bc558b11e4', 38, 10, true, '2026-06-09 22:59:18.051947+00', '2026-06-09 23:41:03.307563+00', 0),
	(117, '500ae3b3-0d0b-4ba5-98af-beda4e270057', 38, -10, true, '2026-06-09 22:59:18.051947+00', '2026-06-09 23:41:03.307563+00', 0);


--
-- Data for Name: bet; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."bet" ("id", "session_id", "requester_player_id", "opponent_player_id", "requester_wager", "opponent_wager", "description", "status", "created_at", "updated_at", "bet_type", "details") VALUES
	(35, 19, 54, 53, 1, 1, 'i will win', 'opponent_won', '2024-06-13 13:17:53.563387+00', '2024-06-22 04:26:35.699358+00', NULL, NULL),
	(18, 19, 53, 54, 6, 5, 'Bets', 'rejected', '2024-06-11 01:40:48.517475+00', '2024-06-11 01:41:48.093397+00', NULL, NULL),
	(58, 19, 50, 53, 10, 10, 'Over 2 in Tyler''s Poop Scoop Event', 'opponent_won', '2024-06-17 22:10:52.259069+00', '2024-06-24 04:20:58.482029+00', 'special_space_event', '{"ouValue": 2, "ssEventId": 4, "directionIsOver": true}'),
	(16, 19, 53, 48, 1, 176, 'sdf', 'rejected', '2024-06-07 16:03:24.750383+00', '2024-06-11 20:22:37.177016+00', NULL, NULL),
	(15, 19, 53, 48, 1, 1, 'asd', 'rejected', '2024-06-07 16:02:22.459576+00', '2024-06-11 20:22:53.124697+00', NULL, NULL),
	(33, 19, 53, 54, 9, 10, 'lzs5', 'canceled_by_gm', '2024-06-13 13:07:33.153952+00', '2024-06-13 13:08:58.696086+00', NULL, NULL),
	(25, 19, 54, 53, 1, 1, 'lzs', 'rejected', '2024-06-12 01:08:05.82408+00', '2024-06-12 01:08:17.66396+00', NULL, NULL),
	(29, 19, 53, 54, 1, 2, 'lzs1', 'push', '2024-06-13 13:06:35.103223+00', '2024-06-13 13:09:16.898563+00', NULL, NULL),
	(21, 19, 53, 54, 10, 10, 'poop', 'rejected', '2024-06-11 23:43:18.2117+00', '2024-06-12 01:20:04.384219+00', NULL, NULL),
	(30, 19, 53, 54, 3, 4, 'lzs2', 'opponent_won', '2024-06-13 13:06:47.314441+00', '2024-06-13 13:09:27.578384+00', NULL, NULL),
	(27, 19, 53, 54, 1, 1, 'Created First', 'rejected', '2024-06-12 02:52:03.780645+00', '2024-06-12 02:52:59.648042+00', NULL, NULL),
	(28, 19, 53, 54, 1, 1, 'Created Second', 'rejected', '2024-06-12 02:52:13.761062+00', '2024-06-12 02:53:11.955263+00', NULL, NULL),
	(34, 19, 53, 54, 1, 1, 'lzs6', 'canceled_by_gm', '2024-06-13 13:08:26.25624+00', '2024-06-22 18:16:40.172014+00', NULL, NULL),
	(2, 19, 53, 48, 10, 10, 'bet desc', 'canceled_by_gm', '2024-06-06 20:21:54.893965+00', '2024-06-12 18:54:36.363709+00', NULL, NULL),
	(4, 19, 53, 51, 3, 9, 'Leo will be super awesome!', 'canceled_by_gm', '2024-06-06 20:34:28.403478+00', '2024-06-12 18:58:44.94707+00', NULL, NULL),
	(20, 19, 54, 48, 1, 1, 'lzs', 'canceled_by_gm', '2024-06-11 20:19:27.738969+00', '2024-06-12 19:17:33.612273+00', NULL, NULL),
	(5, 19, 53, 49, 1, 6, 'alpha', 'requester_won', '2024-06-06 20:36:02.803495+00', '2024-06-12 19:18:57.338589+00', NULL, NULL),
	(10, 19, 49, 53, 4, 3, 'pls cancel this j', 'opponent_won', '2024-06-07 15:35:13.740375+00', '2024-07-10 20:55:34.155003+00', 'duel', '{"duelId": 10, "challengerWins": true}'),
	(8, 19, 53, 50, 69, 420, 'My sex number is better than your weed number', 'canceled_by_gm', '2024-06-06 22:18:47.707511+00', '2024-06-12 19:42:44.264963+00', NULL, NULL),
	(26, 19, 54, 53, 3, 3, 'asdf', 'canceled_by_gm', '2024-06-12 02:50:59.049617+00', '2024-06-12 19:42:53.553433+00', NULL, NULL),
	(19, 19, 53, 54, 20, 20, 'tits', 'canceled_by_gm', '2024-06-11 17:19:17.572917+00', '2024-06-12 19:43:02.408609+00', NULL, NULL),
	(9, 19, 48, 54, 4, 7, 'New  form', 'canceled_by_gm', '2024-06-07 04:10:44.00788+00', '2024-06-12 19:49:33.746063+00', NULL, NULL),
	(6, 19, 53, 51, 123456, 123456, 'dafs', 'canceled_by_gm', '2024-06-06 20:38:45.199341+00', '2024-06-13 03:09:14.411461+00', NULL, NULL),
	(31, 19, 53, 54, 5, 6, 'lzs3', 'requester_won', '2024-06-13 13:07:03.137397+00', '2024-06-13 13:09:43.402436+00', NULL, NULL),
	(32, 19, 53, 54, 7, 8, 'lzs4', 'canceled_by_gm', '2024-06-13 13:07:16.016839+00', '2024-06-13 13:09:55.877112+00', NULL, NULL),
	(3, 19, 53, 54, 4, 4, 'jiklojio', 'push', '2024-06-06 20:33:57.66561+00', '2024-06-24 04:20:35.351312+00', NULL, NULL),
	(37, 19, 53, 54, 1, 1, 'lzs', 'rejected', '2024-06-13 18:01:46.441871+00', '2024-06-13 18:15:33.695952+00', NULL, NULL),
	(36, 19, 54, 53, 2, 1, 'bfs', 'rejected', '2024-06-13 13:18:03.450115+00', '2024-06-13 18:15:36.802972+00', NULL, NULL),
	(7, 19, 53, 48, 10, 10, 'My cock will win the wiener competition ', 'opponent_won', '2024-06-06 22:09:06.404383+00', '2024-06-16 20:41:19.471274+00', NULL, NULL),
	(52, 19, 53, 54, 1, 1, 'Over 0.5 in undefined''s undefined Event', 'rejected', '2024-06-17 18:29:04.169249+00', '2024-06-17 22:07:37.986278+00', 'special_space_event', '{"ouValue": 0.5, "directionIsOver": true}'),
	(60, 19, 53, 54, 1, 1, 'lzs', 'canceled_by_gm', '2024-06-18 20:08:57.647205+00', '2024-06-22 18:16:58.410295+00', NULL, '{}'),
	(51, 19, 53, 50, 1, 1, 'Josh beats Buddy in Cookie Face', 'opponent_won', '2024-06-16 18:22:17.618492+00', '2024-06-16 18:40:59.021485+00', 'duel', '{"duelId": 4, "challengerWins": false}'),
	(38, 19, 53, 51, 7, 1, 'i can fuck more women than you ', 'requester_won', '2024-06-14 03:43:03.642475+00', '2024-06-16 20:13:22.907517+00', NULL, NULL),
	(56, 19, 54, 48, 2, 2, 'Over 1 in Tyler''s Poop Scoop Event', 'canceled_by_gm', '2024-06-17 22:06:43.986188+00', '2024-06-22 17:57:44.790571+00', 'special_space_event', '{"ouValue": 1, "ssEventId": 4, "directionIsOver": true}'),
	(53, 19, 53, 54, 1, 1, 'Under 1.5 in Tyler''s Poop Scoop Event', 'requester_won', '2024-06-17 18:33:03.405247+00', '2024-06-17 22:09:56.05858+00', 'special_space_event', '{"ouValue": 1.5, "ssEventId": 4, "directionIsOver": false}'),
	(57, 19, 53, 54, 1, 1, 'Under 2 in Tyler''s Poop Scoop Event', 'requester_won', '2024-06-17 22:07:14.646158+00', '2024-06-17 22:09:56.05858+00', 'special_space_event', '{"ouValue": 2, "ssEventId": 4, "directionIsOver": false}'),
	(54, 19, 54, 50, 1, 1, 'Over 0.5 in Tyler''s Poop Scoop Event', 'requester_won', '2024-06-17 18:41:20.587283+00', '2024-06-17 22:09:56.05858+00', 'special_space_event', '{"ouValue": 0.5, "ssEventId": 4, "directionIsOver": true}'),
	(65, 19, 53, 51, 1, 2, 'Timmy beats Josh in Disc Golf Putting', 'canceled_by_gm', '2024-06-19 23:17:23.147276+00', '2024-06-22 18:16:40.172014+00', 'duel', '{"duelId": 10, "challengerWins": true}'),
	(17, 19, 53, 54, 3, 6, '123', 'opponent_won', '2024-06-10 19:38:22.974586+00', '2024-06-17 17:47:10.75519+00', 'special_space_event', '{"ouValue": 5, "ssEventId": 4, "directionIsOver": true}'),
	(62, 19, 48, 53, 987398734, 1, 'Yfyhobucydtxucuvib', 'rejected', '2024-06-19 20:39:47.211325+00', '2024-06-20 06:46:20.298955+00', NULL, NULL),
	(22, 19, 48, 54, 1, 1, 'lzs', 'canceled_by_gm', '2024-06-12 00:48:30.958352+00', '2024-06-22 17:57:44.790571+00', NULL, NULL),
	(63, 19, 48, 53, 2, 20000, 'Yfyhobucydtxucuvib klajsdflk jasdfkljhas dfkljashdfkl jasfkljhas dklfjas dfklj asdklf jaslk dfkajs df', 'rejected', '2024-06-19 20:58:33.219247+00', '2024-06-20 06:46:23.406973+00', NULL, NULL),
	(61, 19, 53, 54, 1, 1, 'Under 0.5 in Tyler''s Poop Scoop Event', 'canceled_by_gm', '2024-06-18 20:09:33.265699+00', '2024-06-22 18:16:40.172014+00', 'special_space_event', '{"ouValue": 0.5, "ssEventId": 4, "directionIsOver": false}'),
	(64, 19, 54, 48, 1, 1, 'Timmy beats Josh in Disc Golf Putting', 'canceled_by_gm', '2024-06-19 22:11:07.120639+00', '2024-06-22 17:52:17.309348+00', 'duel', '{"duelId": 10, "challengerWins": true}'),
	(66, 19, 53, 54, 2, 2, '', 'canceled_by_gm', '2024-06-20 16:43:53.304002+00', '2024-06-22 17:52:24.809052+00', 'chaos_space_event', '{}'),
	(55, 19, 54, 50, 1, 2, 'Over 0.5 in Tyler''s Poop Scoop Event', 'canceled_by_gm', '2024-06-17 22:06:26.585275+00', '2024-06-22 17:57:44.790571+00', 'special_space_event', '{"ouValue": 0.5, "ssEventId": 4, "directionIsOver": true}'),
	(69, 19, 53, 54, 1, 1, '', 'canceled_by_gm', '2024-06-21 20:00:47.289527+00', '2024-06-22 18:16:40.172014+00', 'chaos_space_event', '{}'),
	(85, 19, 48, 53, 3, 3, 'adegse', 'canceled_by_requester', '2024-07-05 23:09:30.853322+00', '2024-07-05 23:12:22.302723+00', NULL, '{}'),
	(39, 19, 54, 53, 10, 30, 'The sky is blue', 'canceled_by_gm', '2024-06-15 13:21:32.035816+00', '2024-06-24 04:18:25.73058+00', 'chaos_space_event', '{"isLoser": false, "subtype": "player_loses", "playerId": 50, "chaosEventId": 5}'),
	(86, 19, 48, 53, 1, 1, 'hgvhgv', 'canceled_by_requester', '2024-07-05 23:14:36.462169+00', '2024-07-05 23:19:31.597055+00', NULL, '{}'),
	(71, 19, 53, 48, 7, 7, 'Over 0.5 losers in the Everyone Stands on 1 Foot for 5 Minutes Event jizz', 'opponent_won', '2024-06-21 20:07:28.070293+00', '2024-06-24 04:19:16.739304+00', 'chaos_space_event', '{"ouValue": 0.5, "subtype": "number_of_losers", "chaosEventId": 6, "directionIsOver": true}'),
	(67, 19, 53, 54, 1, 1, 'over 1 loses in event 6', 'push', '2024-06-20 16:46:34.546609+00', '2024-06-21 19:10:00.23864+00', 'chaos_space_event', '{"ouValue": 3, "subtype": "number_of_losers", "chaosEventId": 6, "directionIsOver": false}'),
	(87, 19, 48, 53, 1, 1, 'ihihn', 'canceled_by_requester', '2024-07-05 23:21:14.231866+00', '2024-07-05 23:23:18.609909+00', NULL, '{}'),
	(70, 19, 53, 54, 5, 5, 'Under 2 losers in the Everyone Stands on 1 Foot for 5 Minutes Event', 'opponent_won', '2024-06-21 20:06:47.864994+00', '2024-06-24 04:20:06.086222+00', 'chaos_space_event', '{"ouValue": 2, "subtype": "number_of_losers", "chaosEventId": 6, "directionIsOver": false}'),
	(88, 19, 48, 53, 1, 1, 'khjhb', 'canceled_by_requester', '2024-07-05 23:24:34.098039+00', '2024-07-05 23:26:39.731327+00', NULL, '{}'),
	(75, 19, 53, 54, 1, 1, 'Bugugguhbbb', 'canceled_by_requester', '2024-06-24 18:05:34.559716+00', '2024-06-24 18:38:04.921712+00', NULL, '{}'),
	(89, 19, 48, 53, 1, 1, 'faesfae', 'canceled_by_requester', '2024-07-05 23:28:49.379136+00', '2024-07-05 23:31:00.501532+00', NULL, '{}'),
	(59, 19, 53, 54, 1, 1, 'Timmy beats Josh in Disc Golf Putting', 'canceled_by_gm', '2024-06-18 20:08:49.16973+00', '2024-06-22 18:16:40.172014+00', 'duel', '{"duelId": 10, "challengerWins": true}'),
	(68, 19, 53, 54, 1, 1, 'Tyler Loses in the Everyone Stands on 1 Foot for 5 Minutes Event', 'canceled_by_gm', '2024-06-21 20:00:29.014631+00', '2024-06-22 18:16:40.172014+00', 'chaos_space_event', '{"isLoser": true, "subtype": "player_loses", "playerId": 54, "chaosEventId": 6}'),
	(100, 19, 53, 48, 10, 10, 'Carter eats 13 poops in 2 minutes', 'requester_won', '2024-07-06 18:58:21.968846+00', '2024-07-06 19:00:40.808768+00', NULL, '{}'),
	(95, 19, 53, 48, 2, 1, 'jizz', 'rejected', '2024-07-05 23:53:27.098396+00', '2024-07-05 23:53:48.380077+00', NULL, '{}'),
	(90, 19, 48, 53, 1, 1, 'hgvkhgv', 'canceled_by_requester', '2024-07-05 23:32:28.538745+00', '2024-07-05 23:32:43.798644+00', NULL, '{}'),
	(91, 19, 54, 53, 1, 1, 'gvhgvhgv', 'rejected', '2024-07-05 23:33:36.670587+00', '2024-07-05 23:33:51.74313+00', NULL, '{}'),
	(84, 19, 53, 48, 1, 1, 'ghghgh', 'requester_won', '2024-07-05 04:33:21.335334+00', '2024-07-05 23:34:56.086567+00', NULL, '{}'),
	(83, 19, 53, 48, 1, 1, 'hjhvjh', 'opponent_won', '2024-07-05 04:32:40.514311+00', '2024-07-05 23:35:14.031037+00', NULL, '{}'),
	(82, 19, 48, 53, 3, 3, 'itchy critchy ', 'push', '2024-07-05 04:27:33.817215+00', '2024-07-05 23:35:28.591628+00', NULL, '{}'),
	(81, 19, 48, 53, 2, 2, 'ticky wicky ', 'canceled_by_gm', '2024-07-05 04:27:07.54955+00', '2024-07-05 23:35:39.881304+00', NULL, '{}'),
	(92, 19, 54, 53, 5, 7, 'Over 0.5 in Dan''s Bottle Flip Event', 'rejected', '2024-07-05 23:42:54.142136+00', '2024-07-05 23:46:05.928409+00', 'special_space_event', '{"ouValue": 0.5, "ssEventId": 2, "directionIsOver": true}'),
	(101, 19, 48, 54, 69, 69, 'Dan Loses in the Everyone must poop their pants Event', 'requester_won', '2024-07-06 19:22:37.338451+00', '2024-07-06 19:24:02.884751+00', 'chaos_space_event', '{"isLoser": true, "subtype": "player_loses", "playerId": 49, "chaosEventId": 14}'),
	(93, 19, 54, 53, 2, 3, 'Over 0.5 in Adam P''s Flip Cup Event', 'requester_won', '2024-07-05 23:47:50.794375+00', '2024-07-05 23:48:57.727604+00', 'special_space_event', '{"ouValue": 0.5, "ssEventId": 3, "directionIsOver": true}'),
	(97, 19, 53, 54, 1, 1, 'Vyvyv', 'canceled_by_gm', '2024-07-05 23:55:16.063848+00', '2024-07-05 23:55:36.26512+00', NULL, '{}'),
	(98, 19, 53, 49, 1, 1, 'Ctcyvyvyv', 'canceled_by_gm', '2024-07-05 23:56:02.097159+00', '2024-07-05 23:56:09.753417+00', NULL, '{}'),
	(94, 19, 54, 53, 10, 10, 'Carter eats over 50 wings at the Wing-Off', 'requester_won', '2024-07-05 23:51:28.857323+00', '2024-07-05 23:56:49.657105+00', NULL, '{}'),
	(96, 19, 53, 48, 2, 1, 'jizz', 'opponent_won', '2024-07-05 23:54:13.180918+00', '2024-07-05 23:56:56.626581+00', NULL, '{}'),
	(80, 19, 48, 53, 1, 1, 'test bet for ticker', 'opponent_won', '2024-07-05 04:26:36.958177+00', '2024-07-05 23:57:07.684456+00', NULL, '{}'),
	(73, 19, 48, 53, 69, 69, 'piss', 'push', '2024-06-24 04:25:57.236458+00', '2024-07-05 23:57:15.585052+00', NULL, '{}'),
	(102, 19, 53, 51, 1, 1, 'Team Dan finishes in the Top 2 teams in the Chode Chomp Event', 'opponent_won', '2024-07-06 22:37:21.786288+00', '2024-07-07 01:16:08.097905+00', 'main_event', '{"teamId": 639, "eventId": 3, "subtype": "team_position", "numberOfTeams": 2, "directionIsTop": true}'),
	(78, 19, 53, 49, 1, 1, 'Team  Dan finishes in the Bottom 2 teams in the Chode Chomp Event', 'requester_won', '2024-07-04 01:23:16.002563+00', '2024-07-07 01:16:08.097905+00', 'main_event', '{"teamId": 639, "eventId": 3, "subtype": "team_position", "numberOfTeams": 2, "directionIsTop": false}'),
	(76, 19, 53, 51, 1, 1, '', 'canceled_by_requester', '2024-07-04 01:05:22.808648+00', '2024-07-08 04:51:49.054333+00', 'main_event', '{}'),
	(77, 19, 53, 51, 1, 1, '', 'canceled_by_requester', '2024-07-04 01:12:25.484018+00', '2024-07-08 04:51:51.110646+00', 'main_event', '{}'),
	(79, 19, 53, 51, 1, 1, 'Team  Buddy scores Over 0.5 in the Chode Chomp Event', 'canceled_by_requester', '2024-07-04 01:57:50.589757+00', '2024-07-08 04:51:54.87488+00', 'main_event', '{"teamId": 647, "eventId": 3, "ouValue": 0.5, "subtype": "score", "directionIsOver": true}'),
	(99, 19, 53, 50, 3, 3, 'Tits', 'canceled_by_requester', '2024-07-05 23:56:35.036464+00', '2024-07-08 04:51:57.004192+00', NULL, '{}'),
	(103, 19, 53, 51, 1, 1, 'Team Timmy scores Over 0.5 in the Chode Chomp Event', 'requester_won', '2024-07-07 13:05:25.589178+00', '2024-07-07 13:08:05.444854+00', 'main_event', '{"teamId": 645, "eventId": 3, "ouValue": 0.5, "subtype": "score", "directionIsOver": true}'),
	(74, 19, 53, 54, 1, 1, 'lzs', 'canceled_by_gm', '2024-06-24 18:02:26.823946+00', '2024-07-11 02:45:31.133259+00', NULL, '{}'),
	(72, 19, 53, 54, 1, 1, 'asd', 'canceled_by_gm', '2024-06-22 16:55:03.733492+00', '2024-07-11 02:45:32.924957+00', NULL, '{}'),
	(104, 19, 53, 51, 1, 1, 'Team Timmy scores Over 2 in the Chode Chomp Event', 'push', '2024-07-07 13:06:47.26771+00', '2024-07-07 13:08:05.444854+00', 'main_event', '{"teamId": 645, "eventId": 3, "ouValue": 2, "subtype": "score", "directionIsOver": true}'),
	(106, 19, 53, 51, 1, 1, 'Team Timmy scores Under 3 in the Chode Chomp Event', 'requester_won', '2024-07-07 13:07:15.534348+00', '2024-07-07 13:08:05.444854+00', 'main_event', '{"teamId": 645, "eventId": 3, "ouValue": 3, "subtype": "score", "directionIsOver": false}'),
	(105, 19, 53, 51, 1, 1, 'Team Timmy scores Under 0.5 in the Chode Chomp Event', 'opponent_won', '2024-07-07 13:07:02.5892+00', '2024-07-07 13:08:05.444854+00', 'main_event', '{"teamId": 645, "eventId": 3, "ouValue": 0.5, "subtype": "score", "directionIsOver": false}'),
	(125, 19, 53, 48, 1, 1, 'Didjd', 'canceled_by_gm', '2024-07-11 03:11:14.274761+00', '2024-07-12 02:21:30.649335+00', NULL, '{}'),
	(126, 19, 53, 48, 1, 1, 'Cmckdhs', 'canceled_by_gm', '2024-07-11 03:11:25.308502+00', '2024-07-11 03:11:42.463433+00', NULL, '{}'),
	(109, 19, 53, 51, 1, 1, 'Dan will land on a(n) Bad-Luck Brown space next', 'requester_won', '2024-07-07 14:05:42.346581+00', '2024-07-07 14:11:17.326037+00', 'gameboard_move', '{"playerId": 49, "gameboardSpaceId": 3}'),
	(108, 19, 53, 51, 1, 1, 'Adam P will land on a(n) Blue space next', 'opponent_won', '2024-07-07 14:05:31.21638+00', '2024-07-07 14:11:17.326037+00', 'gameboard_move', '{"playerId": 51, "gameboardSpaceId": 1}'),
	(107, 19, 53, 51, 1, 1, 'Buddy will land on a(n) Bad-Luck Brown space next', 'canceled_by_gm', '2024-07-07 13:40:44.306229+00', '2024-07-07 14:11:17.326037+00', 'gameboard_move', '{"playerId": 53, "gameboardSpaceId": 3}'),
	(116, 19, 53, 48, 2, 2, 'Blah blah', 'canceled_by_gm', '2024-07-11 02:41:34.847408+00', '2024-07-11 02:43:27.776043+00', NULL, '{}'),
	(115, 19, 53, 48, 1, 1, 'Blah', 'canceled_by_gm', '2024-07-11 02:41:23.50547+00', '2024-07-11 02:43:36.741112+00', NULL, '{}'),
	(114, 19, 53, 48, 2, 2, 'This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words ', 'canceled_by_gm', '2024-07-11 02:39:14.235044+00', '2024-07-11 02:43:41.155584+00', NULL, '{}'),
	(110, 19, 48, 53, 8, 12, 'Timmy & Dan finish in the TOP 2 teams in Fart', 'rejected', '2024-07-08 04:07:57.124887+00', '2024-07-08 04:43:23.565691+00', 'main_event', '{"teamId": 651, "eventId": 2, "subtype": "team_position", "numberOfTeams": 2, "directionIsTop": true}'),
	(111, 19, 48, 53, 1, 1, 'Timmy & Dan finish in the BOTTOM 2 teams in Fart', 'rejected', '2024-07-08 04:20:05.870817+00', '2024-07-08 04:43:27.381928+00', 'main_event', '{"teamId": 651, "eventId": 2, "subtype": "team_position", "numberOfTeams": 2, "directionIsTop": false}'),
	(113, 19, 53, 51, 1, 1, ' Dan finishes FIRST in Chode Chomp', 'canceled_by_requester', '2024-07-10 19:40:53.474078+00', '2024-07-10 19:40:58.042104+00', 'main_event', '{"teamId": 639, "eventId": 3, "subtype": "team_position", "numberOfTeams": 1, "directionIsTop": true}'),
	(127, 19, 53, 48, 1, 1, ' Jxjx', 'active', '2024-07-11 03:17:57.29711+00', '2024-07-11 03:18:03.997724+00', NULL, '{}'),
	(118, 19, 53, 48, 1, 2, 'Xhdhsjs', 'canceled_by_gm', '2024-07-11 02:49:07.912148+00', '2024-07-11 02:49:33.692438+00', NULL, '{}'),
	(117, 19, 53, 48, 1, 1, 'Xhxjxk', 'canceled_by_gm', '2024-07-11 02:45:52.733303+00', '2024-07-11 02:49:36.382854+00', NULL, '{}'),
	(139, 19, 53, 48, 1, 1, 'Dhxnxj', 'active', '2024-07-12 02:33:52.74288+00', '2024-07-12 02:34:10.522656+00', NULL, '{}'),
	(122, 19, 53, 48, 2, 2, 'Fuck 4', 'active', '2024-07-11 02:57:21.771665+00', '2024-07-11 02:57:45.431447+00', NULL, '{}'),
	(124, 19, 53, 48, 1, 1, 'Xhxh', 'canceled_by_gm', '2024-07-11 03:05:43.973788+00', '2024-07-11 03:08:40.515217+00', NULL, '{}'),
	(120, 19, 53, 48, 3, 3, 'Fuck 2', 'canceled_by_gm', '2024-07-11 02:56:54.75823+00', '2024-07-11 03:09:30.634085+00', NULL, '{}'),
	(140, 19, 53, 48, 1, 1, 'Hxjxnxxnkx', 'canceled_by_gm', '2024-07-12 02:34:04.322137+00', '2024-07-12 02:34:24.067819+00', NULL, '{}'),
	(123, 19, 53, 48, 3, 3, 'Fuck 5', 'canceled_by_gm', '2024-07-11 02:57:33.461148+00', '2024-07-12 02:21:41.106509+00', NULL, '{}'),
	(119, 19, 53, 48, 2, 2, 'Fuck', 'canceled_by_gm', '2024-07-11 02:56:34.181713+00', '2024-07-12 02:22:03.087821+00', NULL, '{}'),
	(129, 19, 48, 53, 2, 2, 'vsger', 'canceled_by_gm', '2024-07-12 02:14:38.673479+00', '2024-07-12 02:16:59.345778+00', NULL, '{}'),
	(130, 19, 48, 53, 4, 4, 'bfdbfsb', 'canceled_by_gm', '2024-07-12 02:14:52.623667+00', '2024-07-12 02:17:19.714293+00', NULL, '{}'),
	(131, 19, 48, 53, 1, 1, 'i wonder if buddy is getting a bunch of notifications right now', 'canceled_by_gm', '2024-07-12 02:15:15.223074+00', '2024-07-12 02:17:54.962367+00', NULL, '{}'),
	(132, 19, 53, 48, 1, 2, ' Hxnx', 'active', '2024-07-12 02:19:41.778957+00', '2024-07-12 02:20:02.387689+00', NULL, '{}'),
	(138, 19, 48, 53, 1, 1, 'This is kind of like a horribly unoptimized instant messaging if you think about it', 'rejected', '2024-07-12 02:28:22.933892+00', '2024-07-12 04:13:36.225612+00', NULL, '{}'),
	(133, 19, 53, 48, 1, 1, 'Duxjx', 'canceled_by_gm', '2024-07-12 02:19:50.388424+00', '2024-07-12 02:21:00.992766+00', NULL, '{}'),
	(121, 19, 53, 48, 1, 2, 'Fuck 3', 'canceled_by_gm', '2024-07-11 02:57:06.743671+00', '2024-07-12 02:24:13.014194+00', NULL, '{}'),
	(128, 19, 48, 53, 1, 1, 'cscassca', 'canceled_by_gm', '2024-07-12 02:13:19.796082+00', '2024-07-12 02:24:24.928049+00', NULL, '{}'),
	(135, 19, 53, 48, 1, 1, 'Eeyuoojhgfd', 'canceled_by_gm', '2024-07-12 02:23:03.487055+00', '2024-07-12 02:31:00.748199+00', NULL, '{}'),
	(142, 19, 53, 48, 1, 1, 'Duxjj k k ', 'active', '2024-07-12 02:45:13.460817+00', '2024-07-12 02:45:20.858053+00', NULL, '{}'),
	(141, 19, 53, 48, 1, 1, 'Blah blah', 'canceled_by_gm', '2024-07-12 02:44:22.414991+00', '2024-07-12 02:44:48.597957+00', NULL, '{}'),
	(134, 19, 53, 48, 1, 1, 'Xjxjx', 'canceled_by_gm', '2024-07-12 02:22:32.516921+00', '2024-07-12 02:45:29.283614+00', NULL, '{}'),
	(136, 19, 48, 53, 1, 1, 'Leo will piss himself.', 'active', '2024-07-12 02:25:15.945971+00', '2024-07-12 22:00:40.740742+00', NULL, '{}'),
	(137, 19, 48, 53, 1, 1, 'Hi again buddy', 'active', '2024-07-12 02:27:23.895851+00', '2024-07-12 22:00:43.502783+00', NULL, '{}'),
	(143, 19, 53, 48, 1, 400, 'Hi', 'active', '2024-07-12 02:50:47.072005+00', '2024-07-12 22:12:51.163971+00', NULL, '{}'),
	(145, 35, 96, 95, 3, 3, ' Alyssa finishes in the BOTTOM 6 in Bowling', 'active', '2024-08-29 01:37:29.350215+00', '2024-08-29 01:46:21.243807+00', 'main_event', '{"teamId": 723, "eventId": 60, "subtype": "team_position", "numberOfTeams": 6, "directionIsTop": false}'),
	(150, 35, 94, 90, 1, 1, 'Colin beats Josh in moop', 'pending_acceptance', '2025-01-24 03:18:56.963533+00', '2025-01-24 03:18:56.963533+00', 'duel', '{"duelId": 24, "challengerWins": true}'),
	(151, 35, 94, 96, 1, 1, 'Colin gets UNDER 2 successful flips in Flip Cup', 'pending_acceptance', '2025-01-24 15:35:09.48324+00', '2025-01-24 15:35:09.48324+00', 'special_space_event', '{"ouValue": 2, "ssEventId": 13, "directionIsOver": false}'),
	(153, 35, 94, 93, 1, 1, ' Alyssa finishes in the BOTTOM 9 in Mini Golf', 'pending_acceptance', '2025-01-25 15:28:11.853952+00', '2025-01-25 15:28:11.853952+00', 'main_event', '{"teamId": 712, "eventId": 59, "subtype": "team_position", "numberOfTeams": 9, "directionIsTop": false}'),
	(148, 35, 96, 93, 2, 2, 'No one will land on a red space in turn 4.', 'requester_won', '2024-08-29 01:39:22.862358+00', '2025-03-22 14:36:25.14791+00', NULL, '{}'),
	(149, 35, 96, 87, 3, 3, 'Molly lands on a Bank Space next', 'requester_won', '2024-08-29 01:39:56.434609+00', '2025-03-22 14:36:28.348252+00', 'gameboard_move', '{"playerId": 88, "gameboardSpaceId": 19}'),
	(147, 35, 96, 89, 1, 1, ' Dan finishes in the TOP 2 in Ping Pong', 'requester_won', '2024-08-29 01:38:28.92815+00', '2025-03-22 14:36:32.575653+00', 'main_event', '{"teamId": 702, "eventId": 57, "subtype": "team_position", "numberOfTeams": 2, "directionIsTop": true}'),
	(146, 35, 96, 92, 1, 1, 'Ellie lands on a Duel Space next', 'opponent_won', '2024-08-29 01:37:53.899725+00', '2025-03-22 15:06:28.707881+00', 'gameboard_move', '{"playerId": 89, "gameboardSpaceId": 18}'),
	(155, 35, 96, 95, 4, 4, 'sdfsdf', 'pending_acceptance', '2025-03-22 15:41:42.919908+00', '2025-03-22 15:41:42.919908+00', NULL, '{}'),
	(156, 35, 96, 90, 1, 1, 'ergrtg', 'pending_acceptance', '2025-03-22 15:41:59.092873+00', '2025-03-22 15:41:59.092873+00', NULL, '{}'),
	(112, 19, 48, 53, 1, 2, 'Tyler & Adam P finish LAST in Fart', 'pending_acceptance', '2024-07-08 04:29:34.053034+00', '2025-03-22 15:43:08.472531+00', 'main_event', '{"teamId": 648, "eventId": 2, "subtype": "team_position", "numberOfTeams": 1, "directionIsTop": false}'),
	(152, 35, 94, 96, 2, 2, 'Brittany fails to Stand On 1 Foot for 5 Minutes', 'pending_acceptance', '2025-01-24 17:46:17.590884+00', '2025-03-22 15:44:28.706104+00', 'chaos_space_event', '{"isLoser": true, "subtype": "player_loses", "playerId": 90, "chaosEventId": 16}'),
	(144, 35, 96, 94, 3, 3, ' Olivia finishes in the TOP 4 in Mini Golf', 'opponent_won', '2024-08-29 01:37:10.485781+00', '2025-05-03 14:49:39.160916+00', 'main_event', '{"teamId": 710, "eventId": 59, "subtype": "team_position", "numberOfTeams": 4, "directionIsTop": true}'),
	(154, 35, 94, 95, 1, 1, 'Josh lands on a Duel Space next', 'canceled_by_gm', '2025-01-25 19:01:55.803529+00', '2025-05-03 15:02:44.308608+00', 'gameboard_move', '{"playerId": 95, "gameboardSpaceId": 18}'),
	(157, 35, 96, 90, 1, 1, 'asdf', 'pending_acceptance', '2025-07-27 02:31:14.670116+00', '2025-07-27 02:31:14.670116+00', NULL, '{}'),
	(158, 38, 119, 109, 10, 10, 'Josh drinks more than 5 drinks tonight', 'requester_won', '2026-06-09 23:22:10.556549+00', '2026-06-09 23:26:02.345453+00', NULL, '{}');


--
-- Data for Name: event; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."event" ("id", "created_at", "updated_at", "round_number", "name", "description", "rules", "team_size", "scoring_map", "image_url", "points_label", "lower_scores_are_better", "format", "session_id") VALUES
	(2, '2024-05-12 04:10:01.368708+00', '2024-07-13 06:59:29.555364+00', 3, 'Fart', '*fart noises*', 'No sharts', 8, '{30,27,24,20,20,17,8,5}', 'https://static.thenounproject.com/png/1146131-200.png', 'points', true, 'single_elimination_tournament', 19),
	(18, '2024-05-27 17:35:03.985608+00', '2024-05-27 17:35:03.985608+00', 1, 'Previous Session Event Test', NULL, NULL, 1, '{1,2,3}', NULL, NULL, false, 'single_elimination_tournament', 3),
	(11, '2024-05-19 18:05:18.861484+00', '2024-06-24 19:11:03.707461+00', 9, 'Doodoo Dig', 'Dig up doodoo', 'Must dig it up', 1, '{30}', 'https://is4-ssl.mzstatic.com/image/thumb/Purple124/v4/d7/42/b2/d742b2ad-9373-3148-4d96-1a1629fbd667/source/256x256bb.jpg', 'doodoos dug', false, 'single_elimination_tournament', 19),
	(10, '2024-05-19 18:02:50.421123+00', '2024-07-01 19:21:28.624706+00', 4, 'Peepee Punch', 'Punch peepees, avoid getting your peepee punched!!!', 'Punch other peoples'' peepees', 1, '{30,27,24}', 'https://is2-ssl.mzstatic.com/image/thumb/Purple111/v4/25/52/ef/2552efe1-ce1a-b2a4-3c58-0f7e42b7630f/source/256x256bb.jpg', 'punches', false, 'single_elimination_tournament', 19),
	(8, '2024-05-17 02:35:05.924501+00', '2024-06-25 21:38:08.419462+00', 6, 'Speed Cornhole', 'Play cornhole really fast with the boiz', '', 1, '{1}', '', 'points', true, 'score_based_single_round', 19),
	(3, '2024-05-12 04:10:54.790671+00', '2024-06-25 21:38:12.196877+00', 11, 'Chode Chomp', 'Chomp as many chodes as you can in 60 seconds', 'No long schlongs allowed', 1, '{30,27}', 'https://vignette.wikia.nocookie.net/ssb/images/1/1d/Chain_Chomp.jpg/revision/latest/scale-to-width-down/143?cb=20110704180907', 'chodes chomped', false, 'score_based_single_round', 19),
	(12, '2024-05-19 18:06:59.005356+00', '2024-06-25 21:38:44.923879+00', 1, 'Wrench Wrap', 'Wrap as many wrenches as you can', 'Must wrap them good', 2, '{30}', 'https://m.media-amazon.com/images/I/71EI6OoelXL._UC256,256_CACC,256,256_.jpg', 'wrenches wrapped', false, 'score_based_single_round', 19),
	(1, '2024-05-12 03:57:07.035891+00', '2024-07-12 06:29:57.688687+00', 7, 'Pissy Wissy this is a really long event name asdfasdf as dfasdfasdfasdfasdfasdfasdfasdf', 'You piss and then you wiss!', 'No pooing allowed.', 7, '{1,2,3,4,5,6,7,8,9,10}', 'https://www.texanerin.com/content/uploads/2014/08/honey-lemonade-2-650x975.jpg', 'points', true, 'score_based_single_round', 19),
	(5, '2024-05-12 16:43:24.899512+00', '2024-05-22 04:34:11.358453+00', 8, 'Disc Golf', NULL, NULL, 1, '{1,2,3}', NULL, 'points', false, 'score_based_single_round', 19),
	(4, '2024-05-12 16:43:00.733045+00', '2025-01-24 15:48:04.633726+00', 2, 'Test Event', 'blah blah', '<p><strong><em>piss</em><span class="ql-cursor">﻿</span></strong></p>', 2, '{1,2,3}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'points', false, 'score_based_single_round', 19),
	(6, '2024-05-12 16:43:44.043463+00', '2025-01-24 15:48:06.267875+00', 5, 'Weiner Contest', 'Who''s got the most talented dong?', 'Smallest peepee wins', 1, '{1,2,3}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'points', true, 'single_elimination_tournament', 19),
	(13, '2024-05-19 18:28:52.358636+00', '2025-01-24 15:48:11.886601+00', 10, 'Ernest', 'Ernest', 'Ernest', 1, '{20}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'Ernests', false, 'score_based_single_round', 19),
	(45, '2024-06-01 22:16:19.626726+00', '2025-01-24 15:48:14.378854+00', 12, 'Give Money To Leo', 'Give it all. ', 'Check pockets, wallets, couches, etc. for money. Give it all to Leo.  Lower scores are not better.', 1, '{1}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'money', false, 'score_based_single_round', 19),
	(49, '2024-06-11 00:43:36.656388+00', '2025-01-24 15:48:16.652715+00', 13, 'Make Buddy Smile', 'Using any method you can think of', 'No killing', 1, '{30}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'smiles', false, 'score_based_single_round', 19),
	(51, '2024-06-11 03:52:18.994447+00', '2025-01-24 15:48:17.745336+00', 15, 'Test imagexx', '', '', 1, '{30}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'points', false, 'score_based_single_round', 19),
	(52, '2024-06-24 19:12:05.34631+00', '2025-01-24 15:48:19.219251+00', 14, 'lzs42', 'lzs42', 'lzs42', 1, '{1}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'points', false, 'score_based_single_round', 19),
	(53, '2024-08-03 20:40:56.695993+00', '2025-01-24 15:48:20.719163+00', -1, 'Kickball', 'It''s like baseball, but with your foot!', NULL, 5, '{1}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'runs', false, 'score_based_single_round', 34),
	(54, '2024-08-03 20:42:51.997092+00', '2025-01-24 15:48:22.52928+00', 0, 'Ping Pong', 'When tennis is too big, just play it on a table.', '', 1, '{1}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'points', false, 'score_based_single_round', 34),
	(56, '2024-08-06 02:11:41.834458+00', '2025-01-24 15:48:27.387093+00', 1, 'Kickball', 'It''s like baseball, but with your foot!', '<ol><li>6 Innings</li><li>MLB rules if extra innings are required</li></ol>', 5, '{30,0}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'runs', false, 'score_based_single_round', 35),
	(55, '2024-08-03 20:46:44.236161+00', '2025-01-24 15:48:29.97294+00', 1, 'bfdb', 'bfsbfs', '', 1, '{1}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'points', false, 'score_based_single_round', 34),
	(58, '2024-08-06 02:11:41.834458+00', '2025-01-24 15:48:33.422587+00', 2, 'Cornhole', 'Some call it bean bag toss, but those people are wrong.', '<ol><li>Play to 15</li><li>Net scoring</li><li>Boards must be regulation distance apart</li></ol>', 2, '{30,24,20,16,12,10,8,6,4,2,0}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'bags', false, 'single_elimination_tournament', 35),
	(59, '2024-08-06 03:12:38.484952+00', '2025-01-24 15:48:34.990144+00', 3, 'Mini Golf', 'You''re never too old for a good ol'' round of mini golf.', '<p>There are no rules in mini golf.</p>', 1, '{30,24,20,16,12,10,8,6,4,2}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'strokes', true, 'score_based_single_round', 35),
	(60, '2024-08-06 03:13:54.963287+00', '2025-01-24 15:48:36.912288+00', 5, 'Bowling', 'We''re all really here for the beer and pizza.', '<p>Bumpers are allowed.</p>', 1, '{30,24,20,16,12,10,8,6,5,1}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'pins', false, 'score_based_single_round', 35),
	(61, '2025-01-26 02:54:07.727123+00', '2025-01-26 02:54:07.727123+00', -1, 'Kickball', 'It''s like baseball, but with your foot!', '<ol><li>6 Innings</li><li>MLB rules if extra innings are required</li></ol>', 5, '{30,0}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'runs', false, 'score_based_single_round', 36),
	(62, '2025-01-26 02:54:07.727123+00', '2025-01-26 02:54:07.727123+00', 0, 'Ping Pong', 'When tennis is too big, just play it on a table.', '<ol><li>Play to 11</li><li>Win by 2</li></ol>', 1, '{30,24,20,16,12,10,8,6,4,2,1}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'points', false, 'single_elimination_tournament', 36),
	(63, '2025-01-26 02:54:07.727123+00', '2025-01-26 02:54:07.727123+00', 1, 'Cornhole', 'Some call it bean bag toss, but those people are wrong.', '<ol><li>Play to 15</li><li>Net scoring</li><li>Boards must be regulation distance apart</li></ol>', 2, '{30,24,20,16,12,10,8,6,4,2,0}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'bags', false, 'single_elimination_tournament', 36),
	(64, '2025-01-26 02:54:07.727123+00', '2025-01-26 02:54:07.727123+00', 2, 'Mini Golf', 'You''re never too old for a good ol'' round of mini golf.', '<p>There are no rules in mini golf.</p>', 1, '{30,24,20,16,12,10,8,6,4,2}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'strokes', true, 'score_based_single_round', 36),
	(65, '2025-01-26 02:54:07.727123+00', '2025-01-26 02:54:07.727123+00', 3, 'Bowling', 'We''re all really here for the beer and pizza.', '<p>Bumpers are allowed.</p>', 1, '{30,24,20,16,12,10,8,6,5,1}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'pins', false, 'score_based_single_round', 36),
	(57, '2024-08-06 02:11:41.834458+00', '2025-11-09 21:45:10.748744+00', 4, 'Ping Pong', 'When tennis is too big, just play it on a table.', '<ol><li>Play to 11</li><li>Win by 2</li></ol>', 1, '{30,24,20,16,12,10,8,6,4,2,1}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'points', false, 'score_based_single_round', 35),
	(66, '2026-02-19 16:07:17.743372+00', '2026-02-19 16:07:17.743372+00', -1, 'Kickball', 'It''s like baseball, but with your foot!', '<ol><li>6 Innings</li><li>MLB rules if extra innings are required</li></ol>', 5, '{30,0}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'runs', false, 'score_based_single_round', 37),
	(67, '2026-02-19 16:07:17.743372+00', '2026-02-19 16:07:17.743372+00', 0, 'Ping Pong', 'When tennis is too big, just play it on a table.', '<ol><li>Play to 11</li><li>Win by 2</li></ol>', 1, '{30,24,20,16,12,10,8,6,4,2,1}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'points', false, 'single_elimination_tournament', 37),
	(68, '2026-02-19 16:07:17.743372+00', '2026-02-19 16:07:17.743372+00', 1, 'Cornhole', 'Some call it bean bag toss, but those people are wrong.', '<ol><li>Play to 15</li><li>Net scoring</li><li>Boards must be regulation distance apart</li></ol>', 2, '{30,24,20,16,12,10,8,6,4,2,0}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'bags', false, 'single_elimination_tournament', 37),
	(69, '2026-02-19 16:07:17.743372+00', '2026-02-19 16:07:17.743372+00', 2, 'Mini Golf', 'You''re never too old for a good ol'' round of mini golf.', '<p>There are no rules in mini golf.</p>', 1, '{30,24,20,16,12,10,8,6,4,2}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'strokes', true, 'score_based_single_round', 37),
	(70, '2026-02-19 16:07:17.743372+00', '2026-02-19 16:07:17.743372+00', 3, 'Bowling', 'We''re all really here for the beer and pizza.', '<p>Bumpers are allowed.</p>', 1, '{30,24,20,16,12,10,8,6,5,1}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'pins', false, 'score_based_single_round', 37),
	(71, '2026-06-09 22:59:18.051947+00', '2026-06-09 23:07:40.860239+00', 3, 'Kickball', 'It''s like baseball, but with your foot!', '<ol><li>6 Innings</li><li>MLB rules if extra innings are required</li></ol>', 5, '{30,0}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'runs', false, 'score_based_single_round', 38),
	(73, '2026-06-09 22:59:18.051947+00', '2026-06-09 23:07:40.860239+00', 4, 'Cornhole', 'Some call it bean bag toss, but those people are wrong.', '<ol><li>Play to 15</li><li>Net scoring</li><li>Boards must be regulation distance apart</li></ol>', 2, '{30,24,20,16,12,10,8,6,4,2,0}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'bags', false, 'single_elimination_tournament', 38),
	(74, '2026-06-09 22:59:18.051947+00', '2026-06-09 23:07:40.860239+00', 5, 'Mini Golf', 'You''re never too old for a good ol'' round of mini golf.', '<p>There are no rules in mini golf.</p>', 1, '{30,24,20,16,12,10,8,6,4,2}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'strokes', true, 'score_based_single_round', 38),
	(75, '2026-06-09 22:59:18.051947+00', '2026-06-09 23:07:40.860239+00', 6, 'Bowling', 'We''re all really here for the beer and pizza.', '<p>Bumpers are allowed.</p>', 1, '{30,24,20,16,12,10,8,6,5,1}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'pins', false, 'score_based_single_round', 38),
	(72, '2026-06-09 22:59:18.051947+00', '2026-06-09 23:07:48.458642+00', 2, 'Ping Pong', 'When tennis is too big, just play it on a table.', '<ol><li>Play to 11</li><li>Win by 2</li></ol>', 1, '{30,24,20,16,12,10,8,6,4,2,1}', 'https://ih1.redbubble.net/image.3038850095.2819/raf,360x360,075,t,fafafa:ca443f4786.u2.jpg', 'points', false, 'single_elimination_tournament', 38),
	(76, '2026-06-09 23:07:01.796298+00', '2026-06-09 23:07:48.458642+00', 1, 'Magic school', 'Cast some spells', '<p>- Cast the biggest spell ever </p><p>- </p>', 1, '{30,0}', 'https://jdwvtjrhfsciqttiueud.supabase.co/storage/v1/object/public/event-images/events/1781046251661.webp', 'points', false, 'score_based_single_round', 38);


--
-- Data for Name: bracket; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."bracket" ("id", "created_at", "updated_at", "event_id", "data") VALUES
	(1, '2024-07-01 19:22:46.473067+00', '2024-07-12 04:55:11.121918+00', 10, '[[2],[2,4],[3,2,4,1],[6,3,5,4]]'),
	(17, '2024-07-13 06:37:03.285706+00', '2024-08-03 20:19:40.988772+00', 2, '[[2],[2,1],[3,2]]'),
	(21, '2024-08-06 03:31:03.325417+00', '2024-08-06 04:06:18.446574+00', 58, '[[1],[2,1],[3,2,5,1],[5,4]]'),
	(31, '2025-06-15 18:51:33.440017+00', '2025-06-15 18:51:33.440017+00', 57, '[[2],[2,5],[6,2,5,8],[6,3,10,2,5,4,8,1],[10,7,9,8]]');


--
-- Data for Name: chaos_space_event_template; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."chaos_space_event_template" ("id", "session_id", "name", "description", "details", "created_at", "updated_at", "type") VALUES
	(2, 19, 'Point Swap', '2 random players swap points', '{}', '2024-06-06 05:10:45.43682+00', '2024-06-06 05:10:45.43682+00', 'point_swap'),
	(3, 19, 'Gain Points Based on Rank', 'Everyone gains points based on their current ranking. First place gets the fewest points, and last place gets the most points.', '{"lastPlacePoints": 24}', '2024-06-06 05:12:17.365224+00', '2024-06-06 05:12:17.365224+00', 'everyone_gains_points_based_on_rank'),
	(4, 19, 'Everyone Loses 10% of Their Points', 'What else do you want me to say?', '{"percentageLoss": 10}', '2024-06-06 05:24:32.243617+00', '2024-06-06 05:24:32.243617+00', 'everyone_loses_percentage_of_their_points'),
	(6, 19, 'Everyone must poop their pants', 'Immediately', '{"taskName": "immediately poop your pants", "percentageLoss": 10}', '2024-06-11 00:02:46.713862+00', '2024-06-11 00:13:56.045825+00', 'everyone_loses_percentage_of_their_points_based_on_task_failure'),
	(5, 19, 'Everyone Stands on 1 Foot for 5 Minutes', 'The unused foot must not be touching any other object or body part.', '{"taskName": "stand on 1 foot for 5 minutes", "percentageLoss": 10}', '2024-06-06 05:30:43.29062+00', '2024-06-11 04:33:08.805656+00', 'everyone_loses_percentage_of_their_points_based_on_task_failure'),
	(7, 35, 'Stand On One Foot', 'Everyone stands on one foot for 5 minutes.  Lose 10% of your points if you drop out.', '{"taskName": "Stand On 1 Foot for 5 Minutes", "percentageLoss": 10}', '2024-08-06 03:55:50.815408+00', '2024-08-06 03:55:50.815408+00', 'everyone_loses_percentage_of_their_points_based_on_task_failure'),
	(8, 36, 'Stand On One Foot', 'Everyone stands on one foot for 5 minutes.  Lose 10% of your points if you drop out.', '{"taskName": "Stand On 1 Foot for 5 Minutes", "percentageLoss": 10}', '2025-01-26 02:54:07.727123+00', '2025-01-26 02:54:07.727123+00', 'everyone_loses_percentage_of_their_points_based_on_task_failure'),
	(9, 37, 'Stand On One Foot', 'Everyone stands on one foot for 5 minutes.  Lose 10% of your points if you drop out.', '{"taskName": "Stand On 1 Foot for 5 Minutes", "percentageLoss": 10}', '2026-02-19 16:07:17.743372+00', '2026-02-19 16:07:17.743372+00', 'everyone_loses_percentage_of_their_points_based_on_task_failure'),
	(10, 38, 'Stand On One Foot', 'Everyone stands on one foot for 5 minutes.  Lose 10% of your points if you drop out.', '{"taskName": "Stand On 1 Foot for 5 Minutes", "percentageLoss": 10}', '2026-06-09 22:59:18.051947+00', '2026-06-09 22:59:18.051947+00', 'everyone_loses_percentage_of_their_points_based_on_task_failure');


--
-- Data for Name: gameboard_space; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."gameboard_space" ("id", "name", "color", "icon_class", "effect", "effect_data", "created_at", "updated_at", "session_id") VALUES
	(5, 'Special', 'var(--color-green-600)', 'pi pi-question', 'special', '{"specialSpaceEventTemplateIds": [1, 2, 3, 4, 5]}', '2024-05-05 18:04:24.362021+00', '2025-03-22 16:57:20.088116+00', 19),
	(3, 'Bad-Luck Brown', 'var(--color-orange-900)', 'ci-poop', 'gain_points_or_do_activity', '{"pointsGained": -69, "alternativeActivity": "Eat diarrhea"}', '2024-05-04 06:44:36.304924+00', '2025-03-22 16:57:20.088116+00', 19),
	(10, 'Duel', 'var(--color-purple-500)', 'pi pi-bolt', 'duel', '{"duelGames": ["One Strike", "Disc Golf Putting", "Air Hockey", "Cookie Face"]}', '2024-05-18 20:26:24.797765+00', '2025-03-22 16:57:20.088116+00', 19),
	(2, 'Red', 'var(--color-red-600)', '', 'gain_points_or_do_activity', '{"pointsGained": -10, "alternativeActivity": "Take a shot"}', '2024-05-04 02:16:52.533263+00', '2025-03-22 16:57:20.088116+00', 19),
	(11, 'Anus', 'var(--color-orange-900)', 'pi pi-asterisk', 'chaos', '{"chaosSpaceEventTemplateIds": [2, 3, 4, 5, 6]}', '2024-06-06 05:22:34.516001+00', '2025-03-22 16:57:20.088116+00', 19),
	(14, 'Bank', 'var(--color-yellow-600)', 'pi pi-building-columns', 'bank', NULL, '2024-06-29 03:24:19.079527+00', '2025-03-22 16:57:20.088116+00', 19),
	(15, 'On the Line', 'var(--color-pink-500)', 'pi pi-minus', 'chaos', '{"chaosSpaceEventTemplateIds": [6, 5, 4]}', '2024-07-06 19:16:53.91843+00', '2025-03-22 16:57:20.088116+00', 19),
	(1, 'Blue', 'var(--color-blue-500)', '', 'gain_points', '{"pointsGained": 10}', '2024-05-04 02:14:36.488542+00', '2025-03-22 16:57:20.088116+00', 19),
	(17, 'Red', 'var(--color-red-600)', '', 'gain_points', '{"pointsGained": -10}', '2024-08-06 02:54:22.114345+00', '2025-03-22 16:57:20.088116+00', 35),
	(19, 'Bank', 'var(--color-green-600)', 'pi pi-dollar', 'bank', NULL, '2024-08-06 02:56:10.688212+00', '2025-03-22 16:57:20.088116+00', 35),
	(20, 'Blue', 'var(--color-blue-500)', '', 'gain_points', '{"pointsGained": 10}', '2025-01-26 02:54:07.727123+00', '2025-03-22 16:57:20.088116+00', 36),
	(21, 'Red', 'var(--color-red-600)', '', 'gain_points', '{"pointsGained": -10}', '2025-01-26 02:54:07.727123+00', '2025-03-22 16:57:20.088116+00', 36),
	(22, 'Duel', 'var(--color-yellow-600)', 'pi pi-bolt', 'duel', '{"duelGames": ["Rock-Paper-Scissors", "Paper Airplanes", "Push-up Contest", "Ping Pong (3-point game)"]}', '2025-01-26 02:54:07.727123+00', '2025-03-22 16:57:20.088116+00', 36),
	(23, 'Bank', 'var(--color-green-600)', 'pi pi-dollar', 'bank', NULL, '2025-01-26 02:54:07.727123+00', '2025-03-22 16:57:20.088116+00', 36),
	(24, 'Special', 'var(--color-gray-600)', 'pi pi-bolt', 'special', '{"specialSpaceEventTemplateIds": [8, 9, 14]}', '2025-06-05 00:37:43.767828+00', '2025-06-05 01:36:28.996909+00', 35),
	(16, 'Blue', 'var(--color-blue-500)', '', 'gain_points_or_do_activity', '{"pointsGained": 10, "alternativeActivity": "Get a Kiss"}', '2024-08-06 02:54:03.348448+00', '2025-06-05 01:45:49.707703+00', 35),
	(18, 'Duel', 'var(--color-yellow-600)', 'pi pi-bolt', 'duel', '{"duelGames": ["Rock-Paper-Scissors", "Paper Airplanes", "Push-up Contest", "Ping Pong (3-point game)"]}', '2024-08-06 02:55:47.868848+00', '2025-06-07 20:55:52.47658+00', 35),
	(26, 'Super Duel', 'var(--color-pink-500)', 'pi pi-box', 'duel', '{"duelGames": ["A", "B", "C"]}', '2025-06-17 00:37:56.287009+00', '2025-06-17 00:37:56.287009+00', 35),
	(27, 'Blue', 'var(--color-blue-500)', '', 'gain_points', '{"pointsGained": 10}', '2026-02-19 16:07:17.743372+00', '2026-02-19 16:07:17.743372+00', 37),
	(28, 'Red', 'var(--color-red-600)', '', 'gain_points', '{"pointsGained": -10}', '2026-02-19 16:07:17.743372+00', '2026-02-19 16:07:17.743372+00', 37),
	(29, 'Duel', 'var(--color-yellow-600)', 'pi pi-bolt', 'duel', '{"duelGames": ["Rock-Paper-Scissors", "Paper Airplanes", "Push-up Contest", "Ping Pong (3-point game)"]}', '2026-02-19 16:07:17.743372+00', '2026-02-19 16:07:17.743372+00', 37),
	(30, 'Bank', 'var(--color-green-600)', 'pi pi-dollar', 'bank', NULL, '2026-02-19 16:07:17.743372+00', '2026-02-19 16:07:17.743372+00', 37),
	(25, 'Jeff Bezos', 'var(--color-yellow-600)', 'pi pi-amazon', 'chaos', '{"chaosSpaceEventTemplateIds": [7]}', '2025-06-07 21:50:37.374728+00', '2026-05-12 17:39:30.731415+00', 35),
	(31, 'Chance', 'var(--color-yellow-600)', 'pi pi-gift animate-pulse', 'chance_points', NULL, '2026-04-26 21:17:49.144063+00', '2026-05-12 23:22:59.062737+00', 35),
	(32, 'Blue', 'var(--color-blue-500)', '', 'gain_points', '{"pointsGained": 10}', '2026-06-09 22:59:18.051947+00', '2026-06-09 22:59:18.051947+00', 38),
	(33, 'Red', 'var(--color-red-600)', '', 'gain_points', '{"pointsGained": -10}', '2026-06-09 22:59:18.051947+00', '2026-06-09 22:59:18.051947+00', 38),
	(35, 'Bank', 'var(--color-green-600)', 'pi pi-dollar', 'bank', NULL, '2026-06-09 22:59:18.051947+00', '2026-06-09 22:59:18.051947+00', 38),
	(36, 'Test', 'var(--color-pink-500)', 'pi pi-arrow-circle-left', 'chance_points', NULL, '2026-06-09 23:17:21.277762+00', '2026-06-09 23:17:21.277762+00', 38),
	(34, 'Duel', 'var(--color-yellow-600)', 'pi pi-bolt', 'duel', '{"duelGames": ["Rock-Paper-Scissors", "Paper Airplanes", "Push-up Contest", "Ping Pong (3-point game)"]}', '2026-06-09 22:59:18.051947+00', '2026-06-09 23:17:53.377825+00', 38);


--
-- Data for Name: chaos_space_event; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."chaos_space_event" ("id", "session_id", "round_number", "player_id", "template_id", "status", "results", "created_at", "updated_at", "chaos_space_id") VALUES
	(10, 19, 1, 49, 4, 'finished', '{"48": -17, "49": -42, "50": -16, "51": -44, "53": -33, "54": -33}', '2024-06-29 15:40:22.160768+00', '2024-06-29 15:40:49.743347+00', 11),
	(11, 19, 1, 51, 4, 'finished', '{"48": -16, "49": -38, "50": -14, "51": -39, "53": -30, "54": -30}', '2024-06-29 15:40:22.160768+00', '2024-06-29 15:42:29.578953+00', 11),
	(12, 19, 1, 53, 4, 'finished', '{"48": -14, "49": -34, "50": -13, "51": -36, "53": -27, "54": -27}', '2024-06-29 15:40:22.160768+00', '2024-06-29 19:20:15.477435+00', 11),
	(2, 19, 5, 53, 5, 'finished', '{"48": -15, "49": 0, "50": 0, "51": 0, "53": -6, "54": 0}', '2024-06-06 05:40:49.56501+00', '2024-06-10 21:01:35.383558+00', 11),
	(1, 19, 5, 49, 5, 'finished', '{"48": 0, "49": 0, "50": 0, "51": 0, "53": -6, "54": 0}', '2024-06-06 05:40:49.56501+00', '2024-06-10 21:17:30.818701+00', 11),
	(3, 19, 5, 48, 3, 'finished', '{"48": 4, "49": 20, "50": 24, "51": 16, "53": 12, "54": 8}', '2024-06-10 21:24:08.318737+00', '2024-06-10 21:26:30.908106+00', 11),
	(4, 19, 5, 49, 4, 'finished', '{"48": -14, "49": 4, "50": 8, "51": 0, "53": -6, "54": -8}', '2024-06-10 21:24:08.318737+00', '2024-06-10 21:26:58.770152+00', 11),
	(13, 19, 1, 54, 6, 'finished', '{"48": -13, "49": -30, "50": 0, "51": 0, "53": 0, "54": 0}', '2024-06-29 15:40:22.160768+00', '2024-06-29 19:38:37.76734+00', 11),
	(7, 19, 5, 53, 2, 'finished', '{"48": 0, "49": 0, "50": 122, "51": 0, "53": -122, "54": 0}', '2024-06-10 21:24:08.318737+00', '2024-06-10 23:43:03.680084+00', 11),
	(8, 19, 5, 54, 3, 'waiting_to_begin', '{"48": 4, "49": 20, "50": 12, "51": 16, "53": 24, "54": 8}', '2024-06-10 21:24:08.318737+00', '2024-06-20 16:24:11.045495+00', 11),
	(14, 19, 2, 53, 6, 'finished', '{"48": 0, "49": -23, "50": -7, "51": 0, "53": 0, "54": 0}', '2024-07-06 19:19:25.519189+00', '2024-07-06 19:24:02.884751+00', 15),
	(5, 19, 3, 50, 6, 'waiting_to_begin', '{"48": -33, "49": 0, "50": 0, "51": 0, "53": 0, "54": 33}', '2024-06-10 21:24:08.318737+00', '2024-07-08 04:44:07.373963+00', 11),
	(15, 19, 3, 49, NULL, 'event_not_selected', NULL, '2024-07-12 22:01:47.982381+00', '2024-07-12 22:01:47.982381+00', 11),
	(9, 19, 3, 51, 5, 'in_progress', '{"48": 20, "49": 0, "50": 0, "51": 0, "53": -20, "54": 0}', '2024-06-12 02:30:56.965666+00', '2024-07-12 22:12:06.894564+00', 11),
	(6, 19, 3, 51, 5, 'finished', '{"48": -13, "49": 0, "50": 7, "51": 0, "53": 0, "54": -7}', '2024-06-10 21:24:08.318737+00', '2024-06-21 20:09:26.96318+00', 11),
	(16, 35, 3, 95, 7, 'waiting_to_begin', NULL, '2025-01-24 17:39:52.099773+00', '2025-01-24 17:45:32.413397+00', 19),
	(17, 35, 5, 88, NULL, 'event_not_selected', NULL, '2026-05-12 17:37:07.68149+00', '2026-05-12 17:37:07.68149+00', 25);


--
-- Data for Name: duel; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."duel" ("id", "challenger_player_id", "opponent_player_id", "game_name", "wager_percentage", "status", "created_at", "updated_at", "session_id", "round_number", "duel_space_id", "points_gained_by_winner") VALUES
	(4, 53, 48, 'Cookie Face', 35, 'challenger_won', '2024-06-01 04:58:08.956868+00', '2024-06-16 18:40:59.021485+00', 19, 3, 10, 59),
	(10, 50, 48, 'Disc Golf Putting', 25, 'opponent_won', '2024-06-12 02:30:56.965666+00', '2024-07-10 20:55:34.155003+00', 19, 3, 10, 25),
	(8, 50, 53, NULL, NULL, 'canceled', '2024-06-01 07:53:42.745258+00', '2024-06-01 07:53:42.745258+00', 19, 5, 10, NULL),
	(9, 53, NULL, NULL, NULL, 'canceled', '2024-06-01 08:00:57.354429+00', '2024-06-01 08:00:57.354429+00', 19, 5, 10, NULL),
	(17, 53, NULL, NULL, NULL, 'opponent_not_selected', '2024-07-12 22:01:47.982381+00', '2024-07-12 22:01:47.982381+00', 19, 3, 10, NULL),
	(16, 49, 53, 'Air Hockey', 25, 'challenger_won', '2024-06-29 03:40:36.141819+00', '2024-07-12 22:10:45.077935+00', 19, 3, 10, 84),
	(5, 48, 53, 'One Strike', 25, 'challenger_won', '2024-06-01 07:46:54.673986+00', '2024-06-06 05:37:21.830315+00', 19, 5, 10, 27),
	(3, 49, 50, 'One Strike', 25, 'challenger_won', '2024-06-01 04:58:08.956868+00', '2024-06-12 05:37:07.771113+00', 19, 5, 10, 10),
	(18, 89, 90, 'Rock-Paper-Scissors', 25, 'challenger_won', '2024-08-06 03:29:11.899827+00', '2024-08-06 03:29:47.081543+00', 35, 1, 18, 3),
	(19, 96, 91, 'Push-up Contest', 50, 'challenger_won', '2024-08-06 03:29:11.899827+00', '2024-08-06 03:30:10.392592+00', 35, 1, 18, 5),
	(20, 93, 95, 'Paper Airplanes', 25, 'challenger_won', '2024-08-06 04:05:25.279024+00', '2024-08-06 04:05:50.751682+00', 35, 1, 18, 15),
	(21, 94, 90, 'Ping Pong (3-point game)', 25, 'challenger_won', '2024-08-06 04:05:25.279024+00', '2024-08-06 04:06:03.672306+00', 35, 1, 18, 5),
	(22, 88, 87, 'Push-up Contest', 25, 'challenger_won', '2024-08-06 04:08:47.696683+00', '2024-08-06 04:31:44.270178+00', 35, 2, 18, 10),
	(23, 95, 89, 'Ping Pong (3-point game)', 45, 'challenger_won', '2024-08-06 04:08:47.696683+00', '2024-08-06 04:31:57.408922+00', 35, 2, 18, 12),
	(24, 96, 95, 'moop', 10, 'waiting_to_begin', '2025-01-24 03:08:40.009989+00', '2025-01-24 03:11:27.244331+00', 35, 3, 18, 11),
	(25, 87, 90, 'Paper Airplanes', 25, 'opponent_won', '2025-05-03 15:02:44.308608+00', '2025-05-03 15:03:15.748335+00', 35, 4, 18, 5),
	(26, 90, 89, 'Push-up Contest', 25, 'challenger_won', '2025-05-03 15:02:44.308608+00', '2025-05-03 15:03:31.987504+00', 35, 4, 18, 16),
	(27, 92, 91, 'Ping Pong (3-point game)', 25, 'opponent_won', '2025-05-03 15:02:44.308608+00', '2025-05-03 15:03:52.542675+00', 35, 4, 18, 8),
	(28, 95, 94, 'Ping Pong (3-point game)', 25, 'challenger_won', '2025-05-03 15:02:44.308608+00', '2025-05-03 15:04:08.344357+00', 35, 4, 18, 24),
	(30, 94, 95, NULL, NULL, 'wager_not_selected', '2025-06-17 00:40:47.980083+00', '2025-06-17 00:40:47.980083+00', 35, 5, 26, NULL),
	(31, 95, 90, NULL, NULL, 'wager_not_selected', '2025-06-17 02:28:03.370127+00', '2025-06-17 02:28:03.370127+00', 35, 5, 26, NULL),
	(32, 95, 90, NULL, NULL, 'wager_not_selected', '2025-06-17 02:42:05.364677+00', '2025-06-17 02:42:05.364677+00', 35, 5, 18, NULL),
	(33, 88, 95, NULL, NULL, 'canceled', '2025-06-17 02:42:51.854068+00', '2025-06-18 01:30:35.77843+00', 35, 5, 18, NULL),
	(34, 95, NULL, NULL, NULL, 'opponent_not_selected', '2025-06-18 01:39:16.77338+00', '2025-06-18 01:39:16.77338+00', 35, 5, 18, NULL),
	(29, 95, 94, 'Ping Pong (3-point game)', 25, 'in_progress', '2025-06-17 00:39:02.259537+00', '2025-07-22 21:08:36.207488+00', 35, 5, 18, NULL),
	(35, 95, 90, NULL, NULL, 'wager_not_selected', '2025-07-22 21:17:54.860604+00', '2025-07-22 21:17:54.860604+00', 35, 5, 18, NULL),
	(36, 95, 94, NULL, NULL, 'wager_not_selected', '2026-05-12 17:35:20.887719+00', '2026-05-12 17:35:20.887719+00', 35, 5, 26, NULL),
	(37, 92, NULL, NULL, NULL, 'opponent_not_selected', '2026-05-12 17:37:07.68149+00', '2026-05-12 17:37:07.68149+00', 35, 5, 26, NULL),
	(38, 119, 110, 'Paper Airplanes', 25, 'opponent_won', '2026-06-09 23:30:02.679819+00', '2026-06-09 23:34:33.353001+00', 38, 1, 34, 11),
	(39, 109, 119, 'Push-up Contest', 90, 'challenger_won', '2026-06-09 23:30:54.342407+00', '2026-06-09 23:37:20.424061+00', 38, 1, 34, 31);


--
-- Data for Name: event_format_standard_scoring_formula; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."event_format_standard_scoring_formula" ("id", "created_at", "updated_at", "formula") VALUES
	('score_based_single_round', '2024-05-12 01:57:55.570296+00', '2024-05-12 01:57:55.570296+00', '(1 - (rank - 1) / numTeams) * 30');


--
-- Data for Name: event_team; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."event_team" ("id", "created_at", "updated_at", "event_id", "seed", "name") VALUES
	(282, '2024-05-29 02:05:20.954843+00', '2024-05-29 02:05:20.954843+00', 18, 1, 'Previous Session Team'),
	(639, '2024-06-19 02:38:49.083776+00', '2024-06-22 01:00:36.208956+00', 3, 1, NULL),
	(646, '2024-06-23 03:32:30.898996+00', '2024-06-23 03:32:30.898996+00', 3, 5, NULL),
	(647, '2024-06-23 03:32:35.906842+00', '2024-06-23 03:32:35.906842+00', 3, 6, NULL),
	(645, '2024-06-23 03:32:30.898996+00', '2024-06-23 03:32:42.699801+00', 3, 2, NULL),
	(642, '2024-06-19 02:39:10.313963+00', '2024-06-23 03:32:42.699801+00', 3, 3, NULL),
	(644, '2024-06-23 03:32:30.898996+00', '2024-06-23 03:32:42.699801+00', 3, 4, NULL),
	(648, '2024-06-25 22:17:05.879373+00', '2024-06-25 22:17:05.879373+00', 2, 1, NULL),
	(649, '2024-06-25 22:17:05.879373+00', '2024-06-25 22:17:05.879373+00', 2, 2, NULL),
	(654, '2024-06-26 17:30:15.137098+00', '2024-06-26 17:30:15.137098+00', 13, 1, NULL),
	(655, '2024-06-26 17:30:15.137098+00', '2024-06-26 17:30:15.137098+00', 13, 2, NULL),
	(656, '2024-06-26 17:30:15.137098+00', '2024-06-26 17:30:15.137098+00', 13, 3, NULL),
	(657, '2024-06-26 17:30:15.137098+00', '2024-06-26 17:30:15.137098+00', 13, 4, NULL),
	(658, '2024-06-26 17:30:15.137098+00', '2024-06-26 17:30:15.137098+00', 13, 5, NULL),
	(659, '2024-06-26 17:30:15.137098+00', '2024-06-26 17:30:15.137098+00', 13, 6, NULL),
	(651, '2024-06-25 22:17:05.879373+00', '2024-06-26 22:08:58.544733+00', 2, 3, NULL),
	(660, '2024-07-01 03:18:53.049308+00', '2024-07-01 03:18:53.049308+00', 10, 1, NULL),
	(661, '2024-07-01 03:18:53.049308+00', '2024-07-01 03:18:53.049308+00', 10, 2, NULL),
	(662, '2024-07-01 19:24:31.639723+00', '2024-07-01 19:24:31.639723+00', 10, 3, NULL),
	(663, '2024-07-01 19:24:31.639723+00', '2024-07-01 19:24:31.639723+00', 10, 4, NULL),
	(664, '2024-07-01 20:17:42.502583+00', '2024-07-01 20:17:42.502583+00', 10, 5, NULL),
	(665, '2024-07-01 20:17:42.502583+00', '2024-07-01 20:17:42.502583+00', 10, 6, NULL),
	(666, '2024-07-11 14:50:11.239571+00', '2024-07-11 14:50:11.239571+00', 6, 1, NULL),
	(667, '2024-07-11 14:50:11.239571+00', '2024-07-11 14:50:11.239571+00', 6, 2, NULL),
	(668, '2024-07-11 14:50:11.239571+00', '2024-07-11 14:50:11.239571+00', 6, 3, NULL),
	(669, '2024-07-11 14:50:11.239571+00', '2024-07-11 14:50:11.239571+00', 6, 4, NULL),
	(670, '2024-07-11 14:50:11.239571+00', '2024-07-11 14:50:11.239571+00', 6, 5, NULL),
	(671, '2024-07-12 06:06:51.307827+00', '2024-07-12 06:06:51.307827+00', 12, 1, NULL),
	(672, '2024-08-03 20:51:24.221933+00', '2024-08-03 20:51:24.221933+00', 55, 1, NULL),
	(673, '2024-08-03 20:51:24.221933+00', '2024-08-03 20:51:24.221933+00', 55, 2, NULL),
	(677, '2024-08-03 20:55:12.990072+00', '2024-08-03 20:55:12.990072+00', 55, 5, NULL),
	(675, '2024-08-03 20:51:24.221933+00', '2024-08-03 20:55:12.990072+00', 55, 3, NULL),
	(676, '2024-08-03 20:51:24.221933+00', '2024-08-03 20:55:12.990072+00', 55, 4, NULL),
	(678, '2024-08-03 20:55:12.990072+00', '2024-08-03 20:55:48.203958+00', 55, 7, NULL),
	(679, '2024-08-03 20:55:32.76485+00', '2024-08-03 20:55:48.203958+00', 55, 8, NULL),
	(680, '2024-08-03 20:55:32.76485+00', '2024-08-03 20:55:48.203958+00', 55, 9, NULL),
	(681, '2024-08-03 20:55:40.708297+00', '2024-08-03 20:55:48.203958+00', 55, 10, NULL),
	(682, '2024-08-03 20:55:40.708297+00', '2024-08-03 20:55:48.203958+00', 55, 6, NULL),
	(683, '2024-08-03 20:56:03.703796+00', '2024-08-03 20:56:03.703796+00', 54, 1, NULL),
	(684, '2024-08-03 20:56:03.703796+00', '2024-08-03 20:56:03.703796+00', 54, 2, NULL),
	(685, '2024-08-03 20:56:03.703796+00', '2024-08-03 20:56:03.703796+00', 54, 3, NULL),
	(686, '2024-08-03 20:56:03.703796+00', '2024-08-03 20:56:03.703796+00', 54, 4, NULL),
	(687, '2024-08-03 20:56:03.703796+00', '2024-08-03 20:56:03.703796+00', 54, 5, NULL),
	(688, '2024-08-03 20:56:19.107319+00', '2024-08-03 20:56:19.107319+00', 54, 6, NULL),
	(689, '2024-08-03 20:56:19.107319+00', '2024-08-03 20:56:19.107319+00', 54, 7, NULL),
	(690, '2024-08-03 20:56:19.107319+00', '2024-08-03 20:56:19.107319+00', 54, 8, NULL),
	(691, '2024-08-03 20:56:19.107319+00', '2024-08-03 20:56:19.107319+00', 54, 9, NULL),
	(692, '2024-08-03 20:56:19.107319+00', '2024-08-03 20:56:19.107319+00', 54, 10, NULL),
	(710, '2024-08-06 03:15:39.496827+00', '2024-08-06 03:15:39.496827+00', 59, 1, NULL),
	(711, '2024-08-06 03:15:39.496827+00', '2024-08-06 03:15:39.496827+00', 59, 2, NULL),
	(712, '2024-08-06 03:15:39.496827+00', '2024-08-06 03:15:39.496827+00', 59, 3, NULL),
	(713, '2024-08-06 03:15:39.496827+00', '2024-08-06 03:15:39.496827+00', 59, 4, NULL),
	(714, '2024-08-06 03:15:39.496827+00', '2024-08-06 03:15:39.496827+00', 59, 5, NULL),
	(715, '2024-08-06 03:15:39.496827+00', '2024-08-06 03:15:39.496827+00', 59, 6, NULL),
	(716, '2024-08-06 03:15:39.496827+00', '2024-08-06 03:15:39.496827+00', 59, 7, NULL),
	(717, '2024-08-06 03:15:39.496827+00', '2024-08-06 03:15:39.496827+00', 59, 8, NULL),
	(718, '2024-08-06 03:15:39.496827+00', '2024-08-06 03:15:39.496827+00', 59, 9, NULL),
	(719, '2024-08-06 03:15:39.496827+00', '2024-08-06 03:15:39.496827+00', 59, 10, NULL),
	(694, '2024-08-06 03:14:19.050172+00', '2024-08-06 03:35:37.441733+00', 56, 1, NULL),
	(693, '2024-08-06 03:14:19.050172+00', '2024-08-06 03:35:37.441733+00', 56, 2, NULL),
	(709, '2024-08-06 03:15:09.683516+00', '2024-08-06 03:35:55.191582+00', 58, 1, NULL),
	(706, '2024-08-06 03:15:09.683516+00', '2024-08-06 04:30:26.206111+00', 58, 2, NULL),
	(705, '2024-08-06 03:15:09.683516+00', '2024-08-06 04:30:26.206111+00', 58, 3, NULL),
	(698, '2024-08-06 03:14:46.466438+00', '2024-08-06 04:20:04.354296+00', 57, 3, NULL),
	(699, '2024-08-06 03:14:46.466438+00', '2024-08-06 04:20:04.354296+00', 57, 4, NULL),
	(707, '2024-08-06 03:15:09.683516+00', '2024-08-06 04:30:26.206111+00', 58, 4, NULL),
	(708, '2024-08-06 03:15:09.683516+00', '2024-08-06 04:30:26.206111+00', 58, 5, NULL),
	(731, '2024-08-06 04:30:06.927133+00', '2024-08-06 04:30:06.927133+00', 57, 9, NULL),
	(732, '2024-08-06 04:30:06.927133+00', '2024-08-06 04:30:06.927133+00', 57, 10, NULL),
	(697, '2024-08-06 03:14:46.466438+00', '2024-08-06 04:30:06.927133+00', 57, 1, NULL),
	(703, '2024-08-06 03:14:46.466438+00', '2024-08-06 04:30:06.927133+00', 57, 2, NULL),
	(700, '2024-08-06 03:14:46.466438+00', '2024-08-06 04:30:06.927133+00', 57, 5, NULL),
	(701, '2024-08-06 03:14:46.466438+00', '2024-08-06 04:30:06.927133+00', 57, 6, NULL),
	(702, '2024-08-06 03:14:46.466438+00', '2024-08-06 04:30:06.927133+00', 57, 7, NULL),
	(730, '2024-08-06 04:20:04.354296+00', '2024-08-06 04:30:06.927133+00', 57, 8, NULL),
	(1337, '2026-05-12 23:11:14.310732+00', '2026-05-12 23:11:14.310732+00', 60, 1, 'Team 1'),
	(1338, '2026-05-12 23:11:14.310732+00', '2026-05-12 23:11:14.310732+00', 60, 2, 'Team 2'),
	(1339, '2026-05-12 23:11:14.310732+00', '2026-05-12 23:11:14.310732+00', 60, 3, 'Team 3'),
	(1340, '2026-05-12 23:11:14.310732+00', '2026-05-12 23:11:14.310732+00', 60, 4, 'Team 4'),
	(1341, '2026-05-12 23:11:14.310732+00', '2026-05-12 23:11:14.310732+00', 60, 5, 'Team 5'),
	(1342, '2026-05-12 23:11:14.310732+00', '2026-05-12 23:11:14.310732+00', 60, 6, 'Team 6'),
	(1343, '2026-05-12 23:11:14.310732+00', '2026-05-12 23:11:14.310732+00', 60, 7, 'Team 7'),
	(1344, '2026-05-12 23:11:14.310732+00', '2026-05-12 23:11:14.310732+00', 60, 8, 'Team 8'),
	(1345, '2026-05-12 23:11:14.310732+00', '2026-05-12 23:11:14.310732+00', 60, 9, 'Team 9'),
	(1346, '2026-05-12 23:11:14.310732+00', '2026-05-12 23:11:14.310732+00', 60, 10, 'Team 10'),
	(1349, '2026-06-09 23:10:00.991165+00', '2026-06-09 23:10:00.991165+00', 76, 1, 'Team 1'),
	(1350, '2026-06-09 23:10:00.991165+00', '2026-06-09 23:10:00.991165+00', 76, 2, 'Team 2');


--
-- Data for Name: event_participant; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."event_participant" ("id", "created_at", "updated_at", "team_id", "player_id") VALUES
	(130, '2024-06-18 01:30:58.132759+00', '2024-06-22 01:00:36.208956+00', 639, 49),
	(129, '2024-06-18 01:30:58.132759+00', '2024-06-22 01:02:15.332319+00', 642, 54),
	(126, '2024-06-18 01:30:58.132759+00', '2024-06-23 03:32:30.898996+00', 644, 48),
	(128, '2024-06-18 01:30:58.132759+00', '2024-06-23 03:32:30.898996+00', 646, 51),
	(127, '2024-06-18 01:30:58.132759+00', '2024-06-23 03:32:30.898996+00', 645, 50),
	(139, '2024-06-19 02:36:17.774021+00', '2024-06-23 03:32:35.906842+00', 647, 53),
	(141, '2024-06-25 22:17:05.879373+00', '2024-06-25 22:17:05.879373+00', 648, 54),
	(143, '2024-06-25 22:17:05.879373+00', '2024-06-25 22:17:05.879373+00', 651, 50),
	(144, '2024-06-25 22:17:05.879373+00', '2024-06-25 22:17:05.879373+00', 649, 48),
	(146, '2024-06-26 17:30:15.137098+00', '2024-06-26 17:30:15.137098+00', 657, 53),
	(147, '2024-06-26 17:30:15.137098+00', '2024-06-26 17:30:15.137098+00', 655, 54),
	(148, '2024-06-26 17:30:15.137098+00', '2024-06-26 17:30:15.137098+00', 659, 51),
	(149, '2024-06-26 17:30:15.137098+00', '2024-06-26 17:30:15.137098+00', 654, 49),
	(150, '2024-06-26 17:30:15.137098+00', '2024-06-26 17:30:15.137098+00', 658, 50),
	(151, '2024-06-26 17:30:15.137098+00', '2024-06-26 17:30:15.137098+00', 656, 48),
	(140, '2024-06-25 22:17:05.879373+00', '2024-06-26 22:08:58.544733+00', 649, 53),
	(145, '2024-06-25 22:17:05.879373+00', '2024-06-26 22:09:03.107224+00', 648, 51),
	(142, '2024-06-25 22:17:05.879373+00', '2024-06-26 22:09:07.007427+00', 651, 49),
	(152, '2024-07-01 03:18:53.049308+00', '2024-07-01 03:18:53.049308+00', 660, 49),
	(157, '2024-07-01 03:18:53.049308+00', '2024-07-01 03:18:53.049308+00', 661, 50),
	(155, '2024-07-01 03:18:53.049308+00', '2024-07-01 19:24:31.639723+00', 663, 54),
	(154, '2024-07-01 03:18:53.049308+00', '2024-07-01 19:24:31.639723+00', 662, 51),
	(153, '2024-07-01 03:18:53.049308+00', '2024-07-01 20:17:42.502583+00', 665, 53),
	(156, '2024-07-01 03:18:53.049308+00', '2024-07-01 20:17:42.502583+00', 664, 48),
	(158, '2024-07-11 14:50:11.239571+00', '2024-07-11 14:50:11.239571+00', 670, 76),
	(159, '2024-07-11 14:50:11.239571+00', '2024-07-11 14:50:11.239571+00', 667, 48),
	(160, '2024-07-11 14:50:11.239571+00', '2024-07-11 14:50:11.239571+00', 666, 51),
	(161, '2024-07-11 14:50:11.239571+00', '2024-07-11 14:50:11.239571+00', 666, 53),
	(162, '2024-07-11 14:50:11.239571+00', '2024-07-11 14:50:11.239571+00', 669, 50),
	(163, '2024-07-11 14:50:11.239571+00', '2024-07-11 14:50:11.239571+00', 667, 49),
	(164, '2024-07-11 14:50:11.239571+00', '2024-07-11 14:50:11.239571+00', 668, 54),
	(165, '2024-07-12 06:06:51.307827+00', '2024-07-12 06:06:51.307827+00', 671, 51),
	(166, '2024-08-03 20:51:24.221933+00', '2024-08-03 20:51:24.221933+00', 672, 86),
	(167, '2024-08-03 20:51:24.221933+00', '2024-08-03 20:51:24.221933+00', 673, 80),
	(169, '2024-08-03 20:51:24.221933+00', '2024-08-03 20:51:24.221933+00', 675, 82),
	(174, '2024-08-03 20:51:24.221933+00', '2024-08-03 20:55:12.990072+00', 678, 81),
	(171, '2024-08-03 20:51:24.221933+00', '2024-08-03 20:55:12.990072+00', 676, 77),
	(175, '2024-08-03 20:51:24.221933+00', '2024-08-03 20:55:26.437534+00', 677, 78),
	(168, '2024-08-03 20:51:24.221933+00', '2024-08-03 20:55:32.76485+00', 679, 83),
	(173, '2024-08-03 20:51:24.221933+00', '2024-08-03 20:55:32.76485+00', 680, 85),
	(172, '2024-08-03 20:51:24.221933+00', '2024-08-03 20:55:40.708297+00', 682, 79),
	(170, '2024-08-03 20:51:24.221933+00', '2024-08-03 20:55:40.708297+00', 681, 84),
	(176, '2024-08-03 20:56:03.703796+00', '2024-08-03 20:56:03.703796+00', 685, 83),
	(177, '2024-08-03 20:56:03.703796+00', '2024-08-03 20:56:03.703796+00', 684, 85),
	(178, '2024-08-03 20:56:03.703796+00', '2024-08-03 20:56:03.703796+00', 683, 86),
	(179, '2024-08-03 20:56:03.703796+00', '2024-08-03 20:56:03.703796+00', 687, 80),
	(180, '2024-08-03 20:56:03.703796+00', '2024-08-03 20:56:03.703796+00', 686, 84),
	(181, '2024-08-03 20:56:19.107319+00', '2024-08-03 20:56:19.107319+00', 689, 82),
	(182, '2024-08-03 20:56:19.107319+00', '2024-08-03 20:56:19.107319+00', 692, 77),
	(183, '2024-08-03 20:56:19.107319+00', '2024-08-03 20:56:19.107319+00', 688, 81),
	(184, '2024-08-03 20:56:19.107319+00', '2024-08-03 20:56:19.107319+00', 690, 79),
	(185, '2024-08-03 20:56:19.107319+00', '2024-08-03 20:56:19.107319+00', 691, 78),
	(186, '2024-08-06 03:14:19.050172+00', '2024-08-06 03:14:19.050172+00', 694, 94),
	(187, '2024-08-06 03:14:19.050172+00', '2024-08-06 03:14:19.050172+00', 693, 92),
	(188, '2024-08-06 03:14:19.050172+00', '2024-08-06 03:14:19.050172+00', 694, 95),
	(189, '2024-08-06 03:14:19.050172+00', '2024-08-06 03:14:19.050172+00', 693, 88),
	(192, '2024-08-06 03:14:19.050172+00', '2024-08-06 03:14:19.050172+00', 693, 96),
	(193, '2024-08-06 03:14:19.050172+00', '2024-08-06 03:14:19.050172+00', 694, 90),
	(194, '2024-08-06 03:14:19.050172+00', '2024-08-06 03:14:19.050172+00', 694, 87),
	(195, '2024-08-06 03:14:19.050172+00', '2024-08-06 03:14:19.050172+00', 693, 93),
	(197, '2024-08-06 03:14:46.466438+00', '2024-08-06 03:14:46.466438+00', 699, 94),
	(199, '2024-08-06 03:14:46.466438+00', '2024-08-06 03:14:46.466438+00', 698, 93),
	(200, '2024-08-06 03:14:46.466438+00', '2024-08-06 03:14:46.466438+00', 701, 90),
	(201, '2024-08-06 03:14:46.466438+00', '2024-08-06 03:14:46.466438+00', 700, 89),
	(202, '2024-08-06 03:14:46.466438+00', '2024-08-06 03:14:46.466438+00', 702, 91),
	(204, '2024-08-06 03:14:46.466438+00', '2024-08-06 03:14:46.466438+00', 697, 92),
	(206, '2024-08-06 03:15:09.683516+00', '2024-08-06 03:15:09.683516+00', 706, 88),
	(208, '2024-08-06 03:15:09.683516+00', '2024-08-06 03:15:09.683516+00', 709, 93),
	(209, '2024-08-06 03:15:09.683516+00', '2024-08-06 03:15:09.683516+00', 707, 87),
	(211, '2024-08-06 03:15:09.683516+00', '2024-08-06 03:15:09.683516+00', 709, 91),
	(212, '2024-08-06 03:15:09.683516+00', '2024-08-06 03:15:09.683516+00', 705, 95),
	(213, '2024-08-06 03:15:09.683516+00', '2024-08-06 03:15:09.683516+00', 708, 90),
	(214, '2024-08-06 03:15:09.683516+00', '2024-08-06 03:15:09.683516+00', 707, 94),
	(216, '2024-08-06 03:15:39.496827+00', '2024-08-06 03:15:39.496827+00', 716, 91),
	(217, '2024-08-06 03:15:39.496827+00', '2024-08-06 03:15:39.496827+00', 715, 90),
	(218, '2024-08-06 03:15:39.496827+00', '2024-08-06 03:15:39.496827+00', 710, 87),
	(219, '2024-08-06 03:15:39.496827+00', '2024-08-06 03:15:39.496827+00', 718, 89),
	(220, '2024-08-06 03:15:39.496827+00', '2024-08-06 03:15:39.496827+00', 714, 95),
	(221, '2024-08-06 03:15:39.496827+00', '2024-08-06 03:15:39.496827+00', 711, 96),
	(222, '2024-08-06 03:15:39.496827+00', '2024-08-06 03:15:39.496827+00', 717, 92),
	(223, '2024-08-06 03:15:39.496827+00', '2024-08-06 03:15:39.496827+00', 719, 88),
	(224, '2024-08-06 03:15:39.496827+00', '2024-08-06 03:15:39.496827+00', 713, 94),
	(225, '2024-08-06 03:15:39.496827+00', '2024-08-06 03:15:39.496827+00', 712, 93),
	(190, '2024-08-06 03:14:19.050172+00', '2024-08-06 03:35:37.441733+00', 693, 89),
	(191, '2024-08-06 03:14:19.050172+00', '2024-08-06 03:35:37.441733+00', 694, 91),
	(207, '2024-08-06 03:15:09.683516+00', '2024-08-06 03:35:55.191582+00', 708, 89),
	(205, '2024-08-06 03:14:46.466438+00', '2024-08-06 04:20:04.354296+00', 730, 88),
	(198, '2024-08-06 03:14:46.466438+00', '2024-08-06 04:30:06.927133+00', 731, 95),
	(196, '2024-08-06 03:14:46.466438+00', '2024-08-06 04:30:06.927133+00', 703, 96),
	(203, '2024-08-06 03:14:46.466438+00', '2024-08-06 04:30:06.927133+00', 732, 87),
	(215, '2024-08-06 03:15:09.683516+00', '2024-08-06 04:30:26.206111+00', 705, 92),
	(210, '2024-08-06 03:15:09.683516+00', '2024-08-06 04:30:26.206111+00', 706, 96),
	(1012, '2026-05-12 23:11:14.310732+00', '2026-05-12 23:11:14.310732+00', 1337, 89),
	(1013, '2026-05-12 23:11:14.310732+00', '2026-05-12 23:11:14.310732+00', 1338, 87),
	(1014, '2026-05-12 23:11:14.310732+00', '2026-05-12 23:11:14.310732+00', 1339, 88),
	(1015, '2026-05-12 23:11:14.310732+00', '2026-05-12 23:11:14.310732+00', 1340, 90),
	(1016, '2026-05-12 23:11:14.310732+00', '2026-05-12 23:11:14.310732+00', 1341, 93),
	(1017, '2026-05-12 23:11:14.310732+00', '2026-05-12 23:11:14.310732+00', 1342, 95),
	(1018, '2026-05-12 23:11:14.310732+00', '2026-05-12 23:11:14.310732+00', 1343, 94),
	(1019, '2026-05-12 23:11:14.310732+00', '2026-05-12 23:11:14.310732+00', 1344, 92),
	(1020, '2026-05-12 23:11:14.310732+00', '2026-05-12 23:11:14.310732+00', 1345, 91),
	(1021, '2026-05-12 23:11:14.310732+00', '2026-05-12 23:11:14.310732+00', 1346, 96),
	(1033, '2026-06-09 23:10:00.991165+00', '2026-06-09 23:10:00.991165+00', 1349, 110),
	(1034, '2026-06-09 23:10:00.991165+00', '2026-06-09 23:10:00.991165+00', 1350, 113),
	(1035, '2026-06-09 23:10:00.991165+00', '2026-06-09 23:10:00.991165+00', 1349, 119),
	(1036, '2026-06-09 23:10:00.991165+00', '2026-06-09 23:10:00.991165+00', 1350, 117),
	(1037, '2026-06-09 23:10:00.991165+00', '2026-06-09 23:10:00.991165+00', 1349, 111),
	(1038, '2026-06-09 23:10:00.991165+00', '2026-06-09 23:10:00.991165+00', 1350, 112),
	(1039, '2026-06-09 23:10:00.991165+00', '2026-06-09 23:10:00.991165+00', 1349, 109),
	(1040, '2026-06-09 23:10:00.991165+00', '2026-06-09 23:10:00.991165+00', 1350, 114),
	(1041, '2026-06-09 23:10:00.991165+00', '2026-06-09 23:10:00.991165+00', 1349, 118),
	(1042, '2026-06-09 23:10:00.991165+00', '2026-06-09 23:10:00.991165+00', 1350, 116),
	(1043, '2026-06-09 23:10:00.991165+00', '2026-06-09 23:10:00.991165+00', 1349, 115);


--
-- Data for Name: event_team_round_score; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."event_team_round_score" ("id", "created_at", "updated_at", "team_id", "round_number", "score") VALUES
	(45, '2024-07-06 23:05:53.286388+00', '2024-07-07 13:08:05.444854+00', 639, 1, 0),
	(57, '2024-07-06 23:30:53.458633+00', '2024-07-07 13:08:05.444854+00', 646, 1, 0),
	(58, '2024-07-06 23:30:53.458633+00', '2024-07-07 13:08:05.444854+00', 647, 1, 0),
	(36, '2024-07-01 03:38:05.567698+00', '2024-07-01 03:38:05.567698+00', 660, 1, 4),
	(37, '2024-07-01 03:38:05.567698+00', '2024-07-01 03:38:05.567698+00', 661, 1, 0),
	(56, '2024-07-06 23:30:53.458633+00', '2024-07-07 13:08:05.444854+00', 645, 1, 2),
	(104, '2024-07-07 00:47:18.716322+00', '2024-07-07 13:08:05.444854+00', 642, 1, 0),
	(55, '2024-07-06 23:30:53.458633+00', '2024-07-07 13:08:05.444854+00', 644, 1, 0),
	(163, '2024-07-12 06:09:34.063953+00', '2024-07-12 06:21:33.128548+00', 671, 1, 5),
	(166, '2024-07-12 06:25:40.776801+00', '2024-07-12 06:25:40.776801+00', 654, 1, 1),
	(167, '2024-07-12 06:25:40.776801+00', '2024-07-12 06:25:40.776801+00', 655, 1, 2),
	(168, '2024-07-12 06:25:40.776801+00', '2024-07-12 06:25:40.776801+00', 656, 1, 3),
	(169, '2024-07-12 06:25:40.776801+00', '2024-07-12 06:25:40.776801+00', 657, 1, 3),
	(170, '2024-07-12 06:25:40.776801+00', '2024-07-12 06:25:40.776801+00', 658, 1, 2),
	(171, '2024-07-12 06:25:40.776801+00', '2024-07-12 06:25:40.776801+00', 659, 1, 4),
	(2, '2024-06-26 00:54:11.327346+00', '2024-07-13 06:45:05.549514+00', 648, 1, 1),
	(3, '2024-06-26 00:54:11.327346+00', '2024-07-13 06:45:05.549514+00', 649, 1, 2),
	(24, '2024-06-26 16:41:24.777177+00', '2024-07-13 07:02:12.925719+00', 651, 1, 3),
	(175, '2024-08-06 04:06:37.56453+00', '2024-08-06 04:06:37.56453+00', 707, 1, 6),
	(176, '2024-08-06 04:06:37.56453+00', '2024-08-06 04:06:37.56453+00', 708, 1, 5),
	(177, '2024-08-06 04:06:37.56453+00', '2024-08-06 04:06:37.56453+00', 709, 1, 4),
	(178, '2024-08-06 04:06:37.56453+00', '2024-08-06 04:06:37.56453+00', 705, 1, 3),
	(179, '2024-08-06 04:06:37.56453+00', '2024-08-06 04:06:37.56453+00', 706, 1, 2),
	(180, '2024-08-06 04:32:31.603888+00', '2025-05-03 14:49:39.160916+00', 710, 1, 10),
	(181, '2024-08-06 04:32:31.603888+00', '2025-05-03 14:49:39.160916+00', 711, 1, 9),
	(182, '2024-08-06 04:32:31.603888+00', '2025-05-03 14:49:39.160916+00', 712, 1, 8),
	(183, '2024-08-06 04:32:31.603888+00', '2025-05-03 14:49:39.160916+00', 713, 1, 7),
	(184, '2024-08-06 04:32:31.603888+00', '2025-05-03 14:49:39.160916+00', 714, 1, 6),
	(185, '2024-08-06 04:32:31.603888+00', '2025-05-03 14:49:39.160916+00', 715, 1, 5),
	(186, '2024-08-06 04:32:31.603888+00', '2025-05-03 14:49:39.160916+00', 716, 1, 4),
	(187, '2024-08-06 04:32:31.603888+00', '2025-05-03 14:49:39.160916+00', 717, 1, 3),
	(188, '2024-08-06 04:32:31.603888+00', '2025-05-03 14:49:39.160916+00', 718, 1, 2),
	(189, '2024-08-06 04:32:31.603888+00', '2025-05-03 14:49:39.160916+00', 719, 1, 1),
	(200, '2025-05-03 16:14:41.120472+00', '2025-06-15 18:54:12.503518+00', 698, 1, 10),
	(201, '2025-05-03 16:14:41.120472+00', '2025-06-15 18:54:12.503518+00', 699, 1, 9),
	(202, '2025-05-03 16:14:41.120472+00', '2025-06-15 18:54:12.503518+00', 731, 1, 8),
	(203, '2025-05-03 16:14:41.120472+00', '2025-06-15 18:54:12.503518+00', 732, 1, 7),
	(204, '2025-05-03 16:14:41.120472+00', '2025-06-15 18:54:12.503518+00', 697, 1, 6),
	(205, '2025-05-03 16:14:41.120472+00', '2025-06-15 18:54:12.503518+00', 703, 1, 5),
	(206, '2025-05-03 16:14:41.120472+00', '2025-06-15 18:54:12.503518+00', 700, 1, 4),
	(207, '2025-05-03 16:14:41.120472+00', '2025-06-15 18:54:12.503518+00', 701, 1, 3),
	(208, '2025-05-03 16:14:41.120472+00', '2025-06-15 18:54:12.503518+00', 702, 1, 2),
	(209, '2025-05-03 16:14:41.120472+00', '2025-06-15 18:54:12.503518+00', 730, 1, 1),
	(227, '2026-06-09 23:39:29.028215+00', '2026-06-09 23:39:29.028215+00', 1349, 1, 25),
	(228, '2026-06-09 23:39:29.028215+00', '2026-06-09 23:39:29.028215+00', 1350, 1, 5);


--
-- Data for Name: game_state; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."game_state" ("id", "session_id", "round_number", "session_status", "game_master_user_id", "created_at", "updated_at", "round_phase") VALUES
	(1, 38, 1, 'in_progress', 'be62a737-ed9f-4e88-8e74-ee8310131818', '2024-04-30 21:46:21.453976+00', '2026-06-11 03:12:48.700908+00', 'gameboard_moves');


--
-- Data for Name: gameboard_move; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."gameboard_move" ("id", "player_id", "round_number", "distance_traveled", "gameboard_space_id", "created_at", "updated_at") VALUES
	(11, 48, 8, 1, 3, '2024-05-12 02:06:01.100534+00', '2024-05-12 02:06:01.100534+00'),
	(12, 49, 8, 1, 1, '2024-05-12 02:06:01.100534+00', '2024-05-12 02:06:01.100534+00'),
	(13, 50, 8, -4, 1, '2024-05-12 02:06:01.100534+00', '2024-05-12 02:06:01.100534+00'),
	(14, 51, 8, -1, 2, '2024-05-12 02:06:01.100534+00', '2024-05-12 02:06:01.100534+00'),
	(15, 53, 8, 2, 3, '2024-05-12 02:06:01.100534+00', '2024-05-12 02:06:01.100534+00'),
	(16, 54, 8, -1, 3, '2024-05-12 02:06:01.100534+00', '2024-05-12 02:06:01.100534+00'),
	(19, 49, 6, 1, 1, '2024-05-22 03:33:53.016535+00', '2024-05-22 03:33:53.016535+00'),
	(20, 50, 6, 1, 3, '2024-05-22 03:33:53.016535+00', '2024-05-22 03:33:53.016535+00'),
	(21, 51, 6, 1, 2, '2024-05-22 03:33:53.016535+00', '2024-05-22 03:33:53.016535+00'),
	(22, 49, 7, 3, 2, '2024-05-22 03:38:04.480341+00', '2024-05-22 03:38:04.480341+00'),
	(23, 51, 7, 3, 1, '2024-05-22 03:38:04.480341+00', '2024-05-22 03:38:04.480341+00'),
	(24, 53, 7, 1, 3, '2024-05-22 03:38:04.480341+00', '2024-05-22 03:38:04.480341+00'),
	(73, 48, 5, 1, 11, '2024-06-10 21:24:08.318737+00', '2024-06-10 21:24:08.318737+00'),
	(74, 49, 5, 1, 11, '2024-06-10 21:24:08.318737+00', '2024-06-10 21:24:08.318737+00'),
	(75, 50, 5, 1, 11, '2024-06-10 21:24:08.318737+00', '2024-06-10 21:24:08.318737+00'),
	(76, 51, 5, 1, 11, '2024-06-10 21:24:08.318737+00', '2024-06-10 21:24:08.318737+00'),
	(77, 53, 5, 1, 11, '2024-06-10 21:24:08.318737+00', '2024-06-10 21:24:08.318737+00'),
	(78, 54, 5, 1, 11, '2024-06-10 21:24:08.318737+00', '2024-06-10 21:24:08.318737+00'),
	(144, 48, 4, 1, 1, '2024-06-29 03:58:44.250159+00', '2024-06-29 03:58:44.250159+00'),
	(145, 49, 4, 1, 14, '2024-06-29 03:58:44.250159+00', '2024-06-29 03:58:44.250159+00'),
	(146, 50, 4, 1, 1, '2024-06-29 03:58:44.250159+00', '2024-06-29 03:58:44.250159+00'),
	(147, 51, 4, 1, 1, '2024-06-29 03:58:44.250159+00', '2024-06-29 03:58:44.250159+00'),
	(148, 53, 4, 1, 14, '2024-06-29 03:58:44.250159+00', '2024-06-29 03:58:44.250159+00'),
	(149, 54, 4, 1, 14, '2024-06-29 03:58:44.250159+00', '2024-06-29 03:58:44.250159+00'),
	(168, 48, 1, 1, 1, '2024-06-29 15:40:22.160768+00', '2024-06-29 15:40:22.160768+00'),
	(169, 49, 1, 1, 11, '2024-06-29 15:40:22.160768+00', '2024-06-29 15:40:22.160768+00'),
	(170, 50, 1, 1, 1, '2024-06-29 15:40:22.160768+00', '2024-06-29 15:40:22.160768+00'),
	(171, 51, 1, 1, 11, '2024-06-29 15:40:22.160768+00', '2024-06-29 15:40:22.160768+00'),
	(172, 53, 1, 1, 11, '2024-06-29 15:40:22.160768+00', '2024-06-29 15:40:22.160768+00'),
	(173, 54, 1, 1, 11, '2024-06-29 15:40:22.160768+00', '2024-06-29 15:40:22.160768+00'),
	(186, 48, 2, 3, 3, '2024-07-06 19:19:25.519189+00', '2024-07-06 19:19:25.519189+00'),
	(187, 49, 2, 1, 3, '2024-07-06 19:19:25.519189+00', '2024-07-06 19:19:25.519189+00'),
	(188, 50, 2, 1, 3, '2024-07-06 19:19:25.519189+00', '2024-07-06 19:19:25.519189+00'),
	(189, 51, 2, 1, 3, '2024-07-06 19:19:25.519189+00', '2024-07-06 19:19:25.519189+00'),
	(190, 53, 2, 1, 15, '2024-07-06 19:19:25.519189+00', '2024-07-06 19:19:25.519189+00'),
	(191, 54, 2, 1, 3, '2024-07-06 19:19:25.519189+00', '2024-07-06 19:19:25.519189+00'),
	(193, 48, 11, 1, 1, '2024-07-07 14:11:17.326037+00', '2024-07-07 14:11:17.326037+00'),
	(194, 49, 11, 1, 3, '2024-07-07 14:11:17.326037+00', '2024-07-07 14:11:17.326037+00'),
	(195, 50, 11, 1, 1, '2024-07-07 14:11:17.326037+00', '2024-07-07 14:11:17.326037+00'),
	(196, 51, 11, 1, 2, '2024-07-07 14:11:17.326037+00', '2024-07-07 14:11:17.326037+00'),
	(197, 53, 11, 1, 1, '2024-07-07 14:11:17.326037+00', '2024-07-07 14:11:17.326037+00'),
	(198, 54, 11, 1, 1, '2024-07-07 14:11:17.326037+00', '2024-07-07 14:11:17.326037+00'),
	(199, 48, 3, 1, 1, '2024-07-12 22:01:47.982381+00', '2024-07-12 22:01:47.982381+00'),
	(200, 49, 3, 1, 11, '2024-07-12 22:01:47.982381+00', '2024-07-12 22:01:47.982381+00'),
	(201, 50, 3, 1, 1, '2024-07-12 22:01:47.982381+00', '2024-07-12 22:01:47.982381+00'),
	(202, 51, 3, 1, 1, '2024-07-12 22:01:47.982381+00', '2024-07-12 22:01:47.982381+00'),
	(203, 53, 3, 1, 10, '2024-07-12 22:01:47.982381+00', '2024-07-12 22:01:47.982381+00'),
	(204, 54, 3, 1, 1, '2024-07-12 22:01:47.982381+00', '2024-07-12 22:01:47.982381+00'),
	(205, 76, 3, 1, 1, '2024-07-12 22:01:47.982381+00', '2024-07-12 22:01:47.982381+00'),
	(216, 87, 1, 4, 16, '2024-08-06 04:05:25.279024+00', '2024-08-06 04:05:25.279024+00'),
	(217, 88, 1, 2, 17, '2024-08-06 04:05:25.279024+00', '2024-08-06 04:05:25.279024+00'),
	(218, 89, 1, 5, 16, '2024-08-06 04:05:25.279024+00', '2024-08-06 04:05:25.279024+00'),
	(219, 90, 1, 2, 16, '2024-08-06 04:05:25.279024+00', '2024-08-06 04:05:25.279024+00'),
	(220, 91, 1, 5, 17, '2024-08-06 04:05:25.279024+00', '2024-08-06 04:05:25.279024+00'),
	(221, 92, 1, 7, 17, '2024-08-06 04:05:25.279024+00', '2024-08-06 04:05:25.279024+00'),
	(222, 93, 1, 6, 18, '2024-08-06 04:05:25.279024+00', '2024-08-06 04:05:25.279024+00'),
	(223, 94, 1, 2, 18, '2024-08-06 04:05:25.279024+00', '2024-08-06 04:05:25.279024+00'),
	(224, 95, 1, 4, 19, '2024-08-06 04:05:25.279024+00', '2024-08-06 04:05:25.279024+00'),
	(225, 96, 1, 2, 17, '2024-08-06 04:05:25.279024+00', '2024-08-06 04:05:25.279024+00'),
	(226, 87, 2, 3, 17, '2024-08-06 04:08:47.696683+00', '2024-08-06 04:08:47.696683+00'),
	(227, 88, 2, 3, 18, '2024-08-06 04:08:47.696683+00', '2024-08-06 04:08:47.696683+00'),
	(228, 89, 2, 2, 17, '2024-08-06 04:08:47.696683+00', '2024-08-06 04:08:47.696683+00'),
	(229, 90, 2, 5, 19, '2024-08-06 04:08:47.696683+00', '2024-08-06 04:08:47.696683+00'),
	(230, 91, 2, 10, 17, '2024-08-06 04:08:47.696683+00', '2024-08-06 04:08:47.696683+00'),
	(231, 92, 2, 1, 17, '2024-08-06 04:08:47.696683+00', '2024-08-06 04:08:47.696683+00'),
	(232, 93, 2, 8, 16, '2024-08-06 04:08:47.696683+00', '2024-08-06 04:08:47.696683+00'),
	(233, 94, 2, 2, 16, '2024-08-06 04:08:47.696683+00', '2024-08-06 04:08:47.696683+00'),
	(234, 95, 2, 5, 18, '2024-08-06 04:08:47.696683+00', '2024-08-06 04:08:47.696683+00'),
	(235, 96, 2, 2, 16, '2024-08-06 04:08:47.696683+00', '2024-08-06 04:08:47.696683+00'),
	(236, 87, 3, 3, 17, '2024-08-06 04:33:48.018227+00', '2024-08-06 04:33:48.018227+00'),
	(237, 88, 3, 1, 16, '2024-08-06 04:33:48.018227+00', '2024-08-06 04:33:48.018227+00'),
	(238, 89, 3, 3, 19, '2024-08-06 04:33:48.018227+00', '2024-08-06 04:33:48.018227+00'),
	(239, 90, 3, 1, 16, '2024-08-06 04:33:48.018227+00', '2024-08-06 04:33:48.018227+00'),
	(240, 91, 3, 6, 16, '2024-08-06 04:33:48.018227+00', '2024-08-06 04:33:48.018227+00'),
	(241, 92, 3, 1, 17, '2024-08-06 04:33:48.018227+00', '2024-08-06 04:33:48.018227+00'),
	(242, 93, 3, 4, 17, '2024-08-06 04:33:48.018227+00', '2024-08-06 04:33:48.018227+00'),
	(243, 94, 3, 7, 16, '2024-08-06 04:33:48.018227+00', '2024-08-06 04:33:48.018227+00'),
	(244, 95, 3, 3, 17, '2024-08-06 04:33:48.018227+00', '2024-08-06 04:33:48.018227+00'),
	(245, 96, 3, 4, 16, '2024-08-06 04:33:48.018227+00', '2024-08-06 04:33:48.018227+00'),
	(256, 87, 4, 1, 16, '2025-06-15 18:47:54.86806+00', '2025-06-15 18:47:54.86806+00'),
	(257, 88, 4, 1, 16, '2025-06-15 18:47:54.86806+00', '2025-06-15 18:47:54.86806+00'),
	(258, 89, 4, 1, 16, '2025-06-15 18:47:54.86806+00', '2025-06-15 18:47:54.86806+00'),
	(259, 90, 4, 1, 16, '2025-06-15 18:47:54.86806+00', '2025-06-15 18:47:54.86806+00'),
	(260, 91, 4, 1, 16, '2025-06-15 18:47:54.86806+00', '2025-06-15 18:47:54.86806+00'),
	(261, 92, 4, 1, 16, '2025-06-15 18:47:54.86806+00', '2025-06-15 18:47:54.86806+00'),
	(262, 93, 4, 1, 16, '2025-06-15 18:47:54.86806+00', '2025-06-15 18:47:54.86806+00'),
	(263, 94, 4, 1, 16, '2025-06-15 18:47:54.86806+00', '2025-06-15 18:47:54.86806+00'),
	(264, 95, 4, 1, 16, '2025-06-15 18:47:54.86806+00', '2025-06-15 18:47:54.86806+00'),
	(265, 96, 4, 1, 16, '2025-06-15 18:47:54.86806+00', '2025-06-15 18:47:54.86806+00'),
	(276, 87, 5, 3, 16, '2026-05-12 17:37:07.68149+00', '2026-05-12 17:37:07.68149+00'),
	(277, 88, 5, 6, 25, '2026-05-12 17:37:07.68149+00', '2026-05-12 17:37:07.68149+00'),
	(278, 89, 5, 1, 16, '2026-05-12 17:37:07.68149+00', '2026-05-12 17:37:07.68149+00'),
	(279, 90, 5, 1, 16, '2026-05-12 17:37:07.68149+00', '2026-05-12 17:37:07.68149+00'),
	(280, 91, 5, 4, 24, '2026-05-12 17:37:07.68149+00', '2026-05-12 17:37:07.68149+00'),
	(281, 92, 5, 6, 26, '2026-05-12 17:37:07.68149+00', '2026-05-12 17:37:07.68149+00'),
	(282, 93, 5, 2, 17, '2026-05-12 17:37:07.68149+00', '2026-05-12 17:37:07.68149+00'),
	(283, 94, 5, 2, 19, '2026-05-12 17:37:07.68149+00', '2026-05-12 17:37:07.68149+00'),
	(284, 95, 5, 17, 31, '2026-05-12 17:37:07.68149+00', '2026-05-12 17:37:07.68149+00'),
	(285, 96, 5, 1, 31, '2026-05-12 17:37:07.68149+00', '2026-05-12 17:37:07.68149+00'),
	(286, 109, 1, 2, 34, '2026-06-09 23:30:54.342407+00', '2026-06-09 23:30:54.342407+00'),
	(287, 110, 1, 3, 35, '2026-06-09 23:30:54.342407+00', '2026-06-09 23:30:54.342407+00'),
	(288, 111, 1, 1, 32, '2026-06-09 23:30:54.342407+00', '2026-06-09 23:30:54.342407+00'),
	(289, 112, 1, 1, 33, '2026-06-09 23:30:54.342407+00', '2026-06-09 23:30:54.342407+00'),
	(290, 113, 1, 1, 32, '2026-06-09 23:30:54.342407+00', '2026-06-09 23:30:54.342407+00'),
	(291, 114, 1, 2, 32, '2026-06-09 23:30:54.342407+00', '2026-06-09 23:30:54.342407+00'),
	(292, 115, 1, 4, 33, '2026-06-09 23:30:54.342407+00', '2026-06-09 23:30:54.342407+00'),
	(293, 116, 1, 2, 32, '2026-06-09 23:30:54.342407+00', '2026-06-09 23:30:54.342407+00'),
	(294, 117, 1, 4, 33, '2026-06-09 23:30:54.342407+00', '2026-06-09 23:30:54.342407+00'),
	(295, 118, 1, 3, 32, '2026-06-09 23:30:54.342407+00', '2026-06-09 23:30:54.342407+00'),
	(296, 119, 1, 1, 35, '2026-06-09 23:30:54.342407+00', '2026-06-09 23:30:54.342407+00');


--
-- Data for Name: player_round_score; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."player_round_score" ("id", "player_id", "round_number", "score", "created_at", "updated_at") VALUES
	(1, 48, 1, 0, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(2, 49, 1, -2, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(3, 50, 1, 3, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(5, 53, 1, 19, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(6, 54, 1, -7, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(94, 74, 1, 6, '2024-05-03 06:08:01.758304+00', '2024-05-03 06:08:01.758304+00'),
	(95, 75, 1, 9, '2024-05-03 06:08:01.758304+00', '2024-05-03 06:08:01.758304+00'),
	(114, 54, 3, 139, '2024-07-09 16:26:49.967899+00', '2024-07-09 16:26:49.967899+00'),
	(115, 51, 3, 360, '2024-07-09 16:26:49.967899+00', '2024-07-09 16:26:49.967899+00'),
	(43, 48, 2, 9, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(44, 49, 2, 1, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(45, 50, 2, 0, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(46, 51, 2, 2, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(47, 53, 2, 25, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(48, 54, 2, -5, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(56, 49, 4, 0, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(57, 50, 4, -66, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(58, 51, 4, 4, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(59, 53, 4, 23, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(60, 54, 4, -2, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(62, 49, 5, 0, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(63, 50, 5, -66, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(64, 51, 5, 1, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(65, 53, 5, 27, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(66, 54, 5, -2, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(116, 48, 3, 234, '2024-07-09 16:26:49.967899+00', '2024-07-09 16:26:49.967899+00'),
	(55, 48, 4, 100, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(61, 48, 5, 100, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(117, 53, 3, 314, '2024-07-09 16:26:49.967899+00', '2024-07-09 16:26:49.967899+00'),
	(70, 50, 7, -69, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(118, 50, 3, 77, '2024-07-09 16:26:49.967899+00', '2024-07-09 16:26:49.967899+00'),
	(72, 53, 7, 74, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(71, 51, 7, 9, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(68, 48, 7, -1, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(119, 49, 3, 160, '2024-07-09 16:26:49.967899+00', '2024-07-09 16:26:49.967899+00'),
	(69, 49, 7, 1, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(73, 54, 7, 0, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00'),
	(122, 51, 1, 393, '2024-07-12 06:25:09.920185+00', '2024-07-12 06:25:09.920185+00'),
	(123, 49, 10, 180, '2024-07-12 06:25:58.414202+00', '2024-07-12 06:25:58.414202+00'),
	(124, 54, 10, 142, '2024-07-12 06:25:58.414202+00', '2024-07-12 06:25:58.414202+00'),
	(125, 48, 10, 229, '2024-07-12 06:25:58.414202+00', '2024-07-12 06:25:58.414202+00'),
	(126, 53, 10, 327, '2024-07-12 06:25:58.414202+00', '2024-07-12 06:25:58.414202+00'),
	(127, 50, 10, 78, '2024-07-12 06:25:58.414202+00', '2024-07-12 06:25:58.414202+00'),
	(128, 51, 10, 396, '2024-07-12 06:25:58.414202+00', '2024-07-12 06:25:58.414202+00'),
	(129, 95, 1, 61, '2024-08-06 04:06:45.505731+00', '2024-08-06 04:06:45.505731+00'),
	(130, 96, 1, 11, '2024-08-06 04:06:45.505731+00', '2024-08-06 04:06:45.505731+00'),
	(131, 88, 1, -8, '2024-08-06 04:06:45.505731+00', '2024-08-06 04:06:45.505731+00'),
	(132, 92, 1, 12, '2024-08-06 04:06:45.505731+00', '2024-08-06 04:06:45.505731+00'),
	(133, 87, 1, 50, '2024-08-06 04:06:45.505731+00', '2024-08-06 04:06:45.505731+00'),
	(134, 94, 1, 45, '2024-08-06 04:06:45.505731+00', '2024-08-06 04:06:45.505731+00'),
	(135, 90, 1, 38, '2024-08-06 04:06:45.505731+00', '2024-08-06 04:06:45.505731+00'),
	(136, 89, 1, 37, '2024-08-06 04:06:45.505731+00', '2024-08-06 04:06:45.505731+00'),
	(137, 93, 1, 25, '2024-08-06 04:06:45.505731+00', '2024-08-06 04:06:45.505731+00'),
	(138, 91, 1, 15, '2024-08-06 04:06:45.505731+00', '2024-08-06 04:06:45.505731+00'),
	(139, 87, 2, 32, '2024-08-06 04:32:39.189135+00', '2024-08-06 04:32:39.189135+00'),
	(140, 96, 2, 25, '2024-08-06 04:32:39.189135+00', '2024-08-06 04:32:39.189135+00'),
	(141, 93, 2, 41, '2024-08-06 04:32:39.189135+00', '2024-08-06 04:32:39.189135+00'),
	(142, 94, 2, 63, '2024-08-06 04:32:39.189135+00', '2024-08-06 04:32:39.189135+00'),
	(143, 95, 2, 83, '2024-08-06 04:32:39.189135+00', '2024-08-06 04:32:39.189135+00'),
	(144, 90, 2, 70, '2024-08-06 04:32:39.189135+00', '2024-08-06 04:32:39.189135+00'),
	(145, 91, 2, 21, '2024-08-06 04:32:39.189135+00', '2024-08-06 04:32:39.189135+00'),
	(146, 92, 2, 22, '2024-08-06 04:32:39.189135+00', '2024-08-06 04:32:39.189135+00'),
	(147, 89, 2, 39, '2024-08-06 04:32:39.189135+00', '2024-08-06 04:32:39.189135+00'),
	(148, 88, 2, 32, '2024-08-06 04:32:39.189135+00', '2024-08-06 04:32:39.189135+00'),
	(149, 87, 3, 21, '2025-05-03 14:49:56.45061+00', '2025-05-03 14:49:56.45061+00'),
	(150, 96, 3, 38, '2025-05-03 14:49:56.45061+00', '2025-05-03 14:49:56.45061+00'),
	(151, 93, 3, 35, '2025-05-03 14:49:56.45061+00', '2025-05-03 14:49:56.45061+00'),
	(152, 94, 3, 84, '2025-05-03 14:49:56.45061+00', '2025-05-03 14:49:56.45061+00'),
	(153, 95, 3, 80, '2025-05-03 14:49:56.45061+00', '2025-05-03 14:49:56.45061+00'),
	(154, 90, 3, 92, '2025-05-03 14:49:56.45061+00', '2025-05-03 14:49:56.45061+00'),
	(155, 91, 3, 47, '2025-05-03 14:49:56.45061+00', '2025-05-03 14:49:56.45061+00'),
	(156, 92, 3, 33, '2025-05-03 14:49:56.45061+00', '2025-05-03 14:49:56.45061+00'),
	(157, 89, 3, 72, '2025-05-03 14:49:56.45061+00', '2025-05-03 14:49:56.45061+00'),
	(158, 88, 3, 72, '2025-05-03 14:49:56.45061+00', '2025-05-03 14:49:56.45061+00'),
	(179, 92, 4, 107, '2025-06-15 18:54:27.964075+00', '2025-06-15 18:54:27.964075+00'),
	(180, 93, 4, 145, '2025-06-15 18:54:27.964075+00', '2025-06-15 18:54:27.964075+00'),
	(181, 94, 4, 165, '2025-06-15 18:54:27.964075+00', '2025-06-15 18:54:27.964075+00'),
	(182, 89, 4, 125, '2025-06-15 18:54:27.964075+00', '2025-06-15 18:54:27.964075+00'),
	(183, 90, 4, 189, '2025-06-15 18:54:27.964075+00', '2025-06-15 18:54:27.964075+00'),
	(184, 91, 4, 139, '2025-06-15 18:54:27.964075+00', '2025-06-15 18:54:27.964075+00'),
	(185, 96, 4, 108, '2025-06-15 18:54:27.964075+00', '2025-06-15 18:54:27.964075+00'),
	(186, 88, 4, 134, '2025-06-15 18:54:27.964075+00', '2025-06-15 18:54:27.964075+00'),
	(187, 95, 4, 194, '2025-06-15 18:54:27.964075+00', '2025-06-15 18:54:27.964075+00'),
	(188, 87, 4, 102, '2025-06-15 18:54:27.964075+00', '2025-06-15 18:54:27.964075+00'),
	(195, 94, 5, 293, '2026-05-12 22:55:05.022139+00', '2026-05-12 22:55:05.022139+00'),
	(196, 95, 5, 250, '2026-05-12 22:55:05.022139+00', '2026-05-12 22:55:05.022139+00'),
	(197, 87, 5, 124, '2026-05-12 22:55:05.022139+00', '2026-05-12 22:55:05.022139+00'),
	(198, 91, 5, 179, '2026-05-12 22:55:05.022139+00', '2026-05-12 22:55:05.022139+00'),
	(199, 93, 5, 157, '2026-05-12 22:55:05.022139+00', '2026-05-12 22:55:05.022139+00'),
	(200, 88, 5, 164, '2026-05-12 22:55:05.022139+00', '2026-05-12 22:55:05.022139+00'),
	(201, 96, 5, 185, '2026-05-12 22:55:05.022139+00', '2026-05-12 22:55:05.022139+00'),
	(202, 109, 1, 61, '2026-06-09 23:41:03.307563+00', '2026-06-09 23:41:03.307563+00'),
	(203, 110, 1, 51, '2026-06-09 23:41:03.307563+00', '2026-06-09 23:41:03.307563+00'),
	(204, 111, 1, 40, '2026-06-09 23:41:03.307563+00', '2026-06-09 23:41:03.307563+00'),
	(205, 115, 1, 20, '2026-06-09 23:41:03.307563+00', '2026-06-09 23:41:03.307563+00'),
	(206, 118, 1, 40, '2026-06-09 23:41:03.307563+00', '2026-06-09 23:41:03.307563+00'),
	(207, 119, 1, 33, '2026-06-09 23:41:03.307563+00', '2026-06-09 23:41:03.307563+00'),
	(208, 112, 1, -10, '2026-06-09 23:41:03.307563+00', '2026-06-09 23:41:03.307563+00'),
	(209, 113, 1, 10, '2026-06-09 23:41:03.307563+00', '2026-06-09 23:41:03.307563+00'),
	(210, 114, 1, 10, '2026-06-09 23:41:03.307563+00', '2026-06-09 23:41:03.307563+00'),
	(211, 116, 1, 10, '2026-06-09 23:41:03.307563+00', '2026-06-09 23:41:03.307563+00'),
	(212, 117, 1, -10, '2026-06-09 23:41:03.307563+00', '2026-06-09 23:41:03.307563+00');


--
-- Data for Name: prize; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."prize" ("id", "session_id", "image_url", "won_by_player_id", "won_at", "created_at", "updated_at") VALUES
	(3, 35, 'https://jdwvtjrhfsciqttiueud.supabase.co/storage/v1/object/public/prize-images/35/1779160560257-161065070.webp', NULL, NULL, '2026-05-19 03:16:00.742685+00', '2026-05-19 03:19:11.57454+00'),
	(8, 37, 'https://jdwvtjrhfsciqttiueud.supabase.co/storage/v1/object/public/prize-images/37/1779162145093-820855492.webp', NULL, NULL, '2026-05-19 03:42:25.334795+00', '2026-05-19 03:42:25.334795+00'),
	(9, 1, 'https://jdwvtjrhfsciqttiueud.supabase.co/storage/v1/object/public/prize-images/1/1779162207259-594398624.webp', NULL, NULL, '2026-05-19 03:43:27.502761+00', '2026-05-19 03:43:37.745711+00'),
	(1, 35, 'https://jdwvtjrhfsciqttiueud.supabase.co/storage/v1/object/public/prize-images/35/1779160558499-88452675.webp', 96, '2026-05-20 02:11:50.556784+00', '2026-05-19 03:15:59.534043+00', '2026-05-20 02:11:50.556784+00'),
	(2, 35, 'https://jdwvtjrhfsciqttiueud.supabase.co/storage/v1/object/public/prize-images/35/1779160559633-954816158.webp', 96, '2026-05-20 02:14:33.703714+00', '2026-05-19 03:16:00.156008+00', '2026-05-20 02:14:33.703714+00'),
	(10, 38, 'https://jdwvtjrhfsciqttiueud.supabase.co/storage/v1/object/public/prize-images/35/1779160560257-161065070.webp', NULL, NULL, '2026-10-24 02:11:05.659366+00', '2026-10-24 02:11:05.659366+00'),
	(11, 38, 'https://jdwvtjrhfsciqttiueud.supabase.co/storage/v1/object/public/prize-images/37/1779162145093-820855492.webp', NULL, NULL, '2026-10-24 02:11:05.659366+00', '2026-10-24 02:11:05.659366+00'),
	(12, 38, 'https://jdwvtjrhfsciqttiueud.supabase.co/storage/v1/object/public/prize-images/1/1779162207259-594398624.webp', NULL, NULL, '2026-10-24 02:11:05.659366+00', '2026-10-24 02:11:05.659366+00');


--
-- Data for Name: rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."rules" ("id", "intro", "session_id", "created_at", "updated_at", "events", "gameboard", "special_space_events", "chaos_space_events") VALUES
	(7, '<h1>Welcome to The Buddies!</h1><p><strong>The Buddies™</strong> is a 4-day competitive extravaganza, similar in style to this niche video game called <em>Mario Farty</em>, or something like that.</p><p>There are a few ground rules we need to go over:</p><ol><li>No getting hurt</li><li>No bitching</li><li>Buddy has the final say in any rule disputes (see rule 2)</li></ol><p>With that out of the way, onto the rest:</p>', 19, '2024-04-30 21:46:21.453976+00', '2024-07-09 05:24:13.94794+00', '<p>These are the events</p>', '<p>We have a gameboard with lots of spaces on it</p>', '<p>When you land on a Special Space, a special event occurs:</p>', '<p>When you land on a Shit Space, a chaotic event occurs:</p>'),
	(1, '<p>asdfasdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdfsdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p>', 3, '2024-04-30 21:46:21.453976+00', '2024-04-30 21:46:21.453976+00', NULL, NULL, NULL, NULL),
	(19, '<h1>Test Heading</h1><p><u>asdf12</u></p><p><em>asdf</em></p><p><strong><em>knuj</em></strong></p><p>nowyuh</p><h2>Test Subheading</h2><ul><li>asdf</li><li>kshs</li><li>paiabz</li></ul><p>asdf</p><p>asdf</p><p>asdf</p><ol><li>asdf</li><li>oakaja</li><li>soqhvs</li><li>oaja</li><li>🫘💩😳</li></ol><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdfsdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p>', 32, '2024-05-03 06:04:00.353772+00', '2024-05-03 06:04:00.353772+00', NULL, NULL, NULL, NULL),
	(20, '<h1>Test Heading</h1><p><u>asdf12</u></p><p><em>asdf</em></p><p><strong><em>knuj</em></strong></p><p>nowyuh</p><h2>Test Subheading</h2><ul><li>asdf</li><li>kshs</li><li>paiabz</li></ul><p>asdf</p><p>asdf</p><p>asdf</p><ol><li>asdf</li><li>oakaja</li><li>soqhvs</li><li>oaja</li><li>🫘💩😳</li></ol><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdfsdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p><p>asdf</p>', 33, '2024-05-03 06:05:48.266577+00', '2024-05-03 06:05:48.266577+00', NULL, NULL, NULL, NULL),
	(23, '', 36, '2025-01-26 02:54:07.727123+00', '2025-01-26 02:54:07.727123+00', NULL, NULL, NULL, NULL),
	(21, '<h3>WELCOME TO THE FRIEND OLYMPICS!</h3><p>The only rules are to:</p><ol><li>Have fun!</li><li>Play with integrity.</li><li>Don&#39;t argue with the GM.</li></ol><p>testsfd. asfasdf</p>', 35, '2024-08-06 03:58:28.887126+00', '2025-07-15 01:31:57.799947+00', '<p>test asldkfjasdj fkjahsdkfj askdjfhaskdjfhaskjdhf ak lhasdfj ask dfa sdkf j hasdhfkajs kjahs khsf kjash kla</p>', '', '', ''),
	(24, '', 37, '2026-02-19 16:07:17.743372+00', '2026-02-19 16:07:17.743372+00', NULL, NULL, NULL, NULL),
	(25, '', 38, '2026-06-09 22:59:18.051947+00', '2026-06-09 23:43:20.451512+00', '<p>These are the events!</p>', '', '', '');


--
-- Data for Name: special_space_event_template; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."special_space_event_template" ("id", "session_id", "name", "description", "type", "details", "created_at", "updated_at") VALUES
	(4, 19, 'Flip Cup', 'Player plays flip cup with a single cup for 1 minute.', 'player_gains_points_based_on_game_score', '{"pointsLabelPlural": "flips", "pointsLabelSingular": "flip", "sessionPointsPerGamePoint": 2}', '2024-05-27 00:10:23.416335+00', '2024-05-27 00:10:23.416335+00'),
	(1, 19, 'Gain Points Based on Rank', 'Everyone gains points based on their current ranking. First place gets the fewest points, and last place gets the most points.', 'everyone_gains_points_based_on_rank', '{"lastPlacePoints": 24}', '2024-05-27 00:05:44.668077+00', '2024-05-27 00:05:44.668077+00'),
	(2, 19, 'Pong Toss', 'Player throws a ping pong ball into a cup as many times as they can in 1 minute.', 'player_gains_points_based_on_game_score', '{"pointsLabelPlural": "successful throws", "pointsLabelSingular": "successful throw", "sessionPointsPerGamePoint": 3}', '2024-05-27 00:07:29.361654+00', '2024-06-11 04:27:49.409467+00'),
	(3, 19, 'Pedometer Party', 'Get as many steps as you can in 30 seconds.', 'player_gains_points_based_on_game_score', '{"pointsLabelPlural": "steps", "pointsLabelSingular": "step", "sessionPointsPerGamePoint": 0.05}', '2024-05-27 00:08:28.364863+00', '2024-07-12 15:03:31.957185+00'),
	(5, 19, 'Poop Scoop', 'Scoop as many poops as you can in 1 minute', 'player_gains_points_based_on_game_score', '{"pointsLabelPlural": "poops scooped", "pointsLabelSingular": "poop scooped", "sessionPointsPerGamePoint": 0.05}', '2024-05-27 06:28:26.390256+00', '2024-07-12 21:56:19.979976+00'),
	(8, 35, 'Cup Toss', 'Toss a ping pong ball into a cup as many times as you can in a minute.', 'player_gains_points_based_on_game_score', '{"pointsLabelPlural": "successful tosses", "pointsLabelSingular": "successful toss", "sessionPointsPerGamePoint": 3}', '2024-08-06 03:49:06.370305+00', '2024-08-06 03:49:06.370305+00'),
	(9, 35, 'Flip Cup', 'Flip a plastic cup as many times as you can in a minute.', 'player_gains_points_based_on_game_score', '{"pointsLabelPlural": "successful flips", "pointsLabelSingular": "successful flip", "sessionPointsPerGamePoint": 2}', '2024-08-06 03:49:45.638457+00', '2024-08-06 03:49:45.638457+00'),
	(10, 36, 'Cup Toss', 'Toss a ping pong ball into a cup as many times as you can in a minute.', 'player_gains_points_based_on_game_score', '{"pointsLabelPlural": "successful tosses", "pointsLabelSingular": "successful toss", "sessionPointsPerGamePoint": 3}', '2025-01-26 02:54:07.727123+00', '2025-01-26 02:54:07.727123+00'),
	(11, 36, 'Flip Cup', 'Flip a plastic cup as many times as you can in a minute.', 'player_gains_points_based_on_game_score', '{"pointsLabelPlural": "successful flips", "pointsLabelSingular": "successful flip", "sessionPointsPerGamePoint": 2}', '2025-01-26 02:54:07.727123+00', '2025-01-26 02:54:07.727123+00'),
	(14, 35, 'Scream really loud', 'AH', 'player_gains_points_based_on_game_score', '{"pointsLabelPlural": "dB", "pointsLabelSingular": "dB", "sessionPointsPerGamePoint": 1}', '2025-06-05 00:36:10.137545+00', '2025-06-05 00:36:10.137545+00'),
	(15, 37, 'Cup Toss', 'Toss a ping pong ball into a cup as many times as you can in a minute.', 'player_gains_points_based_on_game_score', '{"pointsLabelPlural": "successful tosses", "pointsLabelSingular": "successful toss", "sessionPointsPerGamePoint": 3}', '2026-02-19 16:07:17.743372+00', '2026-02-19 16:07:17.743372+00'),
	(16, 37, 'Flip Cup', 'Flip a plastic cup as many times as you can in a minute.', 'player_gains_points_based_on_game_score', '{"pointsLabelPlural": "successful flips", "pointsLabelSingular": "successful flip", "sessionPointsPerGamePoint": 2}', '2026-02-19 16:07:17.743372+00', '2026-02-19 16:07:17.743372+00');


--
-- Data for Name: special_space_event; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."special_space_event" ("id", "session_id", "round_number", "player_id", "template_id", "status", "results", "created_at", "updated_at", "special_space_id") VALUES
	(2, 19, 4, 49, 3, 'finished', '{"score": 23}', '2024-05-27 18:16:04.215893+00', '2024-07-05 23:44:01.644652+00', 5),
	(3, 19, 4, 51, 4, 'finished', '{"score": 9}', '2024-05-27 18:16:04.215893+00', '2024-07-05 23:48:57.727604+00', 5),
	(5, 19, 5, 51, 1, 'finished', '{"48": 4, "49": 20, "50": 8, "51": 16, "53": 24, "54": 12}', '2024-06-01 04:58:08.956868+00', '2024-06-11 00:31:33.149254+00', 5),
	(6, 19, 3, 48, 1, 'finished', '{"48": 4, "49": 24, "50": 4, "51": 20, "53": 4, "54": 4}', '2024-06-12 02:30:56.965666+00', '2024-06-12 05:35:50.553685+00', 5),
	(4, 19, 3, 54, 5, 'in_progress', '{"score": 1}', '2024-05-27 18:16:04.215893+00', '2024-07-12 21:56:59.463597+00', 5),
	(12, 19, 3, 51, 4, 'finished', '{"score": 9}', '2024-06-29 03:40:36.141819+00', '2024-07-12 22:02:21.444698+00', 5),
	(13, 35, 3, 96, 9, 'waiting_to_begin', NULL, '2025-01-24 15:22:52.098863+00', '2025-01-24 15:22:52.098863+00', 17),
	(14, 35, 5, 91, 8, 'finished', '{"score": 6}', '2026-05-12 17:37:07.68149+00', '2026-05-12 22:52:14.803693+00', 24);


--
-- Data for Name: transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."transaction" ("id", "player_id", "num_points", "description", "created_at", "updated_at") VALUES
	(1, 48, 0, 'Points earned during round 1', '2024-04-21 05:30:05.567891+00', '2024-04-21 05:30:05.567891+00'),
	(2, 49, -2, 'Points earned during round 1', '2024-04-21 05:30:05.567891+00', '2024-04-21 05:30:05.567891+00'),
	(3, 50, 2, 'Points earned during round 1', '2024-04-21 05:30:05.567891+00', '2024-04-21 05:30:05.567891+00'),
	(4, 51, -2, 'Points earned during round 1', '2024-04-21 05:30:05.567891+00', '2024-04-21 05:30:05.567891+00'),
	(5, 53, 15, 'Points earned during round 1', '2024-04-21 05:30:05.567891+00', '2024-04-21 05:30:05.567891+00'),
	(6, 54, -10, 'Points earned during round 1', '2024-04-21 05:30:05.567891+00', '2024-04-21 05:30:05.567891+00'),
	(43, 48, 9, 'Points earned during round 2', '2024-04-21 05:47:31.419074+00', '2024-04-21 05:47:31.419074+00'),
	(44, 49, 3, 'Points earned during round 2', '2024-04-21 05:47:31.419074+00', '2024-04-21 05:47:31.419074+00'),
	(45, 50, -3, 'Points earned during round 2', '2024-04-21 05:47:31.419074+00', '2024-04-21 05:47:31.419074+00'),
	(46, 51, -6, 'Points earned during round 2', '2024-04-21 05:47:31.419074+00', '2024-04-21 05:47:31.419074+00'),
	(47, 53, 6, 'Points earned during round 2', '2024-04-21 05:47:31.419074+00', '2024-04-21 05:47:31.419074+00'),
	(48, 54, 2, 'Points earned during round 2', '2024-04-21 05:47:31.419074+00', '2024-04-21 05:47:31.419074+00'),
	(49, 48, 4, 'Points earned during round 3', '2024-04-21 06:36:57.326559+00', '2024-04-21 06:36:57.326559+00'),
	(50, 49, 0, 'Points earned during round 3', '2024-04-21 06:36:57.326559+00', '2024-04-21 06:36:57.326559+00'),
	(51, 50, 3, 'Points earned during round 3', '2024-04-21 06:36:57.326559+00', '2024-04-21 06:36:57.326559+00'),
	(52, 51, -1, 'Points earned during round 3', '2024-04-21 06:36:57.326559+00', '2024-04-21 06:36:57.326559+00'),
	(53, 53, -5, 'Points earned during round 3', '2024-04-21 06:36:57.326559+00', '2024-04-21 06:36:57.326559+00'),
	(54, 54, -1, 'Points earned during round 3', '2024-04-21 06:36:57.326559+00', '2024-04-21 06:36:57.326559+00'),
	(55, 48, 420, 'Points earned during round 4', '2024-04-21 06:38:54.693222+00', '2024-04-21 06:38:54.693222+00'),
	(56, 49, -1, 'Points earned during round 4', '2024-04-21 06:38:54.693222+00', '2024-04-21 06:38:54.693222+00'),
	(57, 50, -69, 'Points earned during round 4', '2024-04-21 06:38:54.693222+00', '2024-04-21 06:38:54.693222+00'),
	(58, 51, 3, 'Points earned during round 4', '2024-04-21 06:38:54.693222+00', '2024-04-21 06:38:54.693222+00'),
	(59, 53, 3, 'Points earned during round 4', '2024-04-21 06:38:54.693222+00', '2024-04-21 06:38:54.693222+00'),
	(60, 54, 4, 'Points earned during round 4', '2024-04-21 06:38:54.693222+00', '2024-04-21 06:38:54.693222+00'),
	(62, 49, 0, 'Points earned during round 5', '2024-04-22 17:11:38.725328+00', '2024-04-22 17:11:38.725328+00'),
	(63, 50, 0, 'Points earned during round 5', '2024-04-22 17:11:38.725328+00', '2024-04-22 17:11:38.725328+00'),
	(64, 51, -3, 'Points earned during round 5', '2024-04-22 17:11:38.725328+00', '2024-04-22 17:11:38.725328+00'),
	(65, 53, 4, 'Points earned during round 5', '2024-04-22 17:11:38.725328+00', '2024-04-22 17:11:38.725328+00'),
	(66, 54, 0, 'Points earned during round 5', '2024-04-22 17:11:38.725328+00', '2024-04-22 17:11:38.725328+00'),
	(68, 53, 1, 'GM Discretion: Have a point, bud', '2024-04-23 00:28:03.279109+00', '2024-04-23 00:28:03.279109+00'),
	(69, 53, 41, 'GM Discretion: Nice', '2024-04-23 00:28:56.606794+00', '2024-04-23 00:28:56.606794+00'),
	(72, 51, 10, 'GM Discretion: 👁❤️🐑', '2024-04-23 01:20:41.166633+00', '2024-04-23 01:20:41.166633+00'),
	(73, 51, 1, 'GM Discretion: Here is a single point. Don''t spend it all in one place...', '2024-04-23 01:32:02.354767+00', '2024-04-23 01:32:02.354767+00'),
	(74, 53, 7, 'GM Discretion: Lucky 7', '2024-04-23 02:01:10.067376+00', '2024-04-23 02:01:10.067376+00'),
	(75, 53, -7, 'GM Discretion: Nice', '2024-04-23 02:01:28.529447+00', '2024-04-23 02:01:28.529447+00'),
	(77, 48, 5, 'GM Discretion: Don’t spend it all in 1 place', '2024-04-23 03:01:04.426666+00', '2024-04-23 03:01:04.426666+00'),
	(78, 48, -420858, 'GM Discretion: I hate you', '2024-04-23 03:01:22.589492+00', '2024-04-23 03:01:22.589492+00'),
	(61, 48, 420420, 'Points earned during round 5', '2024-04-22 17:11:38.725328+00', '2024-04-22 17:11:38.725328+00'),
	(80, 53, 1, 'GM Discretion: Test override +1 point', '2024-04-28 17:56:56.448476+00', '2024-04-28 17:56:56.448476+00'),
	(81, 53, -1, 'GM Discretion: Test transaction set to 69', '2024-04-28 17:59:20.252452+00', '2024-04-28 17:59:20.252452+00'),
	(82, 48, -1, 'Points earned during round 7', '2024-04-28 18:02:08.298939+00', '2024-04-28 18:02:08.298939+00'),
	(83, 49, 1, 'Points earned during round 7', '2024-04-28 18:02:08.298939+00', '2024-04-28 18:02:08.298939+00'),
	(84, 50, -3, 'Points earned during round 7', '2024-04-28 18:02:08.298939+00', '2024-04-28 18:02:08.298939+00'),
	(85, 51, -3, 'Points earned during round 7', '2024-04-28 18:02:08.298939+00', '2024-04-28 18:02:08.298939+00'),
	(86, 53, 5, 'Points earned during round 7', '2024-04-28 18:02:08.298939+00', '2024-04-28 18:02:08.298939+00'),
	(87, 54, 2, 'Points earned during round 7', '2024-04-28 18:02:08.298939+00', '2024-04-28 18:02:08.298939+00'),
	(106, 74, 6, 'Points earned during round 1', '2024-05-03 06:08:01.758304+00', '2024-05-03 06:08:01.758304+00'),
	(107, 75, 9, 'Points earned during round 1', '2024-05-03 06:08:01.758304+00', '2024-05-03 06:08:01.758304+00'),
	(108, 74, 63, 'GM Discretion: Nice', '2024-05-03 06:09:19.798207+00', '2024-05-03 06:09:19.798207+00'),
	(109, 53, -5, 'GM Discretion: Funny number', '2024-05-03 07:49:07.371025+00', '2024-05-03 07:49:07.371025+00'),
	(110, 48, 10, 'Blue space on round 5', '2024-05-11 22:28:42.499109+00', '2024-05-11 22:28:42.499109+00'),
	(111, 53, -69, 'Bad-Luck Brown space on round 5', '2024-05-11 22:28:42.499109+00', '2024-05-11 22:28:42.499109+00'),
	(112, 48, 10, 'Blue space on round 5', '2024-05-11 22:30:37.108194+00', '2024-05-11 22:30:37.108194+00'),
	(113, 53, -69, 'Bad-Luck Brown space on round 5', '2024-05-11 22:30:37.108194+00', '2024-05-11 22:30:37.108194+00'),
	(114, 48, -69, 'Bad-Luck Brown space on round 8', '2024-05-12 00:41:36.690261+00', '2024-05-12 00:41:36.690261+00'),
	(115, 49, -69, 'Bad-Luck Brown space on round 8', '2024-05-12 00:41:36.690261+00', '2024-05-12 00:41:36.690261+00'),
	(116, 50, -69, 'Bad-Luck Brown space on round 8', '2024-05-12 00:41:36.690261+00', '2024-05-12 00:41:36.690261+00'),
	(117, 51, 0, 'Special space on round 8', '2024-05-12 00:41:36.690261+00', '2024-05-12 00:41:36.690261+00'),
	(118, 53, -10, 'Red space on round 8', '2024-05-12 00:41:36.690261+00', '2024-05-12 00:41:36.690261+00'),
	(119, 54, 10, 'Blue space on round 8', '2024-05-12 00:41:36.690261+00', '2024-05-12 00:41:36.690261+00'),
	(120, 48, -69, 'Bad-Luck Brown space on round 8', '2024-05-12 02:06:01.100534+00', '2024-05-12 02:06:01.100534+00'),
	(121, 49, 10, 'Blue space on round 8', '2024-05-12 02:06:01.100534+00', '2024-05-12 02:06:01.100534+00'),
	(122, 50, 10, 'Blue space on round 8', '2024-05-12 02:06:01.100534+00', '2024-05-12 02:06:01.100534+00'),
	(123, 51, -10, 'Red space on round 8', '2024-05-12 02:06:01.100534+00', '2024-05-12 02:06:01.100534+00'),
	(124, 53, -69, 'Bad-Luck Brown space on round 8', '2024-05-12 02:06:01.100534+00', '2024-05-12 02:06:01.100534+00'),
	(125, 54, -69, 'Bad-Luck Brown space on round 8', '2024-05-12 02:06:01.100534+00', '2024-05-12 02:06:01.100534+00'),
	(126, 49, 10, 'Blue space on round 6', '2024-05-22 03:33:53.016535+00', '2024-05-22 03:33:53.016535+00'),
	(127, 50, -69, 'Bad-Luck Brown space on round 6', '2024-05-22 03:33:53.016535+00', '2024-05-22 03:33:53.016535+00'),
	(128, 51, -10, 'Red space on round 6', '2024-05-22 03:33:53.016535+00', '2024-05-22 03:33:53.016535+00'),
	(129, 49, -10, 'Red space on round 7', '2024-05-22 03:38:04.480341+00', '2024-05-22 03:38:04.480341+00'),
	(130, 51, 10, 'Blue space on round 7', '2024-05-22 03:38:04.480341+00', '2024-05-22 03:38:04.480341+00'),
	(131, 53, -69, 'Bad-Luck Brown space on round 7', '2024-05-22 03:38:04.480341+00', '2024-05-22 03:38:04.480341+00'),
	(133, 51, -69, 'Bad-Luck Brown Space on turn 5', '2024-05-22 03:40:49.220245+00', '2024-05-22 03:41:34.70199+00'),
	(132, 50, 10, 'Blue Space on turn 5', '2024-05-22 03:40:49.220245+00', '2024-05-22 03:41:40.41568+00'),
	(134, 54, -10, 'Red Space on turn 5', '2024-05-22 03:40:49.220245+00', '2024-05-22 03:41:44.010899+00'),
	(135, 49, 10, 'Blue Space on turn 4', '2024-05-22 03:45:48.78374+00', '2024-05-22 03:45:48.78374+00'),
	(136, 50, -69, 'Bad-Luck Brown Space on turn 4', '2024-05-22 03:45:48.78374+00', '2024-05-22 03:45:48.78374+00'),
	(137, 54, 10, 'Blue Space on turn 4', '2024-05-22 03:45:48.78374+00', '2024-05-22 03:45:48.78374+00'),
	(138, 48, -69, 'Bad-Luck Brown Space on turn 4', '2024-05-22 04:36:42.160915+00', '2024-05-22 04:36:42.160915+00'),
	(139, 49, 10, 'Blue Space on turn 4', '2024-05-22 04:36:42.160915+00', '2024-05-22 04:36:42.160915+00'),
	(140, 53, -69, 'Bad-Luck Brown Space on turn 4', '2024-05-22 04:36:42.160915+00', '2024-05-22 04:36:42.160915+00'),
	(141, 49, -5, 'GM Discretion', '2024-05-26 15:47:31.701949+00', '2024-05-26 15:47:31.701949+00'),
	(142, 53, -5, 'GM Discretion', '2024-05-26 15:47:42.745385+00', '2024-05-26 15:47:42.745385+00'),
	(143, 51, -10, 'Red Space on turn 4', '2024-05-27 18:16:04.215893+00', '2024-05-27 18:16:04.215893+00'),
	(144, 53, 1, 'GM Discretion: Testing', '2024-05-29 03:06:28.706595+00', '2024-05-29 03:06:28.706595+00'),
	(151, 54, -17, 'GM Discretion: Testing ties when gaining points by rank', '2024-05-30 03:28:08.964803+00', '2024-05-30 03:28:08.964803+00'),
	(164, 48, 16, 'Buddy''s Jizz Space event for turn 4: Everyone gains points based on rank', '2024-05-30 03:39:43.034052+00', '2024-05-30 03:39:43.034052+00'),
	(165, 49, 4, 'Buddy''s Jizz Space event for turn 4: Everyone gains points based on rank', '2024-05-30 03:39:43.034052+00', '2024-05-30 03:39:43.034052+00'),
	(166, 50, 20, 'Buddy''s Jizz Space event for turn 4: Everyone gains points based on rank', '2024-05-30 03:39:43.034052+00', '2024-05-30 03:39:43.034052+00'),
	(167, 51, 8, 'Buddy''s Jizz Space event for turn 4: Everyone gains points based on rank', '2024-05-30 03:39:43.034052+00', '2024-05-30 03:39:43.034052+00'),
	(168, 53, 24, 'Buddy''s Jizz Space event for turn 4: Everyone gains points based on rank', '2024-05-30 03:39:43.034052+00', '2024-05-30 03:39:43.034052+00'),
	(169, 54, 8, 'Buddy''s Jizz Space event for turn 4: Everyone gains points based on rank', '2024-05-30 03:39:43.034052+00', '2024-05-30 03:39:43.034052+00'),
	(170, 53, 12, 'Special Space: 4 successful throws in Pong Toss', '2024-06-01 03:34:55.260307+00', '2024-06-01 03:34:55.260307+00'),
	(171, 53, 14, 'Special Space event for turn 4: 7 flips in Flip Cup', '2024-06-01 03:37:53.927384+00', '2024-06-01 03:37:53.927384+00'),
	(174, 48, 10, 'Blue Space on turn 5', '2024-06-01 04:58:08.956868+00', '2024-06-01 04:58:08.956868+00'),
	(175, 50, 10, 'Blue Space on turn 5', '2024-06-01 04:58:08.956868+00', '2024-06-01 04:58:08.956868+00'),
	(176, 54, 10, 'Blue Space on turn 5', '2024-06-01 04:58:08.956868+00', '2024-06-01 04:58:08.956868+00'),
	(177, 51, 20, 'Special Space event for turn 5: 4 poops scooped in Poop Scoop', '2024-06-01 04:59:38.020848+00', '2024-06-01 04:59:38.020848+00'),
	(178, 53, 336, 'GM Discretion', '2024-06-01 07:06:46.726411+00', '2024-06-01 07:06:46.726411+00'),
	(179, 48, 228, 'GM Discretion', '2024-06-01 07:07:00.484373+00', '2024-06-01 07:07:00.484373+00'),
	(184, 48, 59, 'Duel in turn 5: You beat Buddy in Cookie Face', '2024-06-01 07:27:43.148427+00', '2024-06-01 07:27:43.148427+00'),
	(185, 53, -59, 'Duel in turn 5: Josh beat you in Cookie Face', '2024-06-01 07:27:43.148427+00', '2024-06-01 07:27:43.148427+00'),
	(186, 49, -41, 'Duel in turn 5: You beat Timmy in One Strike', '2024-06-01 07:35:55.33241+00', '2024-06-01 07:35:55.33241+00'),
	(187, 50, 42, 'Duel in turn 5: Dan beat you in One Strike', '2024-06-01 07:35:55.33241+00', '2024-06-01 07:35:55.33241+00'),
	(188, 54, 68, 'GM Discretion', '2024-06-01 07:48:44.584777+00', '2024-06-01 07:48:44.584777+00'),
	(189, 48, -43, 'Duel in turn 5: Tyler beat you in Disc Golf Putting', '2024-06-01 07:49:11.354813+00', '2024-06-01 07:49:11.354813+00'),
	(190, 54, 43, 'Duel in turn 5: You beat Josh in Disc Golf Putting', '2024-06-01 07:49:11.354813+00', '2024-06-01 07:49:11.354813+00'),
	(191, 48, 10, 'Blue Space on turn 5', '2024-06-06 05:37:06.737782+00', '2024-06-06 05:37:06.737782+00'),
	(192, 49, 10, 'Blue Space on turn 5', '2024-06-06 05:37:06.737782+00', '2024-06-06 05:37:06.737782+00'),
	(193, 50, 10, 'Blue Space on turn 5', '2024-06-06 05:37:06.737782+00', '2024-06-06 05:37:06.737782+00'),
	(194, 54, 10, 'Blue Space on turn 5', '2024-06-06 05:37:06.737782+00', '2024-06-06 05:37:06.737782+00'),
	(195, 48, 27, 'Duel in turn 5: You beat Buddy in One Strike', '2024-06-06 05:37:21.830315+00', '2024-06-06 05:37:21.830315+00'),
	(196, 53, -27, 'Duel in turn 5: Josh beat you in One Strike', '2024-06-06 05:37:21.830315+00', '2024-06-06 05:37:21.830315+00'),
	(197, 48, 10, 'Blue Space on turn 5', '2024-06-06 05:40:49.56501+00', '2024-06-06 05:40:49.56501+00'),
	(198, 50, 10, 'Blue Space on turn 5', '2024-06-06 05:40:49.56501+00', '2024-06-06 05:40:49.56501+00'),
	(199, 51, 10, 'Blue Space on turn 5', '2024-06-06 05:40:49.56501+00', '2024-06-06 05:40:49.56501+00'),
	(200, 54, 10, 'Blue Space on turn 5', '2024-06-06 05:40:49.56501+00', '2024-06-06 05:40:49.56501+00'),
	(201, 48, -1, 'GM Discretion: Y', '2024-06-07 15:58:56.89932+00', '2024-06-07 15:58:56.89932+00'),
	(202, 53, -1, 'GM Discretion', '2024-06-07 16:01:00.626807+00', '2024-06-07 16:01:00.626807+00'),
	(203, 48, -1, 'GM Discretion', '2024-06-07 16:03:17.124389+00', '2024-06-07 16:03:17.124389+00'),
	(204, 54, -1, 'GM Discretion', '2024-06-07 16:07:10.802506+00', '2024-06-07 16:07:10.802506+00'),
	(205, 48, 1, 'GM Discretion', '2024-06-07 16:18:48.393417+00', '2024-06-07 16:18:48.393417+00'),
	(206, 54, -90, 'GM Discretion', '2024-06-10 19:58:06.289338+00', '2024-06-10 19:58:06.289338+00'),
	(207, 54, 90, 'GM Discretion', '2024-06-10 19:58:16.602152+00', '2024-06-10 19:58:16.602152+00'),
	(212, 53, -8, 'Dan''s Special Space event for turn 4: Lose undefined% of your points when you fail to task', '2024-06-10 20:34:52.079693+00', '2024-06-10 20:34:52.079693+00'),
	(213, 54, -10, 'Dan''s Special Space event for turn 4: Lose undefined% of your points when you fail to task', '2024-06-10 20:34:52.079693+00', '2024-06-10 20:34:52.079693+00'),
	(214, 53, -3, 'Bet against Tyler for ''123''', '2024-06-10 20:43:55.52751+00', '2024-06-10 20:43:55.52751+00'),
	(215, 54, -6, 'Bet against Buddy for ''123''', '2024-06-10 20:43:55.52751+00', '2024-06-10 20:43:55.52751+00'),
	(216, 48, -18, 'Dan''s Special Space event for turn 4: Lose 10% of your points when you fail to stand on 1 foot for 5 minutes', '2024-06-10 20:51:39.620451+00', '2024-06-10 20:51:39.620451+00'),
	(220, 53, -7, 'Dan''s Special Space event for turn 4: Lose 10% of your points when you fail to stand on 1 foot for 5 minutes', '2024-06-10 20:51:39.620451+00', '2024-06-10 20:51:39.620451+00'),
	(222, 48, -4, 'Bet against Tyler for ''New  form''', '2024-06-10 20:56:28.578207+00', '2024-06-10 20:56:28.578207+00'),
	(223, 54, -7, 'Bet against Josh for ''New  form''', '2024-06-10 20:56:28.578207+00', '2024-06-10 20:56:28.578207+00'),
	(224, 48, -15, 'Buddy''s Anus Space event for turn 5: Lose 10% of your points when you fail to stand on 1 foot for 5 minutes', '2024-06-10 21:01:35.383558+00', '2024-06-10 21:01:35.383558+00'),
	(228, 53, -6, 'Buddy''s Anus Space event for turn 5: Lose 10% of your points when you fail to stand on 1 foot for 5 minutes', '2024-06-10 21:01:35.383558+00', '2024-06-10 21:01:35.383558+00'),
	(234, 53, -6, 'Dan''s Anus Space event for turn 5: Lose 10% of your points if you fail to stand on 1 foot for 5 minutes', '2024-06-10 21:17:30.818701+00', '2024-06-10 21:17:30.818701+00'),
	(236, 48, 4, 'Josh''s Anus Space event for turn 5: Everyone gains points based on rank', '2024-06-10 21:26:30.908106+00', '2024-06-10 21:26:30.908106+00'),
	(237, 49, 20, 'Josh''s Anus Space event for turn 5: Everyone gains points based on rank', '2024-06-10 21:26:30.908106+00', '2024-06-10 21:26:30.908106+00'),
	(238, 50, 24, 'Josh''s Anus Space event for turn 5: Everyone gains points based on rank', '2024-06-10 21:26:30.908106+00', '2024-06-10 21:26:30.908106+00'),
	(239, 51, 16, 'Josh''s Anus Space event for turn 5: Everyone gains points based on rank', '2024-06-10 21:26:30.908106+00', '2024-06-10 21:26:30.908106+00'),
	(240, 53, 12, 'Josh''s Anus Space event for turn 5: Everyone gains points based on rank', '2024-06-10 21:26:30.908106+00', '2024-06-10 21:26:30.908106+00'),
	(241, 54, 8, 'Josh''s Anus Space event for turn 5: Everyone gains points based on rank', '2024-06-10 21:26:30.908106+00', '2024-06-10 21:26:30.908106+00'),
	(242, 48, -14, 'Dan''s Anus Space event for turn 5: Everyone 10% of their points', '2024-06-10 21:26:58.770152+00', '2024-06-10 21:26:58.770152+00'),
	(243, 49, 4, 'Dan''s Anus Space event for turn 5: Everyone 10% of their points', '2024-06-10 21:26:58.770152+00', '2024-06-10 21:26:58.770152+00'),
	(244, 50, 8, 'Dan''s Anus Space event for turn 5: Everyone 10% of their points', '2024-06-10 21:26:58.770152+00', '2024-06-10 21:26:58.770152+00'),
	(246, 53, -6, 'Dan''s Anus Space event for turn 5: Everyone 10% of their points', '2024-06-10 21:26:58.770152+00', '2024-06-10 21:26:58.770152+00'),
	(247, 54, -8, 'Dan''s Anus Space event for turn 5: Everyone 10% of their points', '2024-06-10 21:26:58.770152+00', '2024-06-10 21:26:58.770152+00'),
	(248, 48, -13, 'Adam P''s Anus Space event for turn 5: Lose 10% of your points if you fail to stand on 1 foot for 5 minutes', '2024-06-10 23:12:01.819761+00', '2024-06-10 23:12:01.819761+00'),
	(250, 50, 7, 'Adam P''s Anus Space event for turn 5: Lose 10% of your points if you fail to stand on 1 foot for 5 minutes', '2024-06-10 23:12:01.819761+00', '2024-06-10 23:12:01.819761+00'),
	(253, 54, -7, 'Adam P''s Anus Space event for turn 5: Lose 10% of your points if you fail to stand on 1 foot for 5 minutes', '2024-06-10 23:12:01.819761+00', '2024-06-10 23:12:01.819761+00'),
	(256, 50, 122, 'Buddy''s Anus Space event for turn 5: Buddy and Timmy swap points', '2024-06-10 23:43:03.680084+00', '2024-06-10 23:43:03.680084+00'),
	(258, 53, -122, 'Buddy''s Anus Space event for turn 5: Buddy and Timmy swap points', '2024-06-10 23:43:03.680084+00', '2024-06-10 23:43:03.680084+00'),
	(260, 48, 4, 'Tyler''s Anus Space event for turn 5: Everyone gains points based on rank', '2024-06-10 23:43:41.195183+00', '2024-06-10 23:43:41.195183+00'),
	(261, 49, 20, 'Tyler''s Anus Space event for turn 5: Everyone gains points based on rank', '2024-06-10 23:43:41.195183+00', '2024-06-10 23:43:41.195183+00'),
	(262, 50, 12, 'Tyler''s Anus Space event for turn 5: Everyone gains points based on rank', '2024-06-10 23:43:41.195183+00', '2024-06-10 23:43:41.195183+00'),
	(263, 51, 16, 'Tyler''s Anus Space event for turn 5: Everyone gains points based on rank', '2024-06-10 23:43:41.195183+00', '2024-06-10 23:43:41.195183+00'),
	(264, 53, 24, 'Tyler''s Anus Space event for turn 5: Everyone gains points based on rank', '2024-06-10 23:43:41.195183+00', '2024-06-10 23:43:41.195183+00'),
	(265, 54, 8, 'Tyler''s Anus Space event for turn 5: Everyone gains points based on rank', '2024-06-10 23:43:41.195183+00', '2024-06-10 23:43:41.195183+00'),
	(271, 54, -7, 'Timmy''s Anus Space event for turn 5: Lose 10% of your points if you fail to poop your pants', '2024-06-11 00:11:43.782086+00', '2024-06-11 00:11:43.782086+00'),
	(266, 48, -12, 'Timmy''s Anus Space event for turn 5: Lose 10% of your points if you fail to immediately poop your pants', '2024-06-11 00:11:43.782086+00', '2024-06-11 00:13:12.21986+00'),
	(274, 50, -2, 'Timmy''s Anus Space event for turn 5: Timmy and Tyler swap points', '2024-06-11 00:17:07.396764+00', '2024-06-11 00:17:07.396764+00'),
	(277, 54, 2, 'Timmy''s Anus Space event for turn 5: Timmy and Tyler swap points', '2024-06-11 00:17:07.396764+00', '2024-06-11 00:17:07.396764+00'),
	(280, 50, 2, 'Timmy''s Anus Space event for turn 5: Tyler and Timmy swap points', '2024-06-11 00:17:59.535298+00', '2024-06-11 00:17:59.535298+00'),
	(283, 54, -2, 'Timmy''s Anus Space event for turn 5: Tyler and Timmy swap points', '2024-06-11 00:17:59.535298+00', '2024-06-11 00:17:59.535298+00'),
	(284, 48, 4, 'Adam P''s Special Space event for turn 5: Everyone gains points based on rank', '2024-06-11 00:31:33.149254+00', '2024-06-11 00:31:33.149254+00'),
	(285, 49, 20, 'Adam P''s Special Space event for turn 5: Everyone gains points based on rank', '2024-06-11 00:31:33.149254+00', '2024-06-11 00:31:33.149254+00'),
	(286, 50, 8, 'Adam P''s Special Space event for turn 5: Everyone gains points based on rank', '2024-06-11 00:31:33.149254+00', '2024-06-11 00:31:33.149254+00'),
	(287, 51, 16, 'Adam P''s Special Space event for turn 5: Everyone gains points based on rank', '2024-06-11 00:31:33.149254+00', '2024-06-11 00:31:33.149254+00'),
	(288, 53, 24, 'Adam P''s Special Space event for turn 5: Everyone gains points based on rank', '2024-06-11 00:31:33.149254+00', '2024-06-11 00:31:33.149254+00'),
	(289, 54, 12, 'Adam P''s Special Space event for turn 5: Everyone gains points based on rank', '2024-06-11 00:31:33.149254+00', '2024-06-11 00:31:33.149254+00'),
	(290, 48, -33, 'Timmy''s Anus Space event for turn 5: Josh and Tyler swap points', '2024-06-11 04:22:57.2308+00', '2024-06-11 04:22:57.2308+00'),
	(291, 54, 33, 'Timmy''s Anus Space event for turn 5: Josh and Tyler swap points', '2024-06-11 04:22:57.2308+00', '2024-06-11 04:22:57.2308+00'),
	(292, 53, 117, 'GM Discretion: Give myself points to bet', '2024-06-11 17:17:52.529572+00', '2024-06-11 17:17:52.529572+00'),
	(293, 54, -1, 'Bet against Josh for ''lzs''', '2024-06-11 20:19:48.372079+00', '2024-06-11 20:19:48.372079+00'),
	(294, 48, -1, 'Bet against Tyler for ''lzs''', '2024-06-11 20:19:48.372079+00', '2024-06-11 20:19:48.372079+00'),
	(295, 53, -20, 'Bet against Tyler for ''tits''', '2024-06-11 23:44:56.866377+00', '2024-06-11 23:44:56.866377+00'),
	(296, 54, -20, 'Bet against Buddy for ''tits''', '2024-06-11 23:44:56.866377+00', '2024-06-11 23:44:56.866377+00'),
	(297, 48, -1, 'Wager for bet against Tyler for ''lzs''', '2024-06-12 01:19:03.2824+00', '2024-06-12 01:19:03.2824+00'),
	(298, 54, -1, 'Wager for bet against Josh for ''lzs''', '2024-06-12 01:19:03.2824+00', '2024-06-12 01:19:03.2824+00'),
	(299, 49, 10, 'Blue Space on turn 3', '2024-06-12 02:30:56.965666+00', '2024-06-12 02:30:56.965666+00'),
	(300, 54, -10, 'Red Space on turn 3', '2024-06-12 02:30:56.965666+00', '2024-06-12 02:30:56.965666+00'),
	(301, 54, -3, 'Wager for bet against Buddy for ''asdf''', '2024-06-12 02:51:24.255728+00', '2024-06-12 02:51:24.255728+00'),
	(302, 53, -3, 'Wager for bet against Tyler for ''asdf''', '2024-06-12 02:51:24.255728+00', '2024-06-12 02:51:24.255728+00'),
	(303, 48, 4, 'Josh''s Special Space event for turn 3: Everyone gains points based on rank', '2024-06-12 05:35:50.553685+00', '2024-06-12 05:35:50.553685+00'),
	(304, 49, 24, 'Josh''s Special Space event for turn 3: Everyone gains points based on rank', '2024-06-12 05:35:50.553685+00', '2024-06-12 05:35:50.553685+00'),
	(305, 50, 4, 'Josh''s Special Space event for turn 3: Everyone gains points based on rank', '2024-06-12 05:35:50.553685+00', '2024-06-12 05:35:50.553685+00'),
	(306, 51, 20, 'Josh''s Special Space event for turn 3: Everyone gains points based on rank', '2024-06-12 05:35:50.553685+00', '2024-06-12 05:35:50.553685+00'),
	(307, 53, 4, 'Josh''s Special Space event for turn 3: Everyone gains points based on rank', '2024-06-12 05:35:50.553685+00', '2024-06-12 05:35:50.553685+00'),
	(308, 54, 4, 'Josh''s Special Space event for turn 3: Everyone gains points based on rank', '2024-06-12 05:35:50.553685+00', '2024-06-12 05:35:50.553685+00'),
	(309, 48, -20, 'Duel in turn 3: Timmy beat you in Disc Golf Putting', '2024-06-12 05:39:26.305644+00', '2024-06-12 05:39:26.305644+00'),
	(310, 50, 20, 'Duel in turn 3: You beat Josh in Disc Golf Putting', '2024-06-12 05:39:26.305644+00', '2024-06-12 05:39:26.305644+00'),
	(311, 48, 20, 'Adam P''s Anus Space event for turn 3: Buddy and Josh swap points', '2024-06-12 07:24:51.596024+00', '2024-06-12 07:24:51.596024+00'),
	(312, 53, -20, 'Adam P''s Anus Space event for turn 3: Buddy and Josh swap points', '2024-06-12 07:24:51.596024+00', '2024-06-12 07:24:51.596024+00'),
	(313, 48, 1, 'Push for bet against Tyler that ''lzs''', '2024-06-12 18:56:53.128735+00', '2024-06-12 18:56:53.128735+00'),
	(314, 54, 1, 'Push for Josh''s bet that ''lzs''', '2024-06-12 18:56:53.128735+00', '2024-06-12 18:56:53.128735+00'),
	(315, 53, 7, 'Won bet against Dan that ''alpha''', '2024-06-12 19:18:57.338589+00', '2024-06-12 19:18:57.338589+00'),
	(316, 54, 8, 'Won Buddy''s bet that ''jiklojio''', '2024-06-12 19:19:36.139085+00', '2024-06-12 19:19:36.139085+00'),
	(317, 48, 4, 'Canceled by GM: Bet against Tyler that ''New  form''', '2024-06-12 19:49:33.746063+00', '2024-06-12 19:49:33.746063+00'),
	(318, 54, 7, 'Canceled by GM: Josh''s bet that ''New  form''', '2024-06-12 19:49:33.746063+00', '2024-06-12 19:49:33.746063+00'),
	(319, 53, -1, 'Wager for bet against Tyler that ''lzs1''', '2024-06-13 13:08:02.911141+00', '2024-06-13 13:08:02.911141+00'),
	(320, 54, -2, 'Wager for Buddy''s bet that ''lzs1''', '2024-06-13 13:08:02.911141+00', '2024-06-13 13:08:02.911141+00'),
	(321, 53, -3, 'Wager for bet against Tyler that ''lzs2''', '2024-06-13 13:08:05.458846+00', '2024-06-13 13:08:05.458846+00'),
	(322, 54, -4, 'Wager for Buddy''s bet that ''lzs2''', '2024-06-13 13:08:05.458846+00', '2024-06-13 13:08:05.458846+00'),
	(323, 53, -5, 'Wager for bet against Tyler that ''lzs3''', '2024-06-13 13:08:07.413961+00', '2024-06-13 13:08:07.413961+00'),
	(324, 54, -6, 'Wager for Buddy''s bet that ''lzs3''', '2024-06-13 13:08:07.413961+00', '2024-06-13 13:08:07.413961+00'),
	(325, 53, -7, 'Wager for bet against Tyler that ''lzs4''', '2024-06-13 13:08:09.835054+00', '2024-06-13 13:08:09.835054+00'),
	(326, 54, -8, 'Wager for Buddy''s bet that ''lzs4''', '2024-06-13 13:08:09.835054+00', '2024-06-13 13:08:09.835054+00'),
	(327, 53, -1, 'Wager for bet against Tyler that ''lzs6''', '2024-06-13 13:08:33.111381+00', '2024-06-13 13:08:33.111381+00'),
	(328, 54, -1, 'Wager for Buddy''s bet that ''lzs6''', '2024-06-13 13:08:33.111381+00', '2024-06-13 13:08:33.111381+00'),
	(329, 53, 1, 'Push for bet against Tyler that ''lzs1''', '2024-06-13 13:09:16.898563+00', '2024-06-13 13:09:16.898563+00'),
	(330, 54, 2, 'Push for Buddy''s bet that ''lzs1''', '2024-06-13 13:09:16.898563+00', '2024-06-13 13:09:16.898563+00'),
	(331, 54, 7, 'Won Buddy''s bet that ''lzs2''', '2024-06-13 13:09:27.578384+00', '2024-06-13 13:09:27.578384+00'),
	(332, 53, 11, 'Won bet against Tyler that ''lzs3''', '2024-06-13 13:09:43.402436+00', '2024-06-13 13:09:43.402436+00'),
	(333, 53, 7, 'Canceled by GM: Bet against Tyler that ''lzs4''', '2024-06-13 13:09:55.877112+00', '2024-06-13 13:09:55.877112+00'),
	(334, 54, 8, 'Canceled by GM: Buddy''s bet that ''lzs4''', '2024-06-13 13:09:55.877112+00', '2024-06-13 13:09:55.877112+00'),
	(335, 54, -1, 'Wager for bet against Buddy that ''i will win''', '2024-06-13 18:15:25.734696+00', '2024-06-13 18:15:25.734696+00'),
	(336, 53, -1, 'Wager for Tyler''s bet that ''i will win''', '2024-06-13 18:15:25.734696+00', '2024-06-13 18:15:25.734696+00'),
	(337, 53, -7, 'Wager for bet against Adam P that ''i can fuck more women than you ''', '2024-06-14 03:43:42.20822+00', '2024-06-14 03:43:42.20822+00'),
	(338, 51, -1, 'Wager for Buddy''s bet that ''i can fuck more women than you ''', '2024-06-14 03:43:42.20822+00', '2024-06-14 03:43:42.20822+00'),
	(341, 53, -1, 'Won Dan''s bet that ''pls cancel this''', '2024-06-14 16:42:50.185763+00', '2024-06-14 16:42:50.185763+00'),
	(342, 53, 7, 'Won Dan''s bet that ''pls cancel this''', '2024-06-14 19:14:14.014804+00', '2024-06-14 19:14:14.014804+00'),
	(343, 49, 7, 'Won bet against Buddy that ''pls cancel this''', '2024-06-14 19:15:52.868472+00', '2024-06-14 19:15:52.868472+00'),
	(344, 54, -10, 'Wager for bet against Buddy that ''The sky is blue''', '2024-06-15 13:21:39.510783+00', '2024-06-15 13:21:39.510783+00'),
	(345, 53, -1, 'Wager for Tyler''s bet that ''The sky is blue''', '2024-06-15 13:21:39.510783+00', '2024-06-15 13:21:39.510783+00'),
	(346, 50, 2, 'Won Buddy''s bet that ''Josh beats Buddy in Cookie Face''', '2024-06-16 18:40:59.021485+00', '2024-06-16 18:40:59.021485+00'),
	(347, 54, 9, 'Won Buddy''s bet that ''123''', '2024-06-17 17:42:01.603328+00', '2024-06-17 17:42:01.603328+00'),
	(348, 53, 9, 'Won bet against Tyler that ''123''', '2024-06-17 17:46:31.223847+00', '2024-06-17 17:46:31.223847+00'),
	(349, 53, 3, 'Push for bet against Tyler that ''123''', '2024-06-17 17:46:55.171508+00', '2024-06-17 17:46:55.171508+00'),
	(350, 54, 6, 'Push for Buddy''s bet that ''123''', '2024-06-17 17:46:55.171508+00', '2024-06-17 17:46:55.171508+00'),
	(351, 54, 9, 'Won Buddy''s bet that ''123''', '2024-06-17 17:47:10.75519+00', '2024-06-17 17:47:10.75519+00'),
	(352, 53, -1, 'Wager for bet against Tyler that ''Under 1.5 in Tyler''s Poop Scoop Event''', '2024-06-17 22:07:52.77884+00', '2024-06-17 22:07:52.77884+00'),
	(353, 54, -1, 'Wager for Buddy''s bet that ''Under 1.5 in Tyler''s Poop Scoop Event''', '2024-06-17 22:07:52.77884+00', '2024-06-17 22:07:52.77884+00'),
	(354, 53, -1, 'Wager for bet against Tyler that ''Under 2 in Tyler''s Poop Scoop Event''', '2024-06-17 22:07:54.393775+00', '2024-06-17 22:07:54.393775+00'),
	(355, 54, -1, 'Wager for Buddy''s bet that ''Under 2 in Tyler''s Poop Scoop Event''', '2024-06-17 22:07:54.393775+00', '2024-06-17 22:07:54.393775+00'),
	(356, 54, -1, 'Wager for bet against Timmy that ''Over 0.5 in Tyler''s Poop Scoop Event''', '2024-06-17 22:08:22.22928+00', '2024-06-17 22:08:22.22928+00'),
	(357, 50, -1, 'Wager for Tyler''s bet that ''Over 0.5 in Tyler''s Poop Scoop Event''', '2024-06-17 22:08:22.22928+00', '2024-06-17 22:08:22.22928+00'),
	(358, 53, 2, 'Won bet against Tyler that ''Under 1.5 in Tyler''s Poop Scoop Event''', '2024-06-17 22:09:56.05858+00', '2024-06-17 22:09:56.05858+00'),
	(359, 53, 2, 'Won bet against Tyler that ''Under 2 in Tyler''s Poop Scoop Event''', '2024-06-17 22:09:56.05858+00', '2024-06-17 22:09:56.05858+00'),
	(360, 54, 2, 'Won bet against Timmy that ''Over 0.5 in Tyler''s Poop Scoop Event''', '2024-06-17 22:09:56.05858+00', '2024-06-17 22:09:56.05858+00'),
	(361, 54, 2, 'Push for bet against Josh that ''Over 1 in Tyler''s Poop Scoop Event''', '2024-06-17 22:09:56.05858+00', '2024-06-17 22:09:56.05858+00'),
	(362, 48, 2, 'Push for Tyler''s bet that ''Over 1 in Tyler''s Poop Scoop Event''', '2024-06-17 22:09:56.05858+00', '2024-06-17 22:09:56.05858+00'),
	(363, 50, -1, 'Wager for bet against Buddy that ''Over 2 in Tyler''s Poop Scoop Event''', '2024-06-17 22:11:13.108709+00', '2024-06-17 22:11:13.108709+00'),
	(364, 53, -1, 'Wager for Timmy''s bet that ''Over 2 in Tyler''s Poop Scoop Event''', '2024-06-17 22:11:13.108709+00', '2024-06-17 22:11:13.108709+00'),
	(365, 53, 2, 'Won Timmy''s bet that ''Over 2 in Tyler''s Poop Scoop Event''', '2024-06-17 22:11:18.869087+00', '2024-06-17 22:11:18.869087+00'),
	(366, 53, 2, 'Won Timmy''s bet that ''Over 2 in Tyler''s Poop Scoop Event''', '2024-06-17 22:17:55.970391+00', '2024-06-17 22:17:55.970391+00'),
	(367, 53, -1, 'Wager for bet against Tyler that ''Timmy beats Josh in Disc Golf Putting''', '2024-06-19 20:33:26.339105+00', '2024-06-19 20:33:26.339105+00'),
	(368, 54, -1, 'Wager for Buddy''s bet that ''Timmy beats Josh in Disc Golf Putting''', '2024-06-19 20:33:26.339105+00', '2024-06-19 20:33:26.339105+00'),
	(369, 53, -1, 'Wager for bet against Tyler that ''lzs''', '2024-06-19 20:33:28.219441+00', '2024-06-19 20:33:28.219441+00'),
	(370, 54, -1, 'Wager for Buddy''s bet that ''lzs''', '2024-06-19 20:33:28.219441+00', '2024-06-19 20:33:28.219441+00'),
	(371, 53, -1, 'Wager for bet against Tyler that ''Under 0.5 in Tyler''s Poop Scoop Event''', '2024-06-19 20:33:29.521374+00', '2024-06-19 20:33:29.521374+00'),
	(372, 54, -1, 'Wager for Buddy''s bet that ''Under 0.5 in Tyler''s Poop Scoop Event''', '2024-06-19 20:33:29.521374+00', '2024-06-19 20:33:29.521374+00'),
	(373, 48, -1, 'Wager for bet against Buddy that ''Yfyhobucydtxucuvib''', '2024-06-19 21:35:17.759299+00', '2024-06-19 21:35:17.759299+00'),
	(374, 53, -1, 'Wager for Josh''s bet that ''Yfyhobucydtxucuvib''', '2024-06-19 21:35:17.759299+00', '2024-06-19 21:35:17.759299+00'),
	(375, 48, -2, 'Wager for bet against Buddy that ''Yfyhobucydtxucuvib klajsdflk jasdfkljhas dfkljashdfkl jasfkljhas dklfjas dfklj asdklf jaslk dfkajs df''', '2024-06-19 21:48:56.046276+00', '2024-06-19 21:48:56.046276+00'),
	(376, 53, -6, 'Wager for Josh''s bet that ''Yfyhobucydtxucuvib klajsdflk jasdfkljhas dfkljashdfkl jasfkljhas dklfjas dfklj asdklf jaslk dfkajs df''', '2024-06-19 21:48:56.046276+00', '2024-06-19 21:48:56.046276+00'),
	(377, 50, -1, 'Wager for bet against Buddy that ''Over 2 in Tyler''s Poop Scoop Event''', '2024-06-20 06:46:17.923527+00', '2024-06-20 06:46:17.923527+00'),
	(378, 53, -1, 'Wager for Timmy''s bet that ''Over 2 in Tyler''s Poop Scoop Event''', '2024-06-20 06:46:17.923527+00', '2024-06-20 06:46:17.923527+00'),
	(379, 50, -1, 'Wager for bet against Buddy that ''Over 2 in Tyler''s Poop Scoop Event''', '2024-06-20 07:07:25.154242+00', '2024-06-20 07:07:25.154242+00'),
	(380, 53, -1, 'Wager for Timmy''s bet that ''Over 2 in Tyler''s Poop Scoop Event''', '2024-06-20 07:07:25.154242+00', '2024-06-20 07:07:25.154242+00'),
	(381, 54, -1, 'Wager for bet against Buddy that ''i will win''', '2024-06-20 07:21:54.233211+00', '2024-06-20 07:21:54.233211+00'),
	(382, 53, -1, 'Wager for Tyler''s bet that ''i will win''', '2024-06-20 07:21:54.233211+00', '2024-06-20 07:21:54.233211+00'),
	(383, 50, -1, 'Wager for bet against Buddy that ''Over 2 in Tyler''s Poop Scoop Event''', '2024-06-20 07:22:00.178911+00', '2024-06-20 07:22:00.178911+00'),
	(384, 53, -1, 'Wager for Timmy''s bet that ''Over 2 in Tyler''s Poop Scoop Event''', '2024-06-20 07:22:00.178911+00', '2024-06-20 07:22:00.178911+00'),
	(385, 53, 11, 'Won Tyler''s bet that ''The sky is blue''', '2024-06-20 15:48:16.836636+00', '2024-06-20 15:48:16.836636+00'),
	(386, 54, 11, 'Won bet against Buddy that ''The sky is blue''', '2024-06-20 15:48:59.348193+00', '2024-06-20 15:48:59.348193+00'),
	(387, 54, 10, 'Push for bet against Buddy that ''The sky is blue''', '2024-06-20 15:49:54.014914+00', '2024-06-20 15:49:54.014914+00'),
	(388, 53, 1, 'Push for Tyler''s bet that ''The sky is blue''', '2024-06-20 15:49:54.014914+00', '2024-06-20 15:49:54.014914+00'),
	(389, 53, 2, 'Won bet against Tyler that ''over 1 loses in event 6''', '2024-06-21 19:09:14.326235+00', '2024-06-21 19:09:14.326235+00'),
	(390, 54, 2, 'Won Buddy''s bet that ''over 1 loses in event 6''', '2024-06-21 19:09:39.775165+00', '2024-06-21 19:09:39.775165+00'),
	(391, 53, 1, 'Push for bet against Tyler that ''over 1 loses in event 6''', '2024-06-21 19:10:00.23864+00', '2024-06-21 19:10:00.23864+00'),
	(392, 54, 1, 'Push for Buddy''s bet that ''over 1 loses in event 6''', '2024-06-21 19:10:00.23864+00', '2024-06-21 19:10:00.23864+00'),
	(393, 54, 2, 'Won Buddy''s bet that ''Under 2 losers in the Everyone Stands on 1 Foot for 5 Minutes Event''', '2024-06-21 20:09:26.96318+00', '2024-06-21 20:09:26.96318+00'),
	(394, 53, 2, 'Won bet against Josh that ''Over 0.5 losers in the Everyone Stands on 1 Foot for 5 Minutes Event''', '2024-06-21 20:09:26.96318+00', '2024-06-21 20:09:26.96318+00'),
	(395, 53, 2, 'Won bet against Josh that ''Over 0.5 losers in the Everyone Stands on 1 Foot for 5 Minutes Event''', '2024-06-22 03:54:22.978208+00', '2024-06-22 03:54:22.978208+00'),
	(396, 53, 2, 'Won bet against Josh that ''Over 0.5 losers in the Everyone Stands on 1 Foot for 5 Minutes Event''', '2024-06-22 03:55:01.090629+00', '2024-06-22 03:55:01.090629+00'),
	(397, 53, 2, 'Won bet against Josh that ''Over 0.5 losers in the Everyone Stands on 1 Foot for 5 Minutes Event''', '2024-06-22 03:55:07.798903+00', '2024-06-22 03:55:07.798903+00'),
	(398, 48, 2, 'Won Buddy''s bet that ''Over 0.5 losers in the Everyone Stands on 1 Foot for 5 Minutes Event''', '2024-06-22 03:57:53.451725+00', '2024-06-22 03:57:53.451725+00'),
	(399, 53, 2, 'Won Tyler''s bet that ''i will win''', '2024-06-22 04:26:35.699358+00', '2024-06-22 04:26:35.699358+00'),
	(400, 50, 1, 'Push for bet against Buddy that ''Over 2 in Tyler''s Poop Scoop Event''', '2024-06-22 04:28:46.51967+00', '2024-06-22 04:28:46.51967+00'),
	(401, 53, 1, 'Push for Timmy''s bet that ''Over 2 in Tyler''s Poop Scoop Event''', '2024-06-22 04:28:46.51967+00', '2024-06-22 04:28:46.51967+00'),
	(402, 53, 2, 'Canceled by GM: Bet against Tyler that ''''', '2024-06-22 17:52:24.809052+00', '2024-06-22 17:52:24.809052+00'),
	(403, 54, 2, 'Canceled by GM: Buddy''s bet that ''''', '2024-06-22 17:52:24.809052+00', '2024-06-22 17:52:24.809052+00'),
	(404, 54, 2, 'Canceled by GM: Bet against Josh that ''Over 1 in Tyler''s Poop Scoop Event''', '2024-06-22 17:57:44.790571+00', '2024-06-22 17:57:44.790571+00'),
	(405, 48, 2, 'Canceled by GM: Tyler''s bet that ''Over 1 in Tyler''s Poop Scoop Event''', '2024-06-22 17:57:44.790571+00', '2024-06-22 17:57:44.790571+00'),
	(406, 48, 1, 'Canceled by GM: Bet against Tyler that ''lzs''', '2024-06-22 17:57:44.790571+00', '2024-06-22 17:57:44.790571+00'),
	(407, 54, 1, 'Canceled by GM: Josh''s bet that ''lzs''', '2024-06-22 17:57:44.790571+00', '2024-06-22 17:57:44.790571+00'),
	(408, 54, 1, 'Canceled by GM: Bet against Timmy that ''Over 0.5 in Tyler''s Poop Scoop Event''', '2024-06-22 17:57:44.790571+00', '2024-06-22 17:57:44.790571+00'),
	(409, 50, 2, 'Canceled by GM: Tyler''s bet that ''Over 0.5 in Tyler''s Poop Scoop Event''', '2024-06-22 17:57:44.790571+00', '2024-06-22 17:57:44.790571+00'),
	(410, 53, 1, 'Canceled by GM: Bet against Tyler that ''asd''', '2024-06-22 17:57:44.790571+00', '2024-06-22 17:57:44.790571+00'),
	(411, 54, 1, 'Canceled by GM: Buddy''s bet that ''asd''', '2024-06-22 17:57:44.790571+00', '2024-06-22 17:57:44.790571+00'),
	(412, 54, 10, 'Canceled by GM: Bet against Buddy that ''The sky is blue''', '2024-06-22 17:59:46.714514+00', '2024-06-22 17:59:46.714514+00'),
	(413, 53, 1, 'Canceled by GM: Tyler''s bet that ''The sky is blue''', '2024-06-22 17:59:46.714514+00', '2024-06-22 17:59:46.714514+00'),
	(414, 53, 1, 'Canceled by GM: Bet against Tyler that ''asd''', '2024-06-22 18:16:58.410295+00', '2024-06-22 18:16:58.410295+00'),
	(415, 54, 1, 'Canceled by GM: Buddy''s bet that ''asd''', '2024-06-22 18:16:58.410295+00', '2024-06-22 18:16:58.410295+00'),
	(416, 49, -4, 'Wager for bet against Buddy that ''pls cancel this''', '2024-06-23 03:03:35.443765+00', '2024-06-23 03:03:35.443765+00'),
	(417, 53, -3, 'Wager for Dan''s bet that ''pls cancel this''', '2024-06-23 03:03:35.443765+00', '2024-06-23 03:03:35.443765+00'),
	(418, 48, 25, 'Duel in turn 3: You beat Timmy in Disc Golf Putting', '2024-06-23 18:06:43.542237+00', '2024-06-23 18:06:43.542237+00'),
	(419, 50, -25, 'Duel in turn 3: Josh beat you in Disc Golf Putting', '2024-06-23 18:06:43.542237+00', '2024-06-23 18:06:43.542237+00'),
	(420, 54, 69, 'leo''s test score', '2024-06-26 01:21:59.652013+00', '2024-06-26 01:21:59.652013+00'),
	(421, 48, 69, 'leo''s test score', '2024-06-26 01:21:59.652013+00', '2024-06-26 01:21:59.652013+00'),
	(423, 54, 30, 'leo''s test score', '2024-06-26 02:22:55.431602+00', '2024-06-26 02:22:55.431602+00'),
	(424, 54, 27, 'leo''s test score', '2024-06-26 02:23:26.939071+00', '2024-06-26 02:23:26.939071+00'),
	(425, 54, 27, '2 place in Peepee Punch', '2024-06-26 02:41:31.484341+00', '2024-06-26 02:41:31.484341+00'),
	(426, 54, 27, '2nd place in Peepee Punch', '2024-06-26 02:41:49.525414+00', '2024-06-26 02:41:49.525414+00'),
	(427, 54, 3, '1st place in Fart', '2024-06-26 16:41:24.777177+00', '2024-06-26 16:41:24.777177+00'),
	(428, 48, 3, '1st place in Fart', '2024-06-26 16:41:24.777177+00', '2024-06-26 16:41:24.777177+00'),
	(429, 53, 3, '1st place in Fart', '2024-06-26 16:41:24.777177+00', '2024-06-26 16:41:24.777177+00'),
	(430, 50, 3, '1st place in Fart', '2024-06-26 16:41:24.777177+00', '2024-06-26 16:41:24.777177+00'),
	(431, 51, 3, '1st place in Fart', '2024-06-26 16:41:24.777177+00', '2024-06-26 16:41:24.777177+00'),
	(432, 49, 3, '1st place in Fart', '2024-06-26 16:41:24.777177+00', '2024-06-26 16:41:24.777177+00'),
	(438, 48, -10, 'Red Space on turn 3', '2024-06-29 03:40:36.141819+00', '2024-06-29 03:40:36.141819+00'),
	(439, 53, 8234, 'Bank Space on turn 3', '2024-06-29 03:40:36.141819+00', '2024-06-29 03:40:36.141819+00'),
	(440, 54, 10, 'Blue Space on turn 3', '2024-06-29 03:40:36.141819+00', '2024-06-29 03:40:36.141819+00'),
	(441, 53, -8234, 'GM Discretion', '2024-06-29 03:41:18.08332+00', '2024-06-29 03:41:18.08332+00'),
	(454, 48, -677, 'GM Discretion', '2024-06-29 03:47:22.77156+00', '2024-06-29 03:47:22.77156+00'),
	(455, 53, -601, 'GM Discretion', '2024-06-29 03:47:31.691415+00', '2024-06-29 03:47:31.691415+00'),
	(456, 54, -340, 'GM Discretion', '2024-06-29 03:47:40.581608+00', '2024-06-29 03:47:40.581608+00'),
	(457, 48, 0, 'Bank Space on turn 3', '2024-06-29 03:48:40.573592+00', '2024-06-29 03:48:40.573592+00'),
	(458, 49, 10, 'Blue Space on turn 3', '2024-06-29 03:48:40.573592+00', '2024-06-29 03:48:40.573592+00'),
	(459, 50, 10, 'Blue Space on turn 3', '2024-06-29 03:48:40.573592+00', '2024-06-29 03:48:40.573592+00'),
	(460, 51, 10, 'Blue Space on turn 3', '2024-06-29 03:48:40.573592+00', '2024-06-29 03:48:40.573592+00'),
	(461, 53, 0, 'Bank Space on turn 3', '2024-06-29 03:48:40.573592+00', '2024-06-29 03:48:40.573592+00'),
	(462, 54, 0, 'Bank Space on turn 3', '2024-06-29 03:48:40.573592+00', '2024-06-29 03:48:40.573592+00'),
	(463, 48, 125, 'Bank Space on turn 3', '2024-06-29 03:49:54.804745+00', '2024-06-29 03:49:54.804745+00'),
	(464, 49, 10, 'Blue Space on turn 3', '2024-06-29 03:49:54.804745+00', '2024-06-29 03:49:54.804745+00'),
	(465, 50, 10, 'Blue Space on turn 3', '2024-06-29 03:49:54.804745+00', '2024-06-29 03:49:54.804745+00'),
	(466, 51, 10, 'Blue Space on turn 3', '2024-06-29 03:49:54.804745+00', '2024-06-29 03:49:54.804745+00'),
	(467, 53, 0, 'Bank Space on turn 3', '2024-06-29 03:49:54.804745+00', '2024-06-29 03:49:54.804745+00'),
	(468, 54, 0, 'Bank Space on turn 3', '2024-06-29 03:49:54.804745+00', '2024-06-29 03:49:54.804745+00'),
	(471, 48, 10, 'Blue Space on turn 3', '2024-06-29 03:57:22.367+00', '2024-06-29 03:57:22.367+00'),
	(472, 50, 10, 'Blue Space on turn 3', '2024-06-29 03:57:22.367+00', '2024-06-29 03:57:22.367+00'),
	(473, 51, 10, 'Blue Space on turn 3', '2024-06-29 03:57:22.367+00', '2024-06-29 03:57:22.367+00'),
	(474, 48, 10, 'Blue Space on turn 4', '2024-06-29 03:58:44.250159+00', '2024-06-29 03:58:44.250159+00'),
	(475, 50, 10, 'Blue Space on turn 4', '2024-06-29 03:58:44.250159+00', '2024-06-29 03:58:44.250159+00'),
	(476, 51, 10, 'Blue Space on turn 4', '2024-06-29 03:58:44.250159+00', '2024-06-29 03:58:44.250159+00'),
	(477, 48, 10, 'Blue Space on turn 1', '2024-06-29 04:03:37.343437+00', '2024-06-29 04:03:37.343437+00'),
	(478, 49, 333, 'Bank Space on turn 1', '2024-06-29 04:03:37.343437+00', '2024-06-29 04:03:37.343437+00'),
	(479, 50, 10, 'Blue Space on turn 1', '2024-06-29 04:03:37.343437+00', '2024-06-29 04:03:37.343437+00'),
	(480, 51, 10, 'Blue Space on turn 1', '2024-06-29 04:03:37.343437+00', '2024-06-29 04:03:37.343437+00'),
	(481, 53, 0, 'Bank Space on turn 1', '2024-06-29 04:03:37.343437+00', '2024-06-29 04:03:37.343437+00'),
	(482, 54, 0, 'Bank Space on turn 1', '2024-06-29 04:03:37.343437+00', '2024-06-29 04:03:37.343437+00'),
	(483, 48, 10, 'Blue Space on turn 1', '2024-06-29 04:10:41.569961+00', '2024-06-29 04:10:41.569961+00'),
	(484, 49, 10, 'Blue Space on turn 1', '2024-06-29 04:10:41.569961+00', '2024-06-29 04:10:41.569961+00'),
	(485, 50, 10, 'Blue Space on turn 1', '2024-06-29 04:10:41.569961+00', '2024-06-29 04:10:41.569961+00'),
	(486, 51, 333, 'Bank Space on turn 1', '2024-06-29 04:10:41.569961+00', '2024-06-29 04:10:41.569961+00'),
	(487, 53, 333, 'Bank Space on turn 1', '2024-06-29 04:10:41.569961+00', '2024-06-29 04:10:41.569961+00'),
	(488, 54, 333, 'Bank Space on turn 1', '2024-06-29 04:10:41.569961+00', '2024-06-29 04:10:41.569961+00'),
	(489, 51, -10, 'Red Space on turn 1', '2024-06-29 04:14:30.181439+00', '2024-06-29 04:14:30.181439+00'),
	(491, 53, 7, 'GM Discretion: asdf', '2024-06-29 15:19:46.317701+00', '2024-06-29 15:19:46.317701+00'),
	(492, 53, -10, 'GM Discretion: qwer', '2024-06-29 15:19:58.772809+00', '2024-06-29 15:19:58.772809+00'),
	(493, 48, 10, 'Blue Space on turn 1', '2024-06-29 15:40:22.160768+00', '2024-06-29 15:40:22.160768+00'),
	(494, 50, 10, 'Blue Space on turn 1', '2024-06-29 15:40:22.160768+00', '2024-06-29 15:40:22.160768+00'),
	(495, 48, -17, 'Dan''s Anus Space event for turn 1: Everyone loses 10% of their points', '2024-06-29 15:40:49.743347+00', '2024-06-29 15:40:49.743347+00'),
	(496, 49, -42, 'Dan''s Anus Space event for turn 1: Everyone loses 10% of their points', '2024-06-29 15:40:49.743347+00', '2024-06-29 15:40:49.743347+00'),
	(497, 50, -16, 'Dan''s Anus Space event for turn 1: Everyone loses 10% of their points', '2024-06-29 15:40:49.743347+00', '2024-06-29 15:40:49.743347+00'),
	(498, 51, -44, 'Dan''s Anus Space event for turn 1: Everyone loses 10% of their points', '2024-06-29 15:40:49.743347+00', '2024-06-29 15:40:49.743347+00'),
	(499, 53, -33, 'Dan''s Anus Space event for turn 1: Everyone loses 10% of their points', '2024-06-29 15:40:49.743347+00', '2024-06-29 15:40:49.743347+00'),
	(500, 54, -33, 'Dan''s Anus Space event for turn 1: Everyone loses 10% of their points', '2024-06-29 15:40:49.743347+00', '2024-06-29 15:40:49.743347+00'),
	(501, 48, -16, 'Adam P''s Anus Space event for turn 1: Everyone loses 10% of their points', '2024-06-29 15:42:29.578953+00', '2024-06-29 15:42:29.578953+00'),
	(502, 49, -38, 'Adam P''s Anus Space event for turn 1: Everyone loses 10% of their points', '2024-06-29 15:42:29.578953+00', '2024-06-29 15:42:29.578953+00'),
	(503, 50, -14, 'Adam P''s Anus Space event for turn 1: Everyone loses 10% of their points', '2024-06-29 15:42:29.578953+00', '2024-06-29 15:42:29.578953+00'),
	(504, 51, -39, 'Adam P''s Anus Space event for turn 1: Everyone loses 10% of their points', '2024-06-29 15:42:29.578953+00', '2024-06-29 15:42:29.578953+00'),
	(505, 53, -30, 'Adam P''s Anus Space event for turn 1: Everyone loses 10% of their points', '2024-06-29 15:42:29.578953+00', '2024-06-29 15:42:29.578953+00'),
	(506, 54, -30, 'Adam P''s Anus Space event for turn 1: Everyone loses 10% of their points', '2024-06-29 15:42:29.578953+00', '2024-06-29 15:42:29.578953+00'),
	(507, 48, -14, 'Buddy''s Anus Space event for turn 1: Everyone loses 10% of their points', '2024-06-29 19:20:15.477435+00', '2024-06-29 19:20:15.477435+00'),
	(508, 49, -34, 'Buddy''s Anus Space event for turn 1: Everyone loses 10% of their points', '2024-06-29 19:20:15.477435+00', '2024-06-29 19:20:15.477435+00'),
	(509, 50, -13, 'Buddy''s Anus Space event for turn 1: Everyone loses 10% of their points', '2024-06-29 19:20:15.477435+00', '2024-06-29 19:20:15.477435+00'),
	(510, 51, -36, 'Buddy''s Anus Space event for turn 1: Everyone loses 10% of their points', '2024-06-29 19:20:15.477435+00', '2024-06-29 19:20:15.477435+00'),
	(511, 53, -27, 'Buddy''s Anus Space event for turn 1: Everyone loses 10% of their points', '2024-06-29 19:20:15.477435+00', '2024-06-29 19:20:15.477435+00'),
	(512, 54, -27, 'Buddy''s Anus Space event for turn 1: Everyone loses 10% of their points', '2024-06-29 19:20:15.477435+00', '2024-06-29 19:20:15.477435+00'),
	(513, 48, -13, 'Tyler''s Anus Space event for turn 1: Lose 10% of your points if you fail to immediately poop your pants', '2024-06-29 19:38:37.76734+00', '2024-06-29 19:38:37.76734+00'),
	(514, 49, -30, 'Tyler''s Anus Space event for turn 1: Lose 10% of your points if you fail to immediately poop your pants', '2024-06-29 19:38:37.76734+00', '2024-06-29 19:38:37.76734+00'),
	(515, 48, 97, 'Bank Space on turn 2', '2024-06-29 19:46:51.761611+00', '2024-06-29 19:46:51.761611+00'),
	(516, 49, 10, 'Blue Space on turn 2', '2024-06-29 19:46:51.761611+00', '2024-06-29 19:46:51.761611+00'),
	(517, 50, 10, 'Blue Space on turn 2', '2024-06-29 19:46:51.761611+00', '2024-06-29 19:46:51.761611+00'),
	(518, 51, 97, 'Bank Space on turn 2', '2024-06-29 19:46:51.761611+00', '2024-06-29 19:46:51.761611+00'),
	(519, 53, 10, 'Blue Space on turn 2', '2024-06-29 19:46:51.761611+00', '2024-06-29 19:46:51.761611+00'),
	(520, 54, 10, 'Blue Space on turn 2', '2024-06-29 19:46:51.761611+00', '2024-06-29 19:46:51.761611+00'),
	(521, 48, 10, 'Blue Space on turn 2', '2024-06-29 19:56:50.70483+00', '2024-06-29 19:56:50.70483+00'),
	(522, 49, -10, 'Red Space on turn 2', '2024-06-29 19:56:50.70483+00', '2024-06-29 19:56:50.70483+00'),
	(523, 50, 10, 'Blue Space on turn 2', '2024-06-29 19:56:50.70483+00', '2024-06-29 19:56:50.70483+00'),
	(524, 51, -10, 'Red Space on turn 2', '2024-06-29 19:56:50.70483+00', '2024-06-29 19:56:50.70483+00'),
	(525, 53, 10, 'Blue Space on turn 2', '2024-06-29 19:56:50.70483+00', '2024-06-29 19:56:50.70483+00'),
	(526, 53, -5, 'GM Discretion: bank test 1', '2024-06-29 20:13:45.850219+00', '2024-06-29 20:13:45.850219+00'),
	(527, 53, -10, 'GM Discretion: bank test 2', '2024-06-29 20:14:38.392831+00', '2024-06-29 20:14:38.392831+00'),
	(528, 53, -5, 'GM Discretion', '2024-06-29 20:15:12.238502+00', '2024-06-29 20:15:12.238502+00'),
	(529, 53, 5, 'GM Discretion', '2024-06-29 20:15:23.482163+00', '2024-06-29 20:15:23.482163+00'),
	(530, 53, 5, 'GM Discretion', '2024-06-29 20:15:33.755866+00', '2024-06-29 20:15:33.755866+00'),
	(531, 53, -5, 'GM Discretion', '2024-06-29 20:16:58.207619+00', '2024-06-29 20:16:58.207619+00'),
	(532, 51, -7, 'GM Discretion', '2024-06-30 03:49:34.267514+00', '2024-06-30 03:49:34.267514+00'),
	(534, 54, 0, 'Points earned during round 3', '2024-06-30 17:24:25.905502+00', '2024-06-30 17:24:25.905502+00'),
	(535, 51, 0, 'Points earned during round 3', '2024-06-30 17:24:25.905502+00', '2024-06-30 17:24:25.905502+00'),
	(536, 48, 2, 'Points earned during round 3', '2024-06-30 17:24:25.905502+00', '2024-06-30 17:24:25.905502+00'),
	(537, 53, 2, 'Points earned during round 3', '2024-06-30 17:24:25.905502+00', '2024-06-30 17:24:25.905502+00'),
	(538, 50, 1, 'Points earned during round 3', '2024-06-30 17:24:25.905502+00', '2024-06-30 17:24:25.905502+00'),
	(539, 49, 1, 'Points earned during round 3', '2024-06-30 17:24:25.905502+00', '2024-06-30 17:24:25.905502+00'),
	(540, 54, 2, 'Points earned during round 3', '2024-06-30 17:26:03.1953+00', '2024-06-30 17:26:03.1953+00'),
	(541, 51, 2, 'Points earned during round 3', '2024-06-30 17:26:03.1953+00', '2024-06-30 17:26:03.1953+00'),
	(542, 48, 5, 'Points earned during round 3', '2024-06-30 17:26:03.1953+00', '2024-06-30 17:26:03.1953+00'),
	(543, 53, 5, 'Points earned during round 3', '2024-06-30 17:26:03.1953+00', '2024-06-30 17:26:03.1953+00'),
	(544, 50, 3, 'Points earned during round 3', '2024-06-30 17:26:03.1953+00', '2024-06-30 17:26:03.1953+00'),
	(545, 49, 3, 'Points earned during round 3', '2024-06-30 17:26:03.1953+00', '2024-06-30 17:26:03.1953+00'),
	(546, 54, 0, 'Points earned during round 3', '2024-06-30 22:20:45.672002+00', '2024-06-30 22:20:45.672002+00'),
	(547, 51, 0, 'Points earned during round 3', '2024-06-30 22:20:45.672002+00', '2024-06-30 22:20:45.672002+00'),
	(548, 48, 2, 'Points earned during round 3', '2024-06-30 22:20:45.672002+00', '2024-06-30 22:20:45.672002+00'),
	(549, 53, 2, 'Points earned during round 3', '2024-06-30 22:20:45.672002+00', '2024-06-30 22:20:45.672002+00'),
	(550, 50, 0, 'Points earned during round 3', '2024-06-30 22:20:45.672002+00', '2024-06-30 22:20:45.672002+00'),
	(551, 49, 0, 'Points earned during round 3', '2024-06-30 22:20:45.672002+00', '2024-06-30 22:20:45.672002+00'),
	(552, 53, 12, 'Special Space event for turn 4: 6 flips in Flip Cup', '2024-07-03 19:43:10.743401+00', '2024-07-03 19:43:10.743401+00'),
	(553, 48, -69, 'Wager for bet against Buddy that ''piss''', '2024-07-05 04:26:08.705869+00', '2024-07-05 04:26:08.705869+00'),
	(554, 53, -69, 'Wager for Josh''s bet that ''piss''', '2024-07-05 04:26:08.705869+00', '2024-07-05 04:26:08.705869+00'),
	(555, 48, -1, 'Wager for bet against Buddy that ''test bet for ticker''', '2024-07-05 04:26:44.602641+00', '2024-07-05 04:26:44.602641+00'),
	(556, 53, -1, 'Wager for Josh''s bet that ''test bet for ticker''', '2024-07-05 04:26:44.602641+00', '2024-07-05 04:26:44.602641+00'),
	(557, 48, -2, 'Wager for bet against Buddy that ''ticky wicky ''', '2024-07-05 04:27:13.854344+00', '2024-07-05 04:27:13.854344+00'),
	(558, 53, -2, 'Wager for Josh''s bet that ''ticky wicky ''', '2024-07-05 04:27:13.854344+00', '2024-07-05 04:27:13.854344+00'),
	(559, 48, -3, 'Wager for bet against Buddy that ''itchy critchy ''', '2024-07-05 04:27:39.77937+00', '2024-07-05 04:27:39.77937+00'),
	(560, 53, -3, 'Wager for Josh''s bet that ''itchy critchy ''', '2024-07-05 04:27:39.77937+00', '2024-07-05 04:27:39.77937+00'),
	(561, 53, -1, 'Wager for bet against Josh that ''hjhvjh''', '2024-07-05 04:32:51.803344+00', '2024-07-05 04:32:51.803344+00'),
	(562, 48, -1, 'Wager for Buddy''s bet that ''hjhvjh''', '2024-07-05 04:32:51.803344+00', '2024-07-05 04:32:51.803344+00'),
	(563, 53, -1, 'Wager for bet against Josh that ''ghghgh''', '2024-07-05 04:33:43.738871+00', '2024-07-05 04:33:43.738871+00'),
	(564, 48, -1, 'Wager for Buddy''s bet that ''ghghgh''', '2024-07-05 04:33:43.738871+00', '2024-07-05 04:33:43.738871+00'),
	(565, 53, -1, 'Wager for bet against Tyler that ''lzs''', '2024-07-05 23:34:33.620147+00', '2024-07-05 23:34:33.620147+00'),
	(566, 54, -1, 'Wager for Buddy''s bet that ''lzs''', '2024-07-05 23:34:33.620147+00', '2024-07-05 23:34:33.620147+00'),
	(567, 53, 2, 'Won bet against Josh that ''ghghgh''', '2024-07-05 23:34:56.086567+00', '2024-07-05 23:34:56.086567+00'),
	(568, 48, 2, 'Won Buddy''s bet that ''hjhvjh''', '2024-07-05 23:35:14.031037+00', '2024-07-05 23:35:14.031037+00'),
	(569, 48, 3, 'Push for bet against Buddy that ''itchy critchy ''', '2024-07-05 23:35:28.591628+00', '2024-07-05 23:35:28.591628+00'),
	(570, 53, 3, 'Push for Josh''s bet that ''itchy critchy ''', '2024-07-05 23:35:28.591628+00', '2024-07-05 23:35:28.591628+00'),
	(571, 48, 2, 'Canceled by GM: Bet against Buddy that ''ticky wicky ''', '2024-07-05 23:35:39.881304+00', '2024-07-05 23:35:39.881304+00'),
	(572, 53, 2, 'Canceled by GM: Josh''s bet that ''ticky wicky ''', '2024-07-05 23:35:39.881304+00', '2024-07-05 23:35:39.881304+00'),
	(573, 49, 23, 'Special Space event for turn 4: 23 flips in Bottle Flip', '2024-07-05 23:44:01.644652+00', '2024-07-05 23:44:01.644652+00'),
	(574, 54, -2, 'Wager for bet against Buddy that ''Over 0.5 in Adam P''s Flip Cup Event''', '2024-07-05 23:48:02.820674+00', '2024-07-05 23:48:02.820674+00'),
	(575, 53, -3, 'Wager for Tyler''s bet that ''Over 0.5 in Adam P''s Flip Cup Event''', '2024-07-05 23:48:02.820674+00', '2024-07-05 23:48:02.820674+00'),
	(576, 54, 5, 'Won bet against Buddy that ''Over 0.5 in Adam P''s Flip Cup Event''', '2024-07-05 23:48:57.727604+00', '2024-07-05 23:48:57.727604+00'),
	(577, 51, 18, 'Special Space event for turn 4: 9 flips in Flip Cup', '2024-07-05 23:48:57.727604+00', '2024-07-05 23:48:57.727604+00'),
	(578, 54, -10, 'Wager for bet against Buddy that ''Carter eats over 50 wings at the Wing-Off''', '2024-07-05 23:52:11.961892+00', '2024-07-05 23:52:11.961892+00'),
	(579, 53, -10, 'Wager for Tyler''s bet that ''Carter eats over 50 wings at the Wing-Off''', '2024-07-05 23:52:11.961892+00', '2024-07-05 23:52:11.961892+00'),
	(580, 53, -2, 'Wager for bet against Josh that ''jizz''', '2024-07-05 23:54:18.288584+00', '2024-07-05 23:54:18.288584+00'),
	(581, 48, -1, 'Wager for Buddy''s bet that ''jizz''', '2024-07-05 23:54:18.288584+00', '2024-07-05 23:54:18.288584+00'),
	(582, 54, 20, 'Won bet against Buddy that ''Carter eats over 50 wings at the Wing-Off''', '2024-07-05 23:56:49.657105+00', '2024-07-05 23:56:49.657105+00'),
	(583, 48, 3, 'Won Buddy''s bet that ''jizz''', '2024-07-05 23:56:56.626581+00', '2024-07-05 23:56:56.626581+00'),
	(584, 53, 2, 'Won Josh''s bet that ''test bet for ticker''', '2024-07-05 23:57:07.684456+00', '2024-07-05 23:57:07.684456+00'),
	(585, 48, 69, 'Push for bet against Buddy that ''piss''', '2024-07-05 23:57:15.585052+00', '2024-07-05 23:57:15.585052+00'),
	(586, 53, 69, 'Push for Josh''s bet that ''piss''', '2024-07-05 23:57:15.585052+00', '2024-07-05 23:57:15.585052+00'),
	(587, 53, -10, 'Wager for bet against Josh that ''Carter eats 13 poops in 2 minutes''', '2024-07-06 18:59:10.489345+00', '2024-07-06 18:59:10.489345+00'),
	(588, 48, -10, 'Wager for Buddy''s bet that ''Carter eats 13 poops in 2 minutes''', '2024-07-06 18:59:10.489345+00', '2024-07-06 18:59:10.489345+00'),
	(589, 53, 20, 'Won bet against Josh that ''Carter eats 13 poops in 2 minutes''', '2024-07-06 19:00:40.808768+00', '2024-07-06 19:00:40.808768+00'),
	(590, 48, -69, 'Bad-Luck Brown Space on turn 2', '2024-07-06 19:19:25.519189+00', '2024-07-06 19:19:25.519189+00'),
	(591, 49, -69, 'Bad-Luck Brown Space on turn 2', '2024-07-06 19:19:25.519189+00', '2024-07-06 19:19:25.519189+00'),
	(592, 50, -69, 'Bad-Luck Brown Space on turn 2', '2024-07-06 19:19:25.519189+00', '2024-07-06 19:19:25.519189+00'),
	(593, 51, -69, 'Bad-Luck Brown Space on turn 2', '2024-07-06 19:19:25.519189+00', '2024-07-06 19:19:25.519189+00'),
	(594, 54, -69, 'Bad-Luck Brown Space on turn 2', '2024-07-06 19:19:25.519189+00', '2024-07-06 19:19:25.519189+00'),
	(595, 48, -69, 'Wager for bet against Tyler that ''Dan Loses in the Everyone must poop their pants Event''', '2024-07-06 19:23:19.125731+00', '2024-07-06 19:23:19.125731+00'),
	(596, 54, -69, 'Wager for Josh smell''s bet that ''Dan Loses in the Everyone must poop their pants Event''', '2024-07-06 19:23:19.125731+00', '2024-07-06 19:23:19.125731+00'),
	(597, 49, -23, 'Buddy''s On the Line Space event for turn 2: Lose 10% of your points if you fail to immediately poop your pants', '2024-07-06 19:24:02.884751+00', '2024-07-06 19:24:02.884751+00'),
	(598, 50, -7, 'Buddy''s On the Line Space event for turn 2: Lose 10% of your points if you fail to immediately poop your pants', '2024-07-06 19:24:02.884751+00', '2024-07-06 19:24:02.884751+00'),
	(599, 48, 138, 'Won bet against Tyler that ''Dan Loses in the Everyone must poop their pants Event''', '2024-07-06 19:24:02.884751+00', '2024-07-06 19:24:02.884751+00'),
	(600, 53, 2, 'Won bet against Dan that ''Team  Dan finishes in the Bottom 2 teams in the Chode Chomp Event''', '2024-07-06 23:05:53.286388+00', '2024-07-06 23:05:53.286388+00'),
	(601, 51, 2, 'Won Buddy''s bet that ''Team Dan finishes in the Top 2 teams in the Chode Chomp Event''', '2024-07-06 23:05:53.286388+00', '2024-07-06 23:05:53.286388+00'),
	(602, 49, 2, 'Won Buddy''s bet that ''Team  Dan finishes in the Bottom 2 teams in the Chode Chomp Event''', '2024-07-06 23:06:10.662615+00', '2024-07-06 23:06:10.662615+00'),
	(603, 53, 2, 'Won bet against Adam P that ''Team Dan finishes in the Top 2 teams in the Chode Chomp Event''', '2024-07-06 23:06:10.662615+00', '2024-07-06 23:06:10.662615+00'),
	(604, 53, 2, 'Won bet against Dan that ''Team  Dan finishes in the Bottom 2 teams in the Chode Chomp Event''', '2024-07-06 23:06:28.661217+00', '2024-07-06 23:06:28.661217+00'),
	(605, 51, 2, 'Won Buddy''s bet that ''Team Dan finishes in the Top 2 teams in the Chode Chomp Event''', '2024-07-06 23:06:28.661217+00', '2024-07-06 23:06:28.661217+00'),
	(606, 51, 2, 'Won Buddy''s bet that ''Team Dan finishes in the Top 2 teams in the Chode Chomp Event''', '2024-07-06 23:06:58.216957+00', '2024-07-06 23:06:58.216957+00'),
	(607, 49, 2, 'Won Buddy''s bet that ''Team  Dan finishes in the Bottom 2 teams in the Chode Chomp Event''', '2024-07-06 23:06:58.216957+00', '2024-07-06 23:06:58.216957+00'),
	(608, 53, 2, 'Won bet against Adam P that ''Team Dan finishes in the Top 2 teams in the Chode Chomp Event''', '2024-07-06 23:08:28.769492+00', '2024-07-06 23:08:28.769492+00'),
	(610, 53, 2, 'Won bet against Dan that ''Team  Dan finishes in the Bottom 2 teams in the Chode Chomp Event''', '2024-07-06 23:30:53.458633+00', '2024-07-06 23:30:53.458633+00'),
	(611, 49, 2, 'Won Buddy''s bet that ''Team  Dan finishes in the Bottom 2 teams in the Chode Chomp Event''', '2024-07-06 23:31:13.210429+00', '2024-07-06 23:31:13.210429+00'),
	(612, 53, 2, 'Won bet against Dan that ''Team  Dan finishes in the Bottom 2 teams in the Chode Chomp Event''', '2024-07-07 00:22:36.60631+00', '2024-07-07 00:22:36.60631+00'),
	(613, 53, 2, 'Won bet against Dan that ''Team  Dan finishes in the Bottom 2 teams in the Chode Chomp Event''', '2024-07-07 00:22:58.543959+00', '2024-07-07 00:22:58.543959+00'),
	(614, 53, 2, 'Won bet against Dan that ''Team  Dan finishes in the Bottom 2 teams in the Chode Chomp Event''', '2024-07-07 00:23:17.391465+00', '2024-07-07 00:23:17.391465+00'),
	(615, 53, 2, 'Won bet against Dan that ''Team  Dan finishes in the Bottom 2 teams in the Chode Chomp Event''', '2024-07-07 00:30:29.338395+00', '2024-07-07 00:30:29.338395+00'),
	(616, 49, 2, 'Won Buddy''s bet that ''Team  Dan finishes in the Bottom 2 teams in the Chode Chomp Event''', '2024-07-07 00:31:25.035891+00', '2024-07-07 00:31:25.035891+00'),
	(617, 53, 2, 'Won bet against Dan that ''Team  Dan finishes in the Bottom 2 teams in the Chode Chomp Event''', '2024-07-07 00:31:45.229362+00', '2024-07-07 00:31:45.229362+00'),
	(618, 49, 2, 'Won Buddy''s bet that ''Team  Dan finishes in the Bottom 2 teams in the Chode Chomp Event''', '2024-07-07 00:31:58.375256+00', '2024-07-07 00:31:58.375256+00'),
	(619, 53, 2, 'Won bet against Adam P that ''Team Dan finishes in the Top 2 teams in the Chode Chomp Event''', '2024-07-07 00:47:18.716322+00', '2024-07-07 00:47:18.716322+00'),
	(620, 53, 2, 'Won bet against Dan that ''Team  Dan finishes in the Bottom 2 teams in the Chode Chomp Event''', '2024-07-07 00:47:18.716322+00', '2024-07-07 00:47:18.716322+00'),
	(621, 53, 2, 'Won bet against Adam P that ''Team Dan finishes in the Top 2 teams in the Chode Chomp Event''', '2024-07-07 00:48:01.796038+00', '2024-07-07 00:48:01.796038+00'),
	(622, 53, 2, 'Won bet against Dan that ''Team  Dan finishes in the Bottom 2 teams in the Chode Chomp Event''', '2024-07-07 00:48:01.796038+00', '2024-07-07 00:48:01.796038+00'),
	(623, 51, 2, 'Won Buddy''s bet that ''Team Dan finishes in the Top 2 teams in the Chode Chomp Event''', '2024-07-07 01:01:23.397167+00', '2024-07-07 01:01:23.397167+00'),
	(624, 49, 2, 'Won Buddy''s bet that ''Team  Dan finishes in the Bottom 2 teams in the Chode Chomp Event''', '2024-07-07 01:01:23.397167+00', '2024-07-07 01:01:23.397167+00'),
	(625, 51, 2, 'Won Buddy''s bet that ''Team Dan finishes in the Top 2 teams in the Chode Chomp Event''', '2024-07-07 01:12:23.765986+00', '2024-07-07 01:12:23.765986+00'),
	(626, 49, 2, 'Won Buddy''s bet that ''Team  Dan finishes in the Bottom 2 teams in the Chode Chomp Event''', '2024-07-07 01:12:23.765986+00', '2024-07-07 01:12:23.765986+00'),
	(627, 51, 2, 'Won Buddy''s bet that ''Team Dan finishes in the Top 2 teams in the Chode Chomp Event''', '2024-07-07 01:14:46.27277+00', '2024-07-07 01:14:46.27277+00'),
	(628, 49, 2, 'Won Buddy''s bet that ''Team  Dan finishes in the Bottom 2 teams in the Chode Chomp Event''', '2024-07-07 01:14:46.27277+00', '2024-07-07 01:14:46.27277+00'),
	(629, 53, 2, 'Won bet against Dan that ''Team  Dan finishes in the Bottom 2 teams in the Chode Chomp Event''', '2024-07-07 01:15:22.324562+00', '2024-07-07 01:15:22.324562+00'),
	(630, 53, 2, 'Won bet against Adam P that ''Team Dan finishes in the Top 2 teams in the Chode Chomp Event''', '2024-07-07 01:15:22.324562+00', '2024-07-07 01:15:22.324562+00'),
	(631, 53, 2, 'Won bet against Dan that ''Team  Dan finishes in the Bottom 2 teams in the Chode Chomp Event''', '2024-07-07 01:16:08.097905+00', '2024-07-07 01:16:08.097905+00'),
	(632, 51, 2, 'Won Buddy''s bet that ''Team Dan finishes in the Top 2 teams in the Chode Chomp Event''', '2024-07-07 01:16:08.097905+00', '2024-07-07 01:16:08.097905+00'),
	(633, 53, 2, 'Won bet against Adam P that ''Team Timmy scores Over 0.5 in the Chode Chomp Event''', '2024-07-07 13:08:05.444854+00', '2024-07-07 13:08:05.444854+00'),
	(634, 53, 1, 'Push for bet against Adam P that ''Team Timmy scores Over 2 in the Chode Chomp Event''', '2024-07-07 13:08:05.444854+00', '2024-07-07 13:08:05.444854+00'),
	(635, 51, 1, 'Push for Buddy''s bet that ''Team Timmy scores Over 2 in the Chode Chomp Event''', '2024-07-07 13:08:05.444854+00', '2024-07-07 13:08:05.444854+00'),
	(636, 53, 2, 'Won bet against Adam P that ''Team Timmy scores Under 3 in the Chode Chomp Event''', '2024-07-07 13:08:05.444854+00', '2024-07-07 13:08:05.444854+00'),
	(637, 51, 2, 'Won Buddy''s bet that ''Team Timmy scores Under 0.5 in the Chode Chomp Event''', '2024-07-07 13:08:05.444854+00', '2024-07-07 13:08:05.444854+00'),
	(638, 48, 10, 'Blue Space on turn 11', '2024-07-07 14:11:17.326037+00', '2024-07-07 14:11:17.326037+00'),
	(639, 53, 2, 'Won bet against Adam P that ''Dan will land on a(n) Bad-Luck Brown space next''', '2024-07-07 14:11:17.326037+00', '2024-07-07 14:11:17.326037+00'),
	(640, 49, -69, 'Bad-Luck Brown Space on turn 11', '2024-07-07 14:11:17.326037+00', '2024-07-07 14:11:17.326037+00'),
	(641, 50, 10, 'Blue Space on turn 11', '2024-07-07 14:11:17.326037+00', '2024-07-07 14:11:17.326037+00'),
	(642, 51, 2, 'Won Buddy''s bet that ''Adam P will land on a(n) Blue space next''', '2024-07-07 14:11:17.326037+00', '2024-07-07 14:11:17.326037+00'),
	(643, 51, -10, 'Red Space on turn 11', '2024-07-07 14:11:17.326037+00', '2024-07-07 14:11:17.326037+00'),
	(644, 53, 10, 'Blue Space on turn 11', '2024-07-07 14:11:17.326037+00', '2024-07-07 14:11:17.326037+00'),
	(645, 54, 10, 'Blue Space on turn 11', '2024-07-07 14:11:17.326037+00', '2024-07-07 14:11:17.326037+00'),
	(646, 54, 0, 'Points earned during round 3', '2024-07-09 16:26:49.967899+00', '2024-07-09 16:26:49.967899+00'),
	(647, 51, 0, 'Points earned during round 3', '2024-07-09 16:26:49.967899+00', '2024-07-09 16:26:49.967899+00'),
	(648, 48, 2, 'Points earned during round 3', '2024-07-09 16:26:49.967899+00', '2024-07-09 16:26:49.967899+00'),
	(649, 53, 2, 'Points earned during round 3', '2024-07-09 16:26:49.967899+00', '2024-07-09 16:26:49.967899+00'),
	(650, 50, 3, 'Points earned during round 3', '2024-07-09 16:26:49.967899+00', '2024-07-09 16:26:49.967899+00'),
	(651, 49, 3, 'Points earned during round 3', '2024-07-09 16:26:49.967899+00', '2024-07-09 16:26:49.967899+00'),
	(653, 53, 7, 'Won Dan''s bet that ''pls cancel this j''', '2024-07-10 20:54:35.012954+00', '2024-07-10 20:54:35.012954+00'),
	(654, 49, 7, 'Won bet against Buddy that ''pls cancel this j''', '2024-07-10 20:55:12.84177+00', '2024-07-10 20:55:12.84177+00'),
	(655, 49, 7, 'Won bet against Buddy that ''pls cancel this j''', '2024-07-10 20:55:27.994086+00', '2024-07-10 20:55:27.994086+00'),
	(656, 53, 7, 'Won Dan''s bet that ''pls cancel this j''', '2024-07-10 20:55:34.155003+00', '2024-07-10 20:55:34.155003+00'),
	(657, 53, -2, 'Wager for bet against Josh that ''This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words ''', '2024-07-11 02:39:19.265051+00', '2024-07-11 02:39:19.265051+00'),
	(658, 48, -2, 'Wager for Buddy''s bet that ''This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words ''', '2024-07-11 02:39:19.265051+00', '2024-07-11 02:39:19.265051+00'),
	(659, 53, -1, 'Wager for bet against Josh that ''Blah''', '2024-07-11 02:41:43.943623+00', '2024-07-11 02:41:43.943623+00'),
	(660, 48, -1, 'Wager for Buddy''s bet that ''Blah''', '2024-07-11 02:41:43.943623+00', '2024-07-11 02:41:43.943623+00'),
	(661, 53, -2, 'Wager for bet against Josh that ''Blah blah''', '2024-07-11 02:41:45.944838+00', '2024-07-11 02:41:45.944838+00'),
	(662, 48, -2, 'Wager for Buddy''s bet that ''Blah blah''', '2024-07-11 02:41:45.944838+00', '2024-07-11 02:41:45.944838+00'),
	(663, 53, 2, 'Canceled by GM: Bet against Josh that ''Blah blah''', '2024-07-11 02:43:27.776043+00', '2024-07-11 02:43:27.776043+00'),
	(664, 48, 2, 'Canceled by GM: Buddy''s bet that ''Blah blah''', '2024-07-11 02:43:27.776043+00', '2024-07-11 02:43:27.776043+00'),
	(665, 53, 1, 'Canceled by GM: Bet against Josh that ''Blah''', '2024-07-11 02:43:36.741112+00', '2024-07-11 02:43:36.741112+00'),
	(666, 48, 1, 'Canceled by GM: Buddy''s bet that ''Blah''', '2024-07-11 02:43:36.741112+00', '2024-07-11 02:43:36.741112+00'),
	(667, 53, 2, 'Canceled by GM: Bet against Josh that ''This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words ''', '2024-07-11 02:43:41.155584+00', '2024-07-11 02:43:41.155584+00'),
	(668, 48, 2, 'Canceled by GM: Buddy''s bet that ''This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words This is a test bet with a lot of words ''', '2024-07-11 02:43:41.155584+00', '2024-07-11 02:43:41.155584+00'),
	(669, 53, 1, 'Canceled by GM: Bet against Tyler that ''lzs''', '2024-07-11 02:45:31.133259+00', '2024-07-11 02:45:31.133259+00'),
	(670, 54, 1, 'Canceled by GM: Buddy''s bet that ''lzs''', '2024-07-11 02:45:31.133259+00', '2024-07-11 02:45:31.133259+00'),
	(671, 53, 1, 'Canceled by GM: Bet against Tyler that ''asd''', '2024-07-11 02:45:32.924957+00', '2024-07-11 02:45:32.924957+00'),
	(672, 54, 1, 'Canceled by GM: Buddy''s bet that ''asd''', '2024-07-11 02:45:32.924957+00', '2024-07-11 02:45:32.924957+00'),
	(673, 53, -1, 'Wager for bet against Josh that ''Xhxjxk''', '2024-07-11 02:45:59.329981+00', '2024-07-11 02:45:59.329981+00'),
	(674, 48, -1, 'Wager for Buddy''s bet that ''Xhxjxk''', '2024-07-11 02:45:59.329981+00', '2024-07-11 02:45:59.329981+00'),
	(675, 53, -1, 'Wager for bet against Josh that ''Xhdhsjs''', '2024-07-11 02:49:17.100568+00', '2024-07-11 02:49:17.100568+00'),
	(676, 48, -2, 'Wager for Buddy''s bet that ''Xhdhsjs''', '2024-07-11 02:49:17.100568+00', '2024-07-11 02:49:17.100568+00'),
	(677, 53, 1, 'Canceled by GM: Bet against Josh that ''Xhdhsjs''', '2024-07-11 02:49:33.692438+00', '2024-07-11 02:49:33.692438+00'),
	(678, 48, 2, 'Canceled by GM: Buddy''s bet that ''Xhdhsjs''', '2024-07-11 02:49:33.692438+00', '2024-07-11 02:49:33.692438+00'),
	(679, 53, 1, 'Canceled by GM: Bet against Josh that ''Xhxjxk''', '2024-07-11 02:49:36.382854+00', '2024-07-11 02:49:36.382854+00'),
	(680, 48, 1, 'Canceled by GM: Buddy''s bet that ''Xhxjxk''', '2024-07-11 02:49:36.382854+00', '2024-07-11 02:49:36.382854+00'),
	(681, 53, -2, 'Wager for bet against Josh that ''Fuck''', '2024-07-11 02:56:41.119603+00', '2024-07-11 02:56:41.119603+00'),
	(682, 48, -2, 'Wager for Buddy''s bet that ''Fuck''', '2024-07-11 02:56:41.119603+00', '2024-07-11 02:56:41.119603+00'),
	(683, 53, -3, 'Wager for bet against Josh that ''Fuck 2''', '2024-07-11 02:57:42.909325+00', '2024-07-11 02:57:42.909325+00'),
	(684, 48, -3, 'Wager for Buddy''s bet that ''Fuck 2''', '2024-07-11 02:57:42.909325+00', '2024-07-11 02:57:42.909325+00'),
	(685, 53, -1, 'Wager for bet against Josh that ''Fuck 3''', '2024-07-11 02:57:44.105866+00', '2024-07-11 02:57:44.105866+00'),
	(686, 48, -2, 'Wager for Buddy''s bet that ''Fuck 3''', '2024-07-11 02:57:44.105866+00', '2024-07-11 02:57:44.105866+00'),
	(687, 53, -2, 'Wager for bet against Josh that ''Fuck 4''', '2024-07-11 02:57:45.431447+00', '2024-07-11 02:57:45.431447+00'),
	(688, 48, -2, 'Wager for Buddy''s bet that ''Fuck 4''', '2024-07-11 02:57:45.431447+00', '2024-07-11 02:57:45.431447+00'),
	(689, 53, -3, 'Wager for bet against Josh that ''Fuck 5''', '2024-07-11 02:57:47.028358+00', '2024-07-11 02:57:47.028358+00'),
	(690, 48, -3, 'Wager for Buddy''s bet that ''Fuck 5''', '2024-07-11 02:57:47.028358+00', '2024-07-11 02:57:47.028358+00'),
	(691, 53, -1, 'Wager for bet against Josh that ''Xhxh''', '2024-07-11 03:05:48.870916+00', '2024-07-11 03:05:48.870916+00'),
	(692, 48, -1, 'Wager for Buddy''s bet that ''Xhxh''', '2024-07-11 03:05:48.870916+00', '2024-07-11 03:05:48.870916+00'),
	(693, 53, 1, 'Canceled by GM: Bet against Josh that ''Xhxh''', '2024-07-11 03:08:40.515217+00', '2024-07-11 03:08:40.515217+00'),
	(694, 48, 1, 'Canceled by GM: Buddy''s bet that ''Xhxh''', '2024-07-11 03:08:40.515217+00', '2024-07-11 03:08:40.515217+00'),
	(695, 53, 3, 'Canceled by GM: Bet against Josh that ''Fuck 2''', '2024-07-11 03:09:30.634085+00', '2024-07-11 03:09:30.634085+00'),
	(696, 48, 3, 'Canceled by GM: Buddy''s bet that ''Fuck 2''', '2024-07-11 03:09:30.634085+00', '2024-07-11 03:09:30.634085+00'),
	(697, 53, -1, 'Wager for bet against Josh that ''Didjd''', '2024-07-11 03:11:29.333578+00', '2024-07-11 03:11:29.333578+00'),
	(698, 48, -1, 'Wager for Buddy''s bet that ''Didjd''', '2024-07-11 03:11:29.333578+00', '2024-07-11 03:11:29.333578+00'),
	(699, 53, -1, 'Wager for bet against Josh that ''Cmckdhs''', '2024-07-11 03:11:30.90595+00', '2024-07-11 03:11:30.90595+00'),
	(700, 48, -1, 'Wager for Buddy''s bet that ''Cmckdhs''', '2024-07-11 03:11:30.90595+00', '2024-07-11 03:11:30.90595+00'),
	(701, 53, 1, 'Canceled by GM: Bet against Josh that ''Cmckdhs''', '2024-07-11 03:11:42.463433+00', '2024-07-11 03:11:42.463433+00'),
	(702, 48, 1, 'Canceled by GM: Buddy''s bet that ''Cmckdhs''', '2024-07-11 03:11:42.463433+00', '2024-07-11 03:11:42.463433+00'),
	(703, 53, -1, 'Wager for bet against Josh that '' Jxjx''', '2024-07-11 03:18:03.997724+00', '2024-07-11 03:18:03.997724+00'),
	(704, 48, -1, 'Wager for Buddy''s bet that '' Jxjx''', '2024-07-11 03:18:03.997724+00', '2024-07-11 03:18:03.997724+00'),
	(705, 48, -1, 'Wager for bet against Buddy that ''cscassca''', '2024-07-12 02:14:07.313157+00', '2024-07-12 02:14:07.313157+00'),
	(706, 53, -1, 'Wager for Josh''s bet that ''cscassca''', '2024-07-12 02:14:07.313157+00', '2024-07-12 02:14:07.313157+00'),
	(707, 48, -2, 'Wager for bet against Buddy that ''vsger''', '2024-07-12 02:14:41.517921+00', '2024-07-12 02:14:41.517921+00'),
	(708, 53, -2, 'Wager for Josh''s bet that ''vsger''', '2024-07-12 02:14:41.517921+00', '2024-07-12 02:14:41.517921+00'),
	(709, 48, -4, 'Wager for bet against Buddy that ''bfdbfsb''', '2024-07-12 02:14:56.045596+00', '2024-07-12 02:14:56.045596+00'),
	(710, 53, -4, 'Wager for Josh''s bet that ''bfdbfsb''', '2024-07-12 02:14:56.045596+00', '2024-07-12 02:14:56.045596+00'),
	(711, 48, -1, 'Wager for bet against Buddy that ''i wonder if buddy is getting a bunch of notifications right now''', '2024-07-12 02:15:18.322541+00', '2024-07-12 02:15:18.322541+00'),
	(712, 53, -1, 'Wager for Josh''s bet that ''i wonder if buddy is getting a bunch of notifications right now''', '2024-07-12 02:15:18.322541+00', '2024-07-12 02:15:18.322541+00'),
	(713, 48, 2, 'Canceled by GM: Bet against Buddy that ''vsger''', '2024-07-12 02:16:59.345778+00', '2024-07-12 02:16:59.345778+00'),
	(714, 53, 2, 'Canceled by GM: Josh''s bet that ''vsger''', '2024-07-12 02:16:59.345778+00', '2024-07-12 02:16:59.345778+00'),
	(715, 48, 4, 'Canceled by GM: Bet against Buddy that ''bfdbfsb''', '2024-07-12 02:17:19.714293+00', '2024-07-12 02:17:19.714293+00'),
	(716, 53, 4, 'Canceled by GM: Josh''s bet that ''bfdbfsb''', '2024-07-12 02:17:19.714293+00', '2024-07-12 02:17:19.714293+00'),
	(717, 48, 1, 'Canceled by GM: Bet against Buddy that ''i wonder if buddy is getting a bunch of notifications right now''', '2024-07-12 02:17:54.962367+00', '2024-07-12 02:17:54.962367+00'),
	(718, 53, 1, 'Canceled by GM: Josh''s bet that ''i wonder if buddy is getting a bunch of notifications right now''', '2024-07-12 02:17:54.962367+00', '2024-07-12 02:17:54.962367+00'),
	(719, 53, -1, 'Wager for bet against Josh that '' Hxnx''', '2024-07-12 02:20:02.387689+00', '2024-07-12 02:20:02.387689+00'),
	(720, 48, -2, 'Wager for Buddy''s bet that '' Hxnx''', '2024-07-12 02:20:02.387689+00', '2024-07-12 02:20:02.387689+00'),
	(721, 53, -1, 'Wager for bet against Josh that ''Duxjx''', '2024-07-12 02:20:03.747828+00', '2024-07-12 02:20:03.747828+00'),
	(722, 48, -1, 'Wager for Buddy''s bet that ''Duxjx''', '2024-07-12 02:20:03.747828+00', '2024-07-12 02:20:03.747828+00'),
	(723, 53, 1, 'Canceled by GM: Bet against Josh that ''Duxjx''', '2024-07-12 02:21:00.992766+00', '2024-07-12 02:21:00.992766+00'),
	(724, 48, 1, 'Canceled by GM: Buddy''s bet that ''Duxjx''', '2024-07-12 02:21:00.992766+00', '2024-07-12 02:21:00.992766+00'),
	(725, 53, 1, 'Canceled by GM: Bet against Josh that ''Didjd''', '2024-07-12 02:21:30.649335+00', '2024-07-12 02:21:30.649335+00'),
	(726, 48, 1, 'Canceled by GM: Buddy''s bet that ''Didjd''', '2024-07-12 02:21:30.649335+00', '2024-07-12 02:21:30.649335+00'),
	(727, 53, 3, 'Canceled by GM: Bet against Josh that ''Fuck 5''', '2024-07-12 02:21:41.106509+00', '2024-07-12 02:21:41.106509+00'),
	(728, 48, 3, 'Canceled by GM: Buddy''s bet that ''Fuck 5''', '2024-07-12 02:21:41.106509+00', '2024-07-12 02:21:41.106509+00'),
	(729, 53, 2, 'Canceled by GM: Bet against Josh that ''Fuck''', '2024-07-12 02:22:03.087821+00', '2024-07-12 02:22:03.087821+00'),
	(730, 48, 2, 'Canceled by GM: Buddy''s bet that ''Fuck''', '2024-07-12 02:22:03.087821+00', '2024-07-12 02:22:03.087821+00'),
	(731, 53, -1, 'Wager for bet against Josh that ''Xjxjx''', '2024-07-12 02:22:39.082549+00', '2024-07-12 02:22:39.082549+00'),
	(732, 48, -1, 'Wager for Buddy''s bet that ''Xjxjx''', '2024-07-12 02:22:39.082549+00', '2024-07-12 02:22:39.082549+00'),
	(733, 53, -1, 'Wager for bet against Josh that ''Eeyuoojhgfd''', '2024-07-12 02:23:06.782569+00', '2024-07-12 02:23:06.782569+00'),
	(734, 48, -1, 'Wager for Buddy''s bet that ''Eeyuoojhgfd''', '2024-07-12 02:23:06.782569+00', '2024-07-12 02:23:06.782569+00'),
	(735, 53, 1, 'Canceled by GM: Bet against Josh that ''Fuck 3''', '2024-07-12 02:24:13.014194+00', '2024-07-12 02:24:13.014194+00'),
	(736, 48, 2, 'Canceled by GM: Buddy''s bet that ''Fuck 3''', '2024-07-12 02:24:13.014194+00', '2024-07-12 02:24:13.014194+00'),
	(737, 48, 1, 'Canceled by GM: Bet against Buddy that ''cscassca''', '2024-07-12 02:24:24.928049+00', '2024-07-12 02:24:24.928049+00'),
	(738, 53, 1, 'Canceled by GM: Josh''s bet that ''cscassca''', '2024-07-12 02:24:24.928049+00', '2024-07-12 02:24:24.928049+00'),
	(739, 53, 1, 'Canceled by GM: Bet against Josh that ''Eeyuoojhgfd''', '2024-07-12 02:31:00.748199+00', '2024-07-12 02:31:00.748199+00'),
	(740, 48, 1, 'Canceled by GM: Buddy''s bet that ''Eeyuoojhgfd''', '2024-07-12 02:31:00.748199+00', '2024-07-12 02:31:00.748199+00'),
	(741, 53, -1, 'Wager for bet against Josh that ''Dhxnxj''', '2024-07-12 02:34:10.522656+00', '2024-07-12 02:34:10.522656+00'),
	(742, 48, -1, 'Wager for Buddy''s bet that ''Dhxnxj''', '2024-07-12 02:34:10.522656+00', '2024-07-12 02:34:10.522656+00'),
	(743, 53, -1, 'Wager for bet against Josh that ''Hxjxnxxnkx''', '2024-07-12 02:34:12.003777+00', '2024-07-12 02:34:12.003777+00'),
	(744, 48, -1, 'Wager for Buddy''s bet that ''Hxjxnxxnkx''', '2024-07-12 02:34:12.003777+00', '2024-07-12 02:34:12.003777+00'),
	(745, 53, 1, 'Canceled by GM: Bet against Josh that ''Hxjxnxxnkx''', '2024-07-12 02:34:24.067819+00', '2024-07-12 02:34:24.067819+00'),
	(746, 48, 1, 'Canceled by GM: Buddy''s bet that ''Hxjxnxxnkx''', '2024-07-12 02:34:24.067819+00', '2024-07-12 02:34:24.067819+00'),
	(747, 53, -1, 'Wager for bet against Josh that ''Blah blah''', '2024-07-12 02:44:30.537474+00', '2024-07-12 02:44:30.537474+00'),
	(748, 48, -1, 'Wager for Buddy''s bet that ''Blah blah''', '2024-07-12 02:44:30.537474+00', '2024-07-12 02:44:30.537474+00'),
	(749, 53, 1, 'Canceled by GM: Bet against Josh that ''Blah blah''', '2024-07-12 02:44:48.597957+00', '2024-07-12 02:44:48.597957+00'),
	(750, 48, 1, 'Canceled by GM: Buddy''s bet that ''Blah blah''', '2024-07-12 02:44:48.597957+00', '2024-07-12 02:44:48.597957+00'),
	(751, 53, -1, 'Wager for bet against Josh that ''Duxjj k k ''', '2024-07-12 02:45:20.858053+00', '2024-07-12 02:45:20.858053+00'),
	(752, 48, -1, 'Wager for Buddy''s bet that ''Duxjj k k ''', '2024-07-12 02:45:20.858053+00', '2024-07-12 02:45:20.858053+00'),
	(753, 53, 1, 'Canceled by GM: Bet against Josh that ''Xjxjx''', '2024-07-12 02:45:29.283614+00', '2024-07-12 02:45:29.283614+00'),
	(833, 88, 30, 'Points earned from Mini Golf', '2024-08-06 04:32:39.189135+00', '2024-08-06 04:32:39.189135+00'),
	(754, 48, 1, 'Canceled by GM: Buddy''s bet that ''Xjxjx''', '2024-07-12 02:45:29.283614+00', '2024-07-12 02:45:29.283614+00'),
	(755, 53, -1, 'Wager for bet against Josh that ''Hi''', '2024-07-12 02:50:53.061414+00', '2024-07-12 02:50:53.061414+00'),
	(756, 48, -1, 'Wager for Buddy''s bet that ''Hi''', '2024-07-12 02:50:53.061414+00', '2024-07-12 02:50:53.061414+00'),
	(757, 51, 12, 'Points earned from Wrench Wrap', '2024-07-12 06:21:50.55129+00', '2024-07-12 06:21:50.55129+00'),
	(758, 51, 7, 'Points earned from Wrench Wrap', '2024-07-12 06:24:12.620519+00', '2024-07-12 06:24:12.620519+00'),
	(759, 51, 14, 'Points earned from Wrench Wrap', '2024-07-12 06:25:09.920185+00', '2024-07-12 06:25:09.920185+00'),
	(760, 49, 6, 'Points earned from Ernest', '2024-07-12 06:25:58.414202+00', '2024-07-12 06:25:58.414202+00'),
	(761, 54, 1, 'Points earned from Ernest', '2024-07-12 06:25:58.414202+00', '2024-07-12 06:25:58.414202+00'),
	(762, 48, 3, 'Points earned from Ernest', '2024-07-12 06:25:58.414202+00', '2024-07-12 06:25:58.414202+00'),
	(763, 53, 4, 'Points earned from Ernest', '2024-07-12 06:25:58.414202+00', '2024-07-12 06:25:58.414202+00'),
	(764, 50, 1, 'Points earned from Ernest', '2024-07-12 06:25:58.414202+00', '2024-07-12 06:25:58.414202+00'),
	(765, 51, 3, 'Points earned from Ernest', '2024-07-12 06:25:58.414202+00', '2024-07-12 06:25:58.414202+00'),
	(766, 48, -1, 'Wager for bet against Buddy that ''Leo will piss himself.''', '2024-07-12 22:00:40.740742+00', '2024-07-12 22:00:40.740742+00'),
	(767, 53, -1, 'Wager for Josh''s bet that ''Leo will piss himself.''', '2024-07-12 22:00:40.740742+00', '2024-07-12 22:00:40.740742+00'),
	(768, 48, -1, 'Wager for bet against Buddy that ''Hi again buddy''', '2024-07-12 22:00:43.502783+00', '2024-07-12 22:00:43.502783+00'),
	(769, 53, -1, 'Wager for Josh''s bet that ''Hi again buddy''', '2024-07-12 22:00:43.502783+00', '2024-07-12 22:00:43.502783+00'),
	(770, 48, 10, 'Blue Space on turn 3', '2024-07-12 22:01:47.982381+00', '2024-07-12 22:01:47.982381+00'),
	(771, 50, 10, 'Blue Space on turn 3', '2024-07-12 22:01:47.982381+00', '2024-07-12 22:01:47.982381+00'),
	(772, 51, 10, 'Blue Space on turn 3', '2024-07-12 22:01:47.982381+00', '2024-07-12 22:01:47.982381+00'),
	(773, 54, 10, 'Blue Space on turn 3', '2024-07-12 22:01:47.982381+00', '2024-07-12 22:01:47.982381+00'),
	(774, 76, 10, 'Blue Space on turn 3', '2024-07-12 22:01:47.982381+00', '2024-07-12 22:01:47.982381+00'),
	(775, 51, 18, 'Special Space event for turn 3: 9 flips in Flip Cup', '2024-07-12 22:02:21.444698+00', '2024-07-12 22:02:21.444698+00'),
	(776, 49, 84, 'Duel in turn 3: You beat Buddy in Air Hockey', '2024-07-12 22:10:45.077935+00', '2024-07-12 22:10:45.077935+00'),
	(777, 53, -83, 'Duel in turn 3: Dan beat you in Air Hockey', '2024-07-12 22:10:45.077935+00', '2024-07-12 22:10:45.077935+00'),
	(778, 87, 10, 'Blue Space on turn 1', '2024-08-06 03:29:11.899827+00', '2024-08-06 03:29:11.899827+00'),
	(779, 88, -10, 'Red Space on turn 1', '2024-08-06 03:29:11.899827+00', '2024-08-06 03:29:11.899827+00'),
	(780, 90, 10, 'Blue Space on turn 1', '2024-08-06 03:29:11.899827+00', '2024-08-06 03:29:11.899827+00'),
	(781, 91, 10, 'Blue Space on turn 1', '2024-08-06 03:29:11.899827+00', '2024-08-06 03:29:11.899827+00'),
	(782, 92, 10, 'Blue Space on turn 1', '2024-08-06 03:29:11.899827+00', '2024-08-06 03:29:11.899827+00'),
	(783, 93, -10, 'Red Space on turn 1', '2024-08-06 03:29:11.899827+00', '2024-08-06 03:29:11.899827+00'),
	(784, 94, 10, 'Blue Space on turn 1', '2024-08-06 03:29:11.899827+00', '2024-08-06 03:29:11.899827+00'),
	(785, 95, 10, 'Blue Space on turn 1', '2024-08-06 03:29:11.899827+00', '2024-08-06 03:29:11.899827+00'),
	(786, 89, 3, 'Duel in turn 1: You beat Brittany in Rock-Paper-Scissors', '2024-08-06 03:29:47.081543+00', '2024-08-06 03:29:47.081543+00'),
	(787, 90, -2, 'Duel in turn 1: Ellie beat you in Rock-Paper-Scissors', '2024-08-06 03:29:47.081543+00', '2024-08-06 03:29:47.081543+00'),
	(788, 91, -5, 'Duel in turn 1: Colin beat you in Push-up Contest', '2024-08-06 03:30:10.392592+00', '2024-08-06 03:30:10.392592+00'),
	(789, 96, 5, 'Duel in turn 1: You beat Dan in Push-up Contest', '2024-08-06 03:30:10.392592+00', '2024-08-06 03:30:10.392592+00'),
	(790, 87, 10, 'Blue Space on turn 1', '2024-08-06 04:05:25.279024+00', '2024-08-06 04:05:25.279024+00'),
	(791, 88, -10, 'Red Space on turn 1', '2024-08-06 04:05:25.279024+00', '2024-08-06 04:05:25.279024+00'),
	(792, 89, 10, 'Blue Space on turn 1', '2024-08-06 04:05:25.279024+00', '2024-08-06 04:05:25.279024+00'),
	(793, 90, 10, 'Blue Space on turn 1', '2024-08-06 04:05:25.279024+00', '2024-08-06 04:05:25.279024+00'),
	(794, 91, -10, 'Red Space on turn 1', '2024-08-06 04:05:25.279024+00', '2024-08-06 04:05:25.279024+00'),
	(795, 92, -10, 'Red Space on turn 1', '2024-08-06 04:05:25.279024+00', '2024-08-06 04:05:25.279024+00'),
	(796, 95, 50, 'Bank Space on turn 1', '2024-08-06 04:05:25.279024+00', '2024-08-06 04:05:25.279024+00'),
	(797, 96, -10, 'Red Space on turn 1', '2024-08-06 04:05:25.279024+00', '2024-08-06 04:05:25.279024+00'),
	(798, 93, 15, 'Duel in turn 1: You beat Josh in Paper Airplanes', '2024-08-06 04:05:50.751682+00', '2024-08-06 04:05:50.751682+00'),
	(799, 95, -15, 'Duel in turn 1: Alyssa beat you in Paper Airplanes', '2024-08-06 04:05:50.751682+00', '2024-08-06 04:05:50.751682+00'),
	(800, 90, -4, 'Duel in turn 1: Leo beat you in Ping Pong (3-point game)', '2024-08-06 04:06:03.672306+00', '2024-08-06 04:06:03.672306+00'),
	(801, 94, 5, 'Duel in turn 1: You beat Brittany in Ping Pong (3-point game)', '2024-08-06 04:06:03.672306+00', '2024-08-06 04:06:03.672306+00'),
	(802, 95, 16, 'Points earned from Cornhole', '2024-08-06 04:06:45.505731+00', '2024-08-06 04:06:45.505731+00'),
	(803, 96, 16, 'Points earned from Cornhole', '2024-08-06 04:06:45.505731+00', '2024-08-06 04:06:45.505731+00'),
	(804, 88, 12, 'Points earned from Cornhole', '2024-08-06 04:06:45.505731+00', '2024-08-06 04:06:45.505731+00'),
	(805, 92, 12, 'Points earned from Cornhole', '2024-08-06 04:06:45.505731+00', '2024-08-06 04:06:45.505731+00'),
	(806, 87, 30, 'Points earned from Cornhole', '2024-08-06 04:06:45.505731+00', '2024-08-06 04:06:45.505731+00'),
	(807, 94, 30, 'Points earned from Cornhole', '2024-08-06 04:06:45.505731+00', '2024-08-06 04:06:45.505731+00'),
	(808, 90, 24, 'Points earned from Cornhole', '2024-08-06 04:06:45.505731+00', '2024-08-06 04:06:45.505731+00'),
	(809, 89, 24, 'Points earned from Cornhole', '2024-08-06 04:06:45.505731+00', '2024-08-06 04:06:45.505731+00'),
	(810, 93, 20, 'Points earned from Cornhole', '2024-08-06 04:06:45.505731+00', '2024-08-06 04:06:45.505731+00'),
	(811, 91, 20, 'Points earned from Cornhole', '2024-08-06 04:06:45.505731+00', '2024-08-06 04:06:45.505731+00'),
	(812, 87, -10, 'Red Space on turn 2', '2024-08-06 04:08:47.696683+00', '2024-08-06 04:08:47.696683+00'),
	(813, 89, -10, 'Red Space on turn 2', '2024-08-06 04:08:47.696683+00', '2024-08-06 04:08:47.696683+00'),
	(814, 90, 20, 'Bank Space on turn 2', '2024-08-06 04:08:47.696683+00', '2024-08-06 04:08:47.696683+00'),
	(815, 91, -10, 'Red Space on turn 2', '2024-08-06 04:08:47.696683+00', '2024-08-06 04:08:47.696683+00'),
	(816, 92, -10, 'Red Space on turn 2', '2024-08-06 04:08:47.696683+00', '2024-08-06 04:08:47.696683+00'),
	(817, 93, 10, 'Blue Space on turn 2', '2024-08-06 04:08:47.696683+00', '2024-08-06 04:08:47.696683+00'),
	(818, 94, 10, 'Blue Space on turn 2', '2024-08-06 04:08:47.696683+00', '2024-08-06 04:08:47.696683+00'),
	(819, 96, 10, 'Blue Space on turn 2', '2024-08-06 04:08:47.696683+00', '2024-08-06 04:08:47.696683+00'),
	(820, 87, -10, 'Duel in turn 2: Molly beat you in Push-up Contest', '2024-08-06 04:31:44.270178+00', '2024-08-06 04:31:44.270178+00'),
	(821, 88, 10, 'Duel in turn 2: You beat Olivia in Push-up Contest', '2024-08-06 04:31:44.270178+00', '2024-08-06 04:31:44.270178+00'),
	(822, 89, -12, 'Duel in turn 2: Josh beat you in Ping Pong (3-point game)', '2024-08-06 04:31:57.408922+00', '2024-08-06 04:31:57.408922+00'),
	(823, 95, 12, 'Duel in turn 2: You beat Ellie in Ping Pong (3-point game)', '2024-08-06 04:31:57.408922+00', '2024-08-06 04:31:57.408922+00'),
	(824, 87, 2, 'Points earned from Mini Golf', '2024-08-06 04:32:39.189135+00', '2024-08-06 04:32:39.189135+00'),
	(825, 96, 4, 'Points earned from Mini Golf', '2024-08-06 04:32:39.189135+00', '2024-08-06 04:32:39.189135+00'),
	(826, 93, 6, 'Points earned from Mini Golf', '2024-08-06 04:32:39.189135+00', '2024-08-06 04:32:39.189135+00'),
	(827, 94, 8, 'Points earned from Mini Golf', '2024-08-06 04:32:39.189135+00', '2024-08-06 04:32:39.189135+00'),
	(828, 95, 10, 'Points earned from Mini Golf', '2024-08-06 04:32:39.189135+00', '2024-08-06 04:32:39.189135+00'),
	(829, 90, 12, 'Points earned from Mini Golf', '2024-08-06 04:32:39.189135+00', '2024-08-06 04:32:39.189135+00'),
	(830, 91, 16, 'Points earned from Mini Golf', '2024-08-06 04:32:39.189135+00', '2024-08-06 04:32:39.189135+00'),
	(831, 92, 20, 'Points earned from Mini Golf', '2024-08-06 04:32:39.189135+00', '2024-08-06 04:32:39.189135+00'),
	(832, 89, 24, 'Points earned from Mini Golf', '2024-08-06 04:32:39.189135+00', '2024-08-06 04:32:39.189135+00'),
	(834, 87, -10, 'Red Space on turn 3', '2024-08-06 04:33:48.018227+00', '2024-08-06 04:33:48.018227+00'),
	(835, 88, 10, 'Blue Space on turn 3', '2024-08-06 04:33:48.018227+00', '2024-08-06 04:33:48.018227+00'),
	(836, 89, 10, 'Bank Space on turn 3', '2024-08-06 04:33:48.018227+00', '2024-08-06 04:33:48.018227+00'),
	(837, 90, 10, 'Blue Space on turn 3', '2024-08-06 04:33:48.018227+00', '2024-08-06 04:33:48.018227+00'),
	(838, 91, 10, 'Blue Space on turn 3', '2024-08-06 04:33:48.018227+00', '2024-08-06 04:33:48.018227+00'),
	(839, 92, -10, 'Red Space on turn 3', '2024-08-06 04:33:48.018227+00', '2024-08-06 04:33:48.018227+00'),
	(840, 93, -10, 'Red Space on turn 3', '2024-08-06 04:33:48.018227+00', '2024-08-06 04:33:48.018227+00'),
	(841, 94, 10, 'Blue Space on turn 3', '2024-08-06 04:33:48.018227+00', '2024-08-06 04:33:48.018227+00'),
	(842, 95, -10, 'Red Space on turn 3', '2024-08-06 04:33:48.018227+00', '2024-08-06 04:33:48.018227+00'),
	(843, 96, 10, 'Blue Space on turn 3', '2024-08-06 04:33:48.018227+00', '2024-08-06 04:33:48.018227+00'),
	(844, 96, -3, 'Wager for bet against Olivia that ''Molly lands on a Bank Space next''', '2024-08-29 01:44:35.474225+00', '2024-08-29 01:44:35.474225+00'),
	(845, 87, -3, 'Wager for Colin''s bet that ''Molly lands on a Bank Space next''', '2024-08-29 01:44:35.474225+00', '2024-08-29 01:44:35.474225+00'),
	(846, 96, -2, 'Wager for bet against Alyssa that ''No one will land on a red space in turn 4.''', '2024-08-29 01:45:24.202662+00', '2024-08-29 01:45:24.202662+00'),
	(847, 93, -2, 'Wager for Colin''s bet that ''No one will land on a red space in turn 4.''', '2024-08-29 01:45:24.202662+00', '2024-08-29 01:45:24.202662+00'),
	(848, 96, -1, 'Wager for bet against Ellie that '' Dan finishes in the TOP 2 in Ping Pong''', '2024-08-29 01:45:47.098334+00', '2024-08-29 01:45:47.098334+00'),
	(849, 89, -1, 'Wager for Colin''s bet that '' Dan finishes in the TOP 2 in Ping Pong''', '2024-08-29 01:45:47.098334+00', '2024-08-29 01:45:47.098334+00'),
	(850, 96, -1, 'Wager for bet against Tim that ''Ellie lands on a Duel Space next''', '2024-08-29 01:46:02.500341+00', '2024-08-29 01:46:02.500341+00'),
	(851, 92, -1, 'Wager for Colin''s bet that ''Ellie lands on a Duel Space next''', '2024-08-29 01:46:02.500341+00', '2024-08-29 01:46:02.500341+00'),
	(852, 96, -3, 'Wager for bet against Josh that '' Alyssa finishes in the BOTTOM 6 in Bowling''', '2024-08-29 01:46:21.243807+00', '2024-08-29 01:46:21.243807+00'),
	(853, 95, -3, 'Wager for Colin''s bet that '' Alyssa finishes in the BOTTOM 6 in Bowling''', '2024-08-29 01:46:21.243807+00', '2024-08-29 01:46:21.243807+00'),
	(854, 96, -3, 'Wager for bet against Leo that '' Olivia finishes in the TOP 4 in Mini Golf''', '2024-08-29 01:46:42.258169+00', '2024-08-29 01:46:42.258169+00'),
	(855, 94, -3, 'Wager for Colin''s bet that '' Olivia finishes in the TOP 4 in Mini Golf''', '2024-08-29 01:46:42.258169+00', '2024-08-29 01:46:42.258169+00'),
	(856, 96, 4, 'Won bet against Alyssa that ''No one will land on a red space in turn 4.''', '2025-03-22 14:36:25.14791+00', '2025-03-22 14:36:25.14791+00'),
	(857, 96, 6, 'Won bet against Olivia that ''Molly lands on a Bank Space next''', '2025-03-22 14:36:28.348252+00', '2025-03-22 14:36:28.348252+00'),
	(858, 96, 2, 'Won bet against Ellie that '' Dan finishes in the TOP 2 in Ping Pong''', '2025-03-22 14:36:32.575653+00', '2025-03-22 14:36:32.575653+00'),
	(859, 92, 2, 'Won Colin''s bet that ''Ellie lands on a Duel Space next''', '2025-03-22 15:06:28.707881+00', '2025-03-22 15:06:28.707881+00'),
	(860, 94, 6, 'Won Colin''s bet that '' Olivia finishes in the TOP 4 in Mini Golf''', '2025-05-03 14:49:39.160916+00', '2025-05-03 14:49:39.160916+00'),
	(861, 87, 2, 'Points earned from Mini Golf', '2025-05-03 14:49:56.45061+00', '2025-05-03 14:49:56.45061+00'),
	(862, 96, 4, 'Points earned from Mini Golf', '2025-05-03 14:49:56.45061+00', '2025-05-03 14:49:56.45061+00'),
	(863, 93, 6, 'Points earned from Mini Golf', '2025-05-03 14:49:56.45061+00', '2025-05-03 14:49:56.45061+00'),
	(864, 94, 8, 'Points earned from Mini Golf', '2025-05-03 14:49:56.45061+00', '2025-05-03 14:49:56.45061+00'),
	(865, 95, 10, 'Points earned from Mini Golf', '2025-05-03 14:49:56.45061+00', '2025-05-03 14:49:56.45061+00'),
	(866, 90, 12, 'Points earned from Mini Golf', '2025-05-03 14:49:56.45061+00', '2025-05-03 14:49:56.45061+00'),
	(867, 91, 16, 'Points earned from Mini Golf', '2025-05-03 14:49:56.45061+00', '2025-05-03 14:49:56.45061+00'),
	(868, 92, 20, 'Points earned from Mini Golf', '2025-05-03 14:49:56.45061+00', '2025-05-03 14:49:56.45061+00'),
	(869, 89, 24, 'Points earned from Mini Golf', '2025-05-03 14:49:56.45061+00', '2025-05-03 14:49:56.45061+00'),
	(870, 88, 30, 'Points earned from Mini Golf', '2025-05-03 14:49:56.45061+00', '2025-05-03 14:49:56.45061+00'),
	(871, 88, -10, 'Red Space on turn 4', '2025-05-03 15:02:44.308608+00', '2025-05-03 15:02:44.308608+00'),
	(872, 89, -10, 'Red Space on turn 4', '2025-05-03 15:02:44.308608+00', '2025-05-03 15:02:44.308608+00'),
	(873, 91, 10, 'Bank Space on turn 4', '2025-05-03 15:02:44.308608+00', '2025-05-03 15:02:44.308608+00'),
	(874, 93, 10, 'Bank Space on turn 4', '2025-05-03 15:02:44.308608+00', '2025-05-03 15:02:44.308608+00'),
	(875, 94, 10, 'Blue Space on turn 4', '2025-05-03 15:02:44.308608+00', '2025-05-03 15:02:44.308608+00'),
	(876, 96, -10, 'Red Space on turn 4', '2025-05-03 15:02:44.308608+00', '2025-05-03 15:02:44.308608+00'),
	(877, 87, -5, 'Duel in turn 4: Brittany beat you in Paper Airplanes', '2025-05-03 15:03:15.748335+00', '2025-05-03 15:03:15.748335+00'),
	(878, 90, 5, 'Duel in turn 4: You beat Olivia in Paper Airplanes', '2025-05-03 15:03:15.748335+00', '2025-05-03 15:03:15.748335+00'),
	(879, 89, -15, 'Duel in turn 4: Brittany beat you in Push-up Contest', '2025-05-03 15:03:31.987504+00', '2025-05-03 15:03:31.987504+00'),
	(880, 90, 16, 'Duel in turn 4: You beat Ellie in Push-up Contest', '2025-05-03 15:03:31.987504+00', '2025-05-03 15:03:31.987504+00'),
	(881, 91, 8, 'Duel in turn 4: You beat Tim in Ping Pong (3-point game)', '2025-05-03 15:03:52.542675+00', '2025-05-03 15:03:52.542675+00'),
	(882, 92, -8, 'Duel in turn 4: Dan beat you in Ping Pong (3-point game)', '2025-05-03 15:03:52.542675+00', '2025-05-03 15:03:52.542675+00'),
	(883, 94, -23, 'Duel in turn 4: Josh beat you in Ping Pong (3-point game)', '2025-05-03 15:04:08.344357+00', '2025-05-03 15:04:08.344357+00'),
	(884, 95, 24, 'Duel in turn 4: You beat Leo in Ping Pong (3-point game)', '2025-05-03 15:04:08.344357+00', '2025-05-03 15:04:08.344357+00'),
	(885, 92, 30, 'Points earned from Ping Pong', '2025-05-03 16:14:29.080561+00', '2025-05-03 16:14:29.080561+00'),
	(886, 93, 30, 'Points earned from Ping Pong', '2025-05-03 16:14:29.080561+00', '2025-05-03 16:14:29.080561+00'),
	(887, 94, 30, 'Points earned from Ping Pong', '2025-05-03 16:14:29.080561+00', '2025-05-03 16:14:29.080561+00'),
	(888, 89, 30, 'Points earned from Ping Pong', '2025-05-03 16:14:29.080561+00', '2025-05-03 16:14:29.080561+00'),
	(889, 90, 30, 'Points earned from Ping Pong', '2025-05-03 16:14:29.080561+00', '2025-05-03 16:14:29.080561+00'),
	(890, 91, 30, 'Points earned from Ping Pong', '2025-05-03 16:14:29.080561+00', '2025-05-03 16:14:29.080561+00'),
	(891, 96, 30, 'Points earned from Ping Pong', '2025-05-03 16:14:29.080561+00', '2025-05-03 16:14:29.080561+00'),
	(892, 88, 30, 'Points earned from Ping Pong', '2025-05-03 16:14:29.080561+00', '2025-05-03 16:14:29.080561+00'),
	(893, 95, 30, 'Points earned from Ping Pong', '2025-05-03 16:14:29.080561+00', '2025-05-03 16:14:29.080561+00'),
	(894, 87, 30, 'Points earned from Ping Pong', '2025-05-03 16:14:29.080561+00', '2025-05-03 16:14:29.080561+00'),
	(895, 92, 30, 'Points earned from Ping Pong', '2025-05-03 16:14:53.718216+00', '2025-05-03 16:14:53.718216+00'),
	(896, 93, 30, 'Points earned from Ping Pong', '2025-05-03 16:14:53.718216+00', '2025-05-03 16:14:53.718216+00'),
	(897, 94, 30, 'Points earned from Ping Pong', '2025-05-03 16:14:53.718216+00', '2025-05-03 16:14:53.718216+00'),
	(898, 89, 30, 'Points earned from Ping Pong', '2025-05-03 16:14:53.718216+00', '2025-05-03 16:14:53.718216+00'),
	(899, 90, 30, 'Points earned from Ping Pong', '2025-05-03 16:14:53.718216+00', '2025-05-03 16:14:53.718216+00'),
	(900, 91, 30, 'Points earned from Ping Pong', '2025-05-03 16:14:53.718216+00', '2025-05-03 16:14:53.718216+00'),
	(901, 96, 30, 'Points earned from Ping Pong', '2025-05-03 16:14:53.718216+00', '2025-05-03 16:14:53.718216+00'),
	(902, 88, 30, 'Points earned from Ping Pong', '2025-05-03 16:14:53.718216+00', '2025-05-03 16:14:53.718216+00'),
	(903, 95, 30, 'Points earned from Ping Pong', '2025-05-03 16:14:53.718216+00', '2025-05-03 16:14:53.718216+00'),
	(904, 87, 30, 'Points earned from Ping Pong', '2025-05-03 16:14:53.718216+00', '2025-05-03 16:14:53.718216+00'),
	(905, 87, 10, 'Blue Space on turn 4', '2025-06-15 18:47:54.86806+00', '2025-06-15 18:47:54.86806+00'),
	(906, 88, 10, 'Blue Space on turn 4', '2025-06-15 18:47:54.86806+00', '2025-06-15 18:47:54.86806+00'),
	(907, 89, 10, 'Blue Space on turn 4', '2025-06-15 18:47:54.86806+00', '2025-06-15 18:47:54.86806+00'),
	(908, 90, 10, 'Blue Space on turn 4', '2025-06-15 18:47:54.86806+00', '2025-06-15 18:47:54.86806+00'),
	(909, 91, 10, 'Blue Space on turn 4', '2025-06-15 18:47:54.86806+00', '2025-06-15 18:47:54.86806+00'),
	(910, 92, 10, 'Blue Space on turn 4', '2025-06-15 18:47:54.86806+00', '2025-06-15 18:47:54.86806+00'),
	(911, 93, 10, 'Blue Space on turn 4', '2025-06-15 18:47:54.86806+00', '2025-06-15 18:47:54.86806+00'),
	(912, 94, 10, 'Blue Space on turn 4', '2025-06-15 18:47:54.86806+00', '2025-06-15 18:47:54.86806+00'),
	(913, 95, 10, 'Blue Space on turn 4', '2025-06-15 18:47:54.86806+00', '2025-06-15 18:47:54.86806+00'),
	(914, 96, 10, 'Blue Space on turn 4', '2025-06-15 18:47:54.86806+00', '2025-06-15 18:47:54.86806+00'),
	(915, 92, 12, 'Points earned from Ping Pong', '2025-06-15 18:54:27.964075+00', '2025-06-15 18:54:27.964075+00'),
	(916, 93, 30, 'Points earned from Ping Pong', '2025-06-15 18:54:27.964075+00', '2025-06-15 18:54:27.964075+00'),
	(917, 94, 24, 'Points earned from Ping Pong', '2025-06-15 18:54:27.964075+00', '2025-06-15 18:54:27.964075+00'),
	(918, 89, 8, 'Points earned from Ping Pong', '2025-06-15 18:54:27.964075+00', '2025-06-15 18:54:27.964075+00'),
	(919, 90, 6, 'Points earned from Ping Pong', '2025-06-15 18:54:27.964075+00', '2025-06-15 18:54:27.964075+00'),
	(920, 91, 4, 'Points earned from Ping Pong', '2025-06-15 18:54:27.964075+00', '2025-06-15 18:54:27.964075+00'),
	(921, 96, 10, 'Points earned from Ping Pong', '2025-06-15 18:54:27.964075+00', '2025-06-15 18:54:27.964075+00'),
	(922, 88, 2, 'Points earned from Ping Pong', '2025-06-15 18:54:27.964075+00', '2025-06-15 18:54:27.964075+00'),
	(923, 95, 20, 'Points earned from Ping Pong', '2025-06-15 18:54:27.964075+00', '2025-06-15 18:54:27.964075+00'),
	(924, 87, 16, 'Points earned from Ping Pong', '2025-06-15 18:54:27.964075+00', '2025-06-15 18:54:27.964075+00'),
	(925, 87, -10, 'Red Space on turn 5', '2026-04-26 23:37:40.105404+00', '2026-04-26 23:37:40.105404+00'),
	(926, 88, -10, 'Red Space on turn 5', '2026-04-26 23:37:40.105404+00', '2026-04-26 23:37:40.105404+00'),
	(927, 89, 10, 'Blue Space on turn 5', '2026-04-26 23:37:40.105404+00', '2026-04-26 23:37:40.105404+00'),
	(928, 90, -10, 'Red Space on turn 5', '2026-04-26 23:37:40.105404+00', '2026-04-26 23:37:40.105404+00'),
	(929, 91, -10, 'Red Space on turn 5', '2026-04-26 23:37:40.105404+00', '2026-04-26 23:37:40.105404+00'),
	(930, 92, 10, 'Blue Space on turn 5', '2026-04-26 23:37:40.105404+00', '2026-04-26 23:37:40.105404+00'),
	(931, 93, -10, 'Red Space on turn 5', '2026-04-26 23:37:40.105404+00', '2026-04-26 23:37:40.105404+00'),
	(932, 94, 10, 'Blue Space on turn 5', '2026-04-26 23:37:40.105404+00', '2026-04-26 23:37:40.105404+00'),
	(933, 95, 3, 'Chance Space on turn 5', '2026-04-26 23:37:40.105404+00', '2026-04-26 23:37:40.105404+00'),
	(934, 96, -10, 'Red Space on turn 5', '2026-04-26 23:37:40.105404+00', '2026-04-26 23:37:40.105404+00'),
	(935, 89, 10, 'Blue Space on turn 5', '2026-05-12 17:37:07.68149+00', '2026-05-12 17:37:07.68149+00'),
	(936, 93, -10, 'Red Space on turn 5', '2026-05-12 17:37:07.68149+00', '2026-05-12 17:37:07.68149+00'),
	(937, 94, 70, 'Bank Space on turn 5', '2026-05-12 17:37:07.68149+00', '2026-05-12 17:37:07.68149+00'),
	(938, 95, 5, 'Chance Space on turn 5', '2026-05-12 17:37:07.68149+00', '2026-05-12 17:37:07.68149+00'),
	(939, 96, 67, 'Chance Space on turn 5', '2026-05-12 17:37:07.68149+00', '2026-05-12 17:37:07.68149+00'),
	(940, 91, 18, 'Special Space event for turn 5: 6 successful tosses in Cup Toss', '2026-05-12 22:52:14.803693+00', '2026-05-12 22:52:14.803693+00'),
	(941, 94, 24, 'Points earned from Bowling', '2026-05-12 22:53:40.052756+00', '2026-05-12 22:53:40.052756+00'),
	(942, 95, 24, 'Points earned from Bowling', '2026-05-12 22:53:40.052756+00', '2026-05-12 22:53:40.052756+00'),
	(943, 87, 16, 'Points earned from Bowling', '2026-05-12 22:53:40.052756+00', '2026-05-12 22:53:40.052756+00'),
	(944, 91, 16, 'Points earned from Bowling', '2026-05-12 22:53:40.052756+00', '2026-05-12 22:53:40.052756+00'),
	(945, 93, 16, 'Points earned from Bowling', '2026-05-12 22:53:40.052756+00', '2026-05-12 22:53:40.052756+00'),
	(946, 88, 20, 'Points earned from Bowling', '2026-05-12 22:53:40.052756+00', '2026-05-12 22:53:40.052756+00'),
	(947, 94, 24, 'Points earned from Bowling', '2026-05-12 22:55:05.022139+00', '2026-05-12 22:55:05.022139+00'),
	(948, 95, 24, 'Points earned from Bowling', '2026-05-12 22:55:05.022139+00', '2026-05-12 22:55:05.022139+00'),
	(949, 87, 16, 'Points earned from Bowling', '2026-05-12 22:55:05.022139+00', '2026-05-12 22:55:05.022139+00'),
	(950, 91, 16, 'Points earned from Bowling', '2026-05-12 22:55:05.022139+00', '2026-05-12 22:55:05.022139+00'),
	(951, 93, 16, 'Points earned from Bowling', '2026-05-12 22:55:05.022139+00', '2026-05-12 22:55:05.022139+00'),
	(952, 88, 20, 'Points earned from Bowling', '2026-05-12 22:55:05.022139+00', '2026-05-12 22:55:05.022139+00'),
	(953, 96, 20, 'Points earned from Bowling', '2026-05-12 22:55:05.022139+00', '2026-05-12 22:55:05.022139+00'),
	(954, 94, 2, 'GM Discretion: Bought item', '2026-05-17 19:33:06.854279+00', '2026-05-17 19:33:06.854279+00'),
	(955, 90, 1, 'GM Discretion: sold item', '2026-05-17 19:37:57.282354+00', '2026-05-17 19:37:57.282354+00'),
	(956, 89, -2, 'GM Discretion: because I feel like it', '2026-05-17 19:57:19.675446+00', '2026-05-17 19:57:19.675446+00'),
	(957, 119, 20, 'GM Discretion', '2026-06-09 23:20:53.822234+00', '2026-06-09 23:20:53.822234+00'),
	(958, 109, 10, 'GM Discretion', '2026-06-09 23:21:30.432425+00', '2026-06-09 23:21:30.432425+00'),
	(959, 110, 10, 'GM Discretion', '2026-06-09 23:21:35.449626+00', '2026-06-09 23:21:35.449626+00'),
	(960, 119, -10, 'Wager for bet against Leo that ''Josh drinks more than 5 drinks tonight''', '2026-06-09 23:25:31.742458+00', '2026-06-09 23:25:31.742458+00'),
	(961, 109, -10, 'Wager for Colin''s bet that ''Josh drinks more than 5 drinks tonight''', '2026-06-09 23:25:31.742458+00', '2026-06-09 23:25:31.742458+00'),
	(962, 119, 20, 'Won bet against Leo that ''Josh drinks more than 5 drinks tonight''', '2026-06-09 23:26:02.345453+00', '2026-06-09 23:26:02.345453+00'),
	(963, 110, 0, 'Bank Space on turn 1', '2026-06-09 23:30:54.342407+00', '2026-06-09 23:30:54.342407+00'),
	(964, 111, 10, 'Blue Space on turn 1', '2026-06-09 23:30:54.342407+00', '2026-06-09 23:30:54.342407+00'),
	(965, 112, -10, 'Red Space on turn 1', '2026-06-09 23:30:54.342407+00', '2026-06-09 23:30:54.342407+00'),
	(966, 113, 10, 'Blue Space on turn 1', '2026-06-09 23:30:54.342407+00', '2026-06-09 23:30:54.342407+00'),
	(967, 114, 10, 'Blue Space on turn 1', '2026-06-09 23:30:54.342407+00', '2026-06-09 23:30:54.342407+00'),
	(968, 115, -10, 'Red Space on turn 1', '2026-06-09 23:30:54.342407+00', '2026-06-09 23:30:54.342407+00'),
	(969, 116, 10, 'Blue Space on turn 1', '2026-06-09 23:30:54.342407+00', '2026-06-09 23:30:54.342407+00'),
	(970, 117, -10, 'Red Space on turn 1', '2026-06-09 23:30:54.342407+00', '2026-06-09 23:30:54.342407+00'),
	(971, 118, 10, 'Blue Space on turn 1', '2026-06-09 23:30:54.342407+00', '2026-06-09 23:30:54.342407+00'),
	(972, 119, 15, 'Bank Space on turn 1', '2026-06-09 23:30:54.342407+00', '2026-06-09 23:30:54.342407+00'),
	(973, 110, 11, 'Duel in turn 1: You beat Colin in Paper Airplanes', '2026-06-09 23:34:33.353001+00', '2026-06-09 23:34:33.353001+00'),
	(974, 119, -11, 'Duel in turn 1: Olivia beat you in Paper Airplanes', '2026-06-09 23:34:33.353001+00', '2026-06-09 23:34:33.353001+00'),
	(975, 109, 31, 'Duel in turn 1: You beat Colin in Push-up Contest', '2026-06-09 23:37:20.424061+00', '2026-06-09 23:37:20.424061+00'),
	(976, 119, -31, 'Duel in turn 1: Leo beat you in Push-up Contest', '2026-06-09 23:37:20.424061+00', '2026-06-09 23:37:20.424061+00'),
	(977, 109, 30, 'Points earned from Magic school', '2026-06-09 23:41:03.307563+00', '2026-06-09 23:41:03.307563+00'),
	(978, 110, 30, 'Points earned from Magic school', '2026-06-09 23:41:03.307563+00', '2026-06-09 23:41:03.307563+00'),
	(979, 111, 30, 'Points earned from Magic school', '2026-06-09 23:41:03.307563+00', '2026-06-09 23:41:03.307563+00'),
	(980, 115, 30, 'Points earned from Magic school', '2026-06-09 23:41:03.307563+00', '2026-06-09 23:41:03.307563+00'),
	(981, 118, 30, 'Points earned from Magic school', '2026-06-09 23:41:03.307563+00', '2026-06-09 23:41:03.307563+00'),
	(982, 119, 30, 'Points earned from Magic school', '2026-06-09 23:41:03.307563+00', '2026-06-09 23:41:03.307563+00'),
	(983, 112, 0, 'Points earned from Magic school', '2026-06-09 23:41:03.307563+00', '2026-06-09 23:41:03.307563+00'),
	(984, 113, 0, 'Points earned from Magic school', '2026-06-09 23:41:03.307563+00', '2026-06-09 23:41:03.307563+00'),
	(985, 114, 0, 'Points earned from Magic school', '2026-06-09 23:41:03.307563+00', '2026-06-09 23:41:03.307563+00'),
	(986, 116, 0, 'Points earned from Magic school', '2026-06-09 23:41:03.307563+00', '2026-06-09 23:41:03.307563+00'),
	(987, 117, 0, 'Points earned from Magic school', '2026-06-09 23:41:03.307563+00', '2026-06-09 23:41:03.307563+00'),
	(988, 109, 9, 'GM Discretion', '2026-06-11 12:37:09.008528+00', '2026-06-11 12:37:09.008528+00');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: bet_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."bet_id_seq"', 159, false);


--
-- Name: bracket_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."bracket_id_seq"', 32, false);


--
-- Name: chaos_space_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."chaos_space_event_id_seq"', 18, false);


--
-- Name: chaos_space_event_template_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."chaos_space_event_template_id_seq"', 11, false);


--
-- Name: duel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."duel_id_seq"', 40, false);


--
-- Name: event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."event_id_seq"', 77, false);


--
-- Name: event_participant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."event_participant_id_seq"', 1044, false);


--
-- Name: event_team_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."event_team_id_seq"', 1351, false);


--
-- Name: event_team_round_score_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."event_team_round_score_id_seq"', 229, false);


--
-- Name: game_state_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."game_state_id_seq"', 2, false);


--
-- Name: gameboard_move_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."gameboard_move_id_seq"', 297, false);


--
-- Name: gameboard_space_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."gameboard_space_id_seq"', 37, false);


--
-- Name: player_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."player_id_seq"', 120, false);


--
-- Name: player_round_score_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."player_round_score_id_seq"', 213, false);


--
-- Name: prize_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."prize_id_seq"', 12, true);


--
-- Name: rules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."rules_id_seq"', 26, false);


--
-- Name: session_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."session_id_seq"', 39, false);


--
-- Name: special_space_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."special_space_event_id_seq"', 15, false);


--
-- Name: special_space_event_template_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."special_space_event_template_id_seq"', 17, false);


--
-- Name: transaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."transaction_id_seq"', 989, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict xQi0y0PQxXjmMWBB6tt7JRrCzDGdVJb8IRDA7wT48CF4a7zB3dNLBUtp6CMc4Kt

RESET ALL;
