import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import * as path from 'node:path';
import { pipeline } from 'node:stream';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import SseStream from 'ssestream';
import webpack from 'webpack';

const require = createRequire(import.meta.url);

class BrowserHmrPlugin {
  constructor(port) {
    this.port = port;
  }

  apply(compiler) {
    let latestHash;
    const streams = [];

    createServer((req, res) => {
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

    compiler.hooks.entryOption.tap(this.constructor.name, (_context, entry) => {
      Object.values(entry).forEach(entryValue => {
        const hmrIndex = entryValue.import.findIndex(resourcePath => {
          try {
            return (
              require.resolve(resourcePath.split('?')[0]) ===
              require.resolve('./hmr/browser')
            );
          } catch {
            return false;
          }
        });

        if (hmrIndex !== -1) {
          const entryPath = entryValue.import[hmrIndex];
          const [pathname, search] = entryPath.split('?');

          const searchParams = new URLSearchParams(search);
          searchParams.set('port', this.port);

          entryValue.import[hmrIndex] = `${pathname}?${searchParams}`;
        }
      });
    });
  }
}

export default {
  mode: 'development',
  entry: ['./hmr/browser', './src'],
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
    new BrowserHmrPlugin(8000),
    new HtmlWebpackPlugin(),
  ],
};
