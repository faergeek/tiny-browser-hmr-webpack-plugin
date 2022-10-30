import * as path from 'node:path';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';

import { TinyBrowserHmrWebpackPlugin } from '../../plugin.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default {
  context: __dirname,
  mode: 'development',
  entry: ['../../client', '.'],
  stats: 'errors-warnings',
  devtool: 'cheap-module-source-map',
  output: {
    chunkFilename: '[name].js',
    filename: '[name].js',
    path: path.join(__dirname, 'build'),
    publicPath: '/',
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new TinyBrowserHmrWebpackPlugin(),
    new HtmlWebpackPlugin(),
  ],
};
