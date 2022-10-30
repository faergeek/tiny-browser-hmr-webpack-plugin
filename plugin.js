import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { pipeline } from 'node:stream';

import SseStream from 'ssestream';

const require = createRequire(import.meta.url);

export class TinyBrowserHmrWebpackPlugin {
  constructor({ port = 8000 } = {}) {
    this.port = port;
  }

  apply(compiler) {
    compiler.hooks.entryOption.tap(this.constructor.name, (context, entry) => {
      let foundClientEntry = false;

      Object.values(entry).forEach(entryValue => {
        const clientIndex = entryValue.import.findIndex(resourcePath => {
          try {
            const pathname = resourcePath.split('?')[0];
            const absPath = require.resolve(pathname, { paths: [context] });

            return absPath === require.resolve('./client');
          } catch {
            return false;
          }
        });

        if (clientIndex !== -1) {
          foundClientEntry = true;
          const entryPath = entryValue.import[clientIndex];
          const [pathname, search] = entryPath.split('?');

          const searchParams = new URLSearchParams(search);
          searchParams.set('port', this.port);

          entryValue.import[clientIndex] = `${pathname}?${searchParams}`;
        }
      });

      if (!foundClientEntry) {
        throw new Error(
          'TinyBrowserHmrWebpackPlugin is used without adding an entry. Either remove a plugin or add an entry'
        );
      }
    });

    let latestHash;
    const streams = [];

    compiler.hooks.done.tap(this.constructor.name, stats => {
      latestHash = stats.hash;

      streams.forEach(stream => {
        stream.write({ event: 'check', data: latestHash });
      });
    });

    createServer((req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');

      const stream = new SseStream.default(req);
      streams.push(stream);

      pipeline(stream, res, () => {
        const index = streams.indexOf(stream);

        if (index !== -1) {
          streams.splice(index, 1);
        }

        res.end();
      });

      if (latestHash) {
        stream.writeMessage({ event: 'check', data: latestHash });
      }
    }).listen(this.port);
  }
}
