import { base, typescript } from '@faergeek/eslint-config';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

export default defineConfig(
  globalIgnores(['demos/*/build', 'dist']),
  { extends: [base, typescript] },
  {
    files: ['client.js', 'demos/*/src/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['demos/cli.js', 'demos/*/webpack.config.js', 'plugin.js'],
    languageOptions: { globals: globals.nodeBuiltin },
  },
);
