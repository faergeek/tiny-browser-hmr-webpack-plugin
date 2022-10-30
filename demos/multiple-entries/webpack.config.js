import * as path from 'node:path';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';

import { TinyBrowserHmrWebpackPlugin } from '../../plugin.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default {
  context: __dirname,
  mode: 'development',
  entry: {
    main: ['../../client', './main.js'],
    about: ['../../client', './about.js'],
    contacts: ['../../client', './contacts.js'],
  },
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
    new HtmlWebpackPlugin({
      filename: 'index.html',
      chunks: ['main'],
    }),
    new HtmlWebpackPlugin({
      filename: 'about.html',
      chunks: ['about'],
    }),
    new HtmlWebpackPlugin({
      filename: 'contacts.html',
      chunks: ['contacts'],
    }),
  ],
};
