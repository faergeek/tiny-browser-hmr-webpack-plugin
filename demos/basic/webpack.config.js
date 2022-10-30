import * as path from 'node:path';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';

import { TinyBrowserHmrWebpackPlugin } from '../../plugin.js';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

export default {
  context: __dirname,
  mode: 'development',
  entry: {
    main: ['../../client', './src/main'],
    about: ['../../client', './src/about'],
  },
  stats: 'errors-warnings',
  devtool: 'cheap-module-source-map',
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'build'),
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new TinyBrowserHmrWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      chunks: ['main'],
    }),
    new HtmlWebpackPlugin({
      filename: 'about.html',
      chunks: ['about'],
    }),
  ],
};
