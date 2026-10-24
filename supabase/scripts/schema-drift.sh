#!/usr/bin/env bash
# Diff the schema of a hosted project against this checkout's local Supabase project.
# Usage: SUPABASE_ACCESS_TOKEN=sbp_... supabase/scripts/schema-drift.sh <project-ref>
# Lines starting with < exist only in the hosted project, lines starting with > only locally.
set -euo pipefail
ref="${1:?usage: schema-drift.sh <project-ref>}"
: "${SUPABASE_ACCESS_TOKEN:?set SUPABASE_ACCESS_TOKEN to a personal access token}"
dir="$(cd "$(dirname "$0")" && pwd)"
sql="$(cat "$dir/schema-fingerprint.sql")"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
printf 'Authorization: Bearer %s\n' "$SUPABASE_ACCESS_TOKEN" >"$tmp/auth-header"

jq -n --arg q "$sql" '{query: $q}' |
  curl -sS --fail-with-body "https://api.supabase.com/v1/projects/$ref/database/query/read-only" \
    -H @"$tmp/auth-header" -H 'Content-Type: application/json' --data @- |
  jq -r '.[].line' | sort >"$tmp/remote.txt"

# Match the search_path the hosted read-only role sees, so both sides qualify names the same way.
(cd "$dir/../.." && node --input-type=module -e '
  import { readFileSync } from "node:fs";
  import postgres from "postgres";
  import { localStack } from "./supabase/scripts/local-stack.mjs";
  const sql = postgres(localStack().dbUrl, { max: 1, connection: { search_path: "public" } });
  for (const { line } of await sql.unsafe(readFileSync(0, "utf8"))) console.log(line);
  await sql.end();' <<<"$sql") | sort >"$tmp/local.txt"

diff "$tmp/remote.txt" "$tmp/local.txt" && echo "no drift"
