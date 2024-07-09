import { readFileSync, writeFileSync } from 'fs';

// read file
const filePath =
  'src/app/profile/feature/profile-page/profile-page.component.html';
const fileContents = readFileSync(filePath, 'utf-8');

// insert or reset timestamp
const result = fileContents.replace(
  /App last updated: {{ \d+ \|/g,
  process.argv[2] === 'pre'
    ? `App last updated: {{ ${Date.now()} |`
    : `App last updated: {{ 0 |`,
);

// write file
writeFileSync(filePath, result);
