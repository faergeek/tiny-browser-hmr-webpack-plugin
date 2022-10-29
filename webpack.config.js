import * as path from 'node:path';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';

import { TinyBrowserHmrWebpackPlugin } from './plugin.js';

export default {
  mode: 'development',
  entry: ['./client', './src'],
  stats: 'errors-warnings',
  devtool: 'cheap-module-source-map',
  output: {
    chunkFilename: '[name].js',
    filename: '[name].js',
    path: path.resolve('build'),
    publicPath: '/',
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new TinyBrowserHmrWebpackPlugin(),
    new HtmlWebpackPlugin(),
  ],
};
