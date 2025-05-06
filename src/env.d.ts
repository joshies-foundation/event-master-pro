declare interface Env {
  readonly NODE_ENV: string;
  readonly NG_APP_SUPABASE_PROJECT_ID: string;
  readonly NG_APP_SUPABASE_ANON_KEY: string;
  readonly NG_APP_VAPID_PUBLIC_KEY: string;
}

declare interface ImportMeta {
  readonly env: Env;
}
