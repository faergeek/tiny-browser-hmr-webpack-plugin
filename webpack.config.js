import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import * as path from 'node:path';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import SseStream from 'ssestream';
import { pipeline } from 'stream';
import webpack from 'webpack';

const require = createRequire(import.meta.url);

class BrowserHmrPlugin {
  constructor(port) {
    this.port = port;
  }

  apply(compiler) {
    new webpack.HotModuleReplacementPlugin().apply(compiler);

    let latestHash;
    const streams = [];

    createServer(async (req, res) => {
      const stream = new SseStream.default(req);

      res.setHeader('Access-Control-Allow-Origin', '*');

      pipeline(stream, res, () => {
        res.end();
        const index = streams.indexOf(stream);
        if (index !== -1) {
          streams.splice(index, 1);
        }
      });

      streams.push(stream);

      if (latestHash) {
        stream.write({ event: 'check', data: latestHash });
      }
    }).listen(this.port);

    compiler.hooks.done.tap(this.constructor.name, stats => {
      latestHash = stats.hash;

      streams.forEach(stream => {
        stream.write({ event: 'check', data: latestHash });
      });
    });

    compiler.hooks.entryOption.tap(this.constructor.name, (context, entry) => {
      Object.values(entry).forEach(entryValue => {
        entryValue.import.unshift(
          `${require.resolve('./hmr/browser')}?${this.port}`
        );
      });
    });
  }
}

export default {
  mode: 'development',
  entry: './src',
  stats: 'errors-warnings',
  devtool: 'cheap-module-source-map',
  output: {
    chunkFilename: '[name].js',
    filename: '[name].js',
    path: path.resolve('build'),
    publicPath: '/',
  },
  plugins: (process.stdout.isTTY ? [new webpack.ProgressPlugin()] : []).concat([
    new BrowserHmrPlugin(8000),
    new HtmlWebpackPlugin(),
  ]),
};
