import { startHttpServer, startWebpackWatch } from '../common.js';
import config from './webpack.config.js';

export async function run() {
  const watching = await startWebpackWatch(config);
  const server = await startHttpServer(config.output.path);

  return () => {
    watching.close();
    server.close();
  };
}
