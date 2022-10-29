const HtmlWebpackPlugin = require('html-webpack-plugin');
const { createServer } = require('http');
const path = require('path');
const { default: SseStream } = require('ssestream');
const { pipeline } = require('stream');
const webpack = require('webpack');

class BrowserHmrPlugin {
  constructor(port) {
    this.port = port;
  }

  apply(compiler) {
    new webpack.HotModuleReplacementPlugin().apply(compiler);

    let latestHash;
    const streams = [];

    createServer(async (req, res) => {
      const stream = new SseStream(req);

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

module.exports = {
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
