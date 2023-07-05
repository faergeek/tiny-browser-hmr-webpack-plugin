import { createRequire } from 'node:module';

import WebSocket, { WebSocketServer } from 'ws';

const require = createRequire(import.meta.url);

export class TinyBrowserHmrWebpackPlugin {
  constructor({ hostname, port = 8000 } = {}) {
    this.hostname = hostname;
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

          if (this.hostname) {
            searchParams.set('hostname', this.hostname);
          }

          searchParams.set('port', this.port);

          entryValue.import[clientIndex] = `${pathname}?${searchParams}`;
        }
      });

      if (!foundClientEntry) {
        throw new Error(
          'TinyBrowserHmrWebpackPlugin is used without adding an entry. Either remove a plugin or add an entry',
        );
      }
    });

    let latestHash;
    const wss = new WebSocketServer({ port: this.port });

    function sendCheck(client) {
      if (!latestHash) {
        return;
      }

      client.send(JSON.stringify({ hash: latestHash }));
    }

    wss.on('connection', client => {
      sendCheck(client);
    });

    compiler.hooks.done.tap(this.constructor.name, stats => {
      latestHash = stats.hash;

      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          sendCheck(client);
        }
      });
    });
  }
}
