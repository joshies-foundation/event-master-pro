import { readFileSync, writeFileSync } from 'fs';

// read file
const filePath =
  'src/app/profile/feature/profile-page/profile-page.component.html';
const fileContents = readFileSync(filePath, 'utf-8');

// insert or reset timestamp
const result = fileContents.replace(
  /Last updated: {{ \d+ \|/g,
  process.argv[2] === 'pre'
    ? `Last updated: {{ ${Date.now()} |`
    : `Last updated: {{ 0 |`,
);

// write file
writeFileSync(filePath, result);
