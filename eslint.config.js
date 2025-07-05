import { base, browser, node } from '@faergeek/eslint-config';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig(
  globalIgnores(['demos/*/build/']),
  base,
  {
    files: ['client.js', 'demos/*/src/**/*.js'],
    extends: [browser],
  },
  {
    files: ['demos/cli.js', 'demos/*/webpack.config.js', 'plugin.js'],
    extends: [node],
  },
);
