import express from 'express';
import webpack from 'webpack';

export function startWebpackWatch(config) {
  return new Promise((resolve, reject) => {
    const compiler = webpack(config);

    const watching = compiler.watch({}, err =>
      err ? reject(err) : resolve(watching),
    );
  });
}

export function startHttpServer(path) {
  return new Promise(resolve => {
    const server = express()
      .use(express.static(path))
      .listen(8080, 'localhost', () => {
        resolve(server);
      });
  });
}
