#!/usr/bin/env bash
# Diff the schema of a hosted project against the local stack.
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
project_id="$(sed -n 's/^project_id = "\(.*\)"/\1/p' "$dir/../config.toml")"
docker exec -i -e PGOPTIONS="-c search_path=public" "supabase_db_$project_id" psql -U postgres -At -v ON_ERROR_STOP=1 <<<"$sql" | sort >"$tmp/local.txt"

diff "$tmp/remote.txt" "$tmp/local.txt" && echo "no drift"
