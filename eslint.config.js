import { base, browser, node } from '@faergeek/eslint-config';

export default [
  { ignores: ['demos/*/build/'] },
  ...base,
  ...browser.map(config => ({
    ...config,
    files: ['client.js', 'demos/*/src/**/*.js'],
  })),
  ...node.map(config => ({
    ...config,
    files: ['demos/cli.js', 'demos/*/webpack.config.js', 'plugin.js'],
  })),
];
