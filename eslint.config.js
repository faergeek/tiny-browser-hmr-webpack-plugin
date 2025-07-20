import { base, browser, node, typescript } from '@faergeek/eslint-config';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig(
  globalIgnores(['demos/*/build', 'dist']),
  base,
  typescript,
  {
    files: ['client.js', 'demos/*/src/**/*.js'],
    extends: [browser],
  },
  {
    files: ['demos/cli.js', 'demos/*/webpack.config.js', 'plugin.js'],
    extends: [node],
  },
);
