INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at",
                            "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token",
                            "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at",
                            "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin",
                            "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change",
                            "phone_change_token", "phone_change_sent_at", "email_change_token_current",
                            "email_change_confirm_status", "banned_until", "reauthentication_token",
                            "reauthentication_sent_at", "is_sso_user", "deleted_at")
VALUES ('00000000-0000-0000-0000-000000000000', 'dbcfce9c-4f19-42e7-b6a1-7a7315058d54', 'authenticated',
        'authenticated', 'colin@joshies.app', '$2a$10$gGIqQOY1ubDL.OcseSUjpuygRIdPog.SzNvR09sNQapP6zd.LFGD.',
        '2024-01-15 04:52:34.128635+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL,
        '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2024-01-15 04:52:34.118375+00',
        '2024-01-15 04:52:34.128955+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL),
       ('00000000-0000-0000-0000-000000000000', 'c727d920-0777-456d-8ed2-1c09569854b1', 'authenticated',
        'authenticated', 'josh@joshies.app', '$2a$10$sUHyZvGsojGIZoDaIhu5Y.DD8holyKwoA7UEBsq5jAIzhRHs.Vuxe',
        '2024-01-15 04:52:50.145814+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL,
        '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2024-01-15 04:52:50.141568+00',
        '2024-01-15 04:52:50.145961+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL);


INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at",
                                 "updated_at", "id")
VALUES ('dbcfce9c-4f19-42e7-b6a1-7a7315058d54', 'dbcfce9c-4f19-42e7-b6a1-7a7315058d54',
        '{"sub": "dbcfce9c-4f19-42e7-b6a1-7a7315058d54", "email": "colin@joshies.app", "email_verified": false, "phone_verified": false}',
        'email', '2024-01-15 04:52:34.123297+00', '2024-01-15 04:52:34.123358+00', '2024-01-15 04:52:34.123358+00',
        'cdc13dc6-a98d-4b86-8d98-3ccebda042af'),
       ('c727d920-0777-456d-8ed2-1c09569854b1', 'c727d920-0777-456d-8ed2-1c09569854b1',
        '{"sub": "c727d920-0777-456d-8ed2-1c09569854b1", "email": "josh@joshies.app", "email_verified": false, "phone_verified": false}',
        'email', '2024-01-15 04:52:50.143104+00', '2024-01-15 04:52:50.143207+00', '2024-01-15 04:52:50.143207+00',
        '8a5457d5-54c7-4de7-8890-50cda03a6cdc');



INSERT INTO "public"."user" ("display_name", "id", "avatar_url")
VALUES ('Colin', 'dbcfce9c-4f19-42e7-b6a1-7a7315058d54',
        'https://hqomdxggwvkmaovkytld.supabase.co/storage/v1/object/public/avatars/default.webp'),
       ('Josh', 'c727d920-0777-456d-8ed2-1c09569854b1',
        'https://hqomdxggwvkmaovkytld.supabase.co/storage/v1/object/public/avatars/default.webp');
