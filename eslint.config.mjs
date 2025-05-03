import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      'projects/**/*',
      '.angular/**/*',
      '.idea/**/*',
      'dist/**/*',
      'node_modules/**/*',
    ],
  },
  ...compat
    .extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:@angular-eslint/recommended',
      'plugin:@angular-eslint/template/process-inline-templates',
    )
    .map((config) => ({
      ...config,
      files: ['**/*.ts'],
    })),
  {
    files: ['**/*.ts'],

    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'joshies',
          style: 'camelCase',
        },
      ],

      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'joshies',
          style: 'kebab-case',
        },
      ],

      '@angular-eslint/no-host-metadata-property': 'off',
      'no-case-declarations': 'off',
    },
  },
  ...compat
    .extends(
      'plugin:@angular-eslint/template/recommended',
      'plugin:@angular-eslint/template/accessibility',
    )
    .map((config) => ({
      ...config,
      files: ['**/*.html'],
    })),
  {
    files: ['**/*.html'],

    rules: {
      '@angular-eslint/template/label-has-associated-control': [
        'error',
        {
          controlComponents: [
            'p-select',
            'p-checkbox',
            'p-selectButton',
            'p-radioButton',
            'p-inputNumber',
            'p-inputSwitch',
          ],
        },
      ],
    },
  },
];
