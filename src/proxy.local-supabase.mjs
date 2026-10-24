// `ng serve` forwards Supabase API paths to this checkout's local Supabase
// project, so the app and any phone on the LAN reach it through the dev server.
import { localStack } from '../supabase/scripts/local-stack.mjs';

const { apiUrl } = localStack();

export default Object.fromEntries(
  [
    '/rest/v1/',
    '/auth/v1/',
    '/realtime/v1/',
    '/storage/v1/',
    '/functions/v1/',
  ].map((path) => [path, { target: apiUrl, ws: path === '/realtime/v1/' }]),
);
