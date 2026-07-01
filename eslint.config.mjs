import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'dev-dist',
      'coverage',
      'playwright-report',
      'test-results',
      'src/routeTree.gen.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'simple-import-sort': simpleImportSort,
      import: importPlugin,
    },
    rules: {
      // TypeScript's own checker handles undefined identifiers.
      'no-undef': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // External libs first, then internal @/ modules (grouped + sorted).
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      // Prefer named exports across app source.
      'import/no-default-export': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Default exports are required by these tools / conventions. shadcn/ui
    // primitives (owned in-repo) co-export components with variant helpers.
    files: [
      '**/*.config.{ts,js,mjs}',
      'vite.config.ts',
      'playwright.config.ts',
      'src/routes/**/*.tsx',
      'src/components/ui/**/*.tsx',
    ],
    rules: {
      'import/no-default-export': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
  prettier,
);
