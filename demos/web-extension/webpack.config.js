import * as path from 'node:path';

import cpy from 'cpy';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';

import { TinyBrowserHmrWebpackPlugin } from '../../plugin.js';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const BUILD_FOLDER = path.join(__dirname, 'build');
const COMMON_FOLDER = path.join(BUILD_FOLDER, 'common');

export default {
  context: __dirname,
  mode: 'development',
  entry: {
    background: ['./src/background'],
    action: ['../../client', './src/action'],
  },
  stats: 'errors-warnings',
  devtool: 'cheap-module-source-map',
  output: {
    filename: '[name].js',
    path: COMMON_FOLDER,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new TinyBrowserHmrWebpackPlugin({ hostname: 'localhost' }),
    new HtmlWebpackPlugin({
      filename: 'action.html',
      chunks: ['action'],
    }),
    function CopyBuild() {
      async function copyExtension(targetName) {
        const targetPath = path.join(BUILD_FOLDER, targetName);

        await Promise.all([
          cpy('common', targetPath, { cwd: BUILD_FOLDER, parents: true }),
          cpy(`${targetName}.json`, targetPath, {
            rename: 'manifest.json',
            cwd: __dirname,
          }),
        ]);
      }

      this.hooks.afterEmit.tapPromise('CopyBuild', async () => {
        await Promise.all([
          copyExtension('manifest-v2'),
          copyExtension('manifest-v3-chromium'),
        ]);
      });
    },
  ],
};
