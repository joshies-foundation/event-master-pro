import { readdirSync, writeFileSync } from 'node:fs';

const newest = readdirSync('supabase/migrations').sort().at(-1);
const version = newest.split('_')[0];

writeFileSync(
  'src/app/shared/util/schema-version.ts',
  `export const SCHEMA_VERSION = '${version}';\n`,
);
