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

function getEntryModuleFilename() {
  let mod = module;

  while (mod.parent) {
    mod = mod.parent;
  }

  return mod.filename;
}

function makeConfig({
  alias,
  babelLoaderOptions,
  cache,
  devtoolModuleFilenameTemplate,
  entry,
  externals,
  externalsType,
  immutableAssets,
  mode,
  name,
  optimization,
  outputPath,
  plugins,
  srcPath,
  target,
}) {
  const filename = `[name]${immutableAssets ? '.[contenthash]' : ''}.js`;

  return {
    mode,
    entry,
    externals,
    externalsType,
    name,
    optimization,
    plugins,
    target,
    stats: 'errors-warnings',
    devtool: mode === 'development' ? 'cheap-module-source-map' : 'source-map',
    cache: cache && {
      type: 'filesystem',
      version: '4',
      buildDependencies: {
        config: [getEntryModuleFilename()],
      },
    },
    output: {
      chunkFilename: filename,
      devtoolModuleFilenameTemplate,
      filename,
      path: outputPath,
      publicPath: '/',
    },
    resolve: {
      alias,
      modules: ['node_modules', srcPath],
      symlinks: false,
    },
    module: {
      strictExportPresence: true,
      rules: [
        {
          test: /\.js$/,
          include: srcPath,
          loader: require.resolve('babel-loader'),
          options: babelLoaderOptions,
        },
        { test: /\.js$/, use: require.resolve('source-map-loader') },
      ],
    },
  };
}

async function makeWebpackConfig({
  alias,
  cache,
  define,
  dev,
  entry,
  extractRuntimeChunk,
  paths,
  port = 8000,
  prefresh,
  reactRefresh,
  watch,
}) {
  const env = dev ? 'development' : 'production';

  return [
    makeConfig({
      alias,
      cache,
      mode: env,
      name: 'browser',
      entry,
      srcPath: paths.src,
      outputPath: paths.build,
      babelLoaderOptions: {
        envName: env,
        plugins: [
          watch && dev && reactRefresh && 'react-refresh/babel',
          watch && dev && prefresh && '@prefresh/babel-plugin',
        ].filter(Boolean),
      },
      immutableAssets: !watch,
      plugins: [
        new webpack.DefinePlugin({
          ...define,
          __DEV__: JSON.stringify(dev),
        }),
      ]
        .concat(process.stdout.isTTY ? [new webpack.ProgressPlugin()] : [])
        .concat(
          watch && dev
            ? [
                new BrowserHmrPlugin(port),
                reactRefresh &&
                  new (require('@pmmmwh/react-refresh-webpack-plugin'))(),
                prefresh && new (require('@prefresh/webpack'))(),
              ].filter(Boolean)
            : []
        )
        .concat(new HtmlWebpackPlugin()),
      optimization: {
        runtimeChunk: extractRuntimeChunk
          ? { name: entrypoint => `runtime-${entrypoint.name}` }
          : undefined,
        splitChunks: {
          cacheGroups: {
            vendors: {
              test: /[\\/]node_modules[\\/]/,
              chunks: 'initial',
              name: (module, chunks, cacheGroupKey) =>
                `${cacheGroupKey}-${chunks.map(chunk => chunk.name).join('&')}`,
            },
          },
        },
      },
    }),
  ];
}

module.exports = (env, argv) => {
  const dev = argv.nodeEnv === 'development';
  const watch = env.WEBPACK_WATCH;

  return makeWebpackConfig({
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
    },
    dev,
    entry: './src',
    paths: {
      build: path.resolve('build'),
      src: path.resolve('src'),
    },
    prefresh: true,
    watch,
  });
};
