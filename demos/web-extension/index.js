import { startWebpackWatch } from '../common.js';
import config from './webpack.config.js';

export async function run() {
  const watching = await startWebpackWatch(config);

  return () => {
    watching.close();
  };
}
