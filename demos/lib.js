import express from 'express';
import webpack from 'webpack';

function startWebpackWatch(config) {
  return new Promise((resolve, reject) => {
    const compiler = webpack(config);

    const watching = compiler.watch({}, err =>
      err ? reject(err) : resolve(watching)
    );
  });
}

function startHttpServer(path) {
  return new Promise(resolve => {
    const server = express()
      .use(express.static(path))
      .listen(8080, 'localhost', () => {
        resolve(server);
      });
  });
}

export async function runDemo(demoName) {
  const { default: config } = await import(`./${demoName}/webpack.config.js`);
  const watching = await startWebpackWatch(config);
  const server = await startHttpServer(config.output.path);

  return () => {
    watching.close();
    server.close();
  };
}
