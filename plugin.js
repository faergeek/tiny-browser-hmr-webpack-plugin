import { createRequire } from 'node:module';

import WebSocket, { WebSocketServer } from 'ws';

const require = createRequire(import.meta.url);

export class TinyBrowserHmrWebpackPlugin {
  hostname;
  port;

  /**
   * @param {Object} options
   * @param {string} [options.hostname]
   * @param {number} [options.port=8000]
   */
  constructor({ hostname, port = 8000 } = {}) {
    this.hostname = hostname;
    this.port = port;
  }

  /**
   * @param {import('webpack').Compiler} compiler
   */
  apply(compiler) {
    compiler.hooks.entryOption.tap(this.constructor.name, (context, entry) => {
      let foundClientEntry = false;

      if (typeof entry === 'function') {
        throw new Error('Entry cannot be a function');
      }

      Object.values(entry).forEach(entryValue => {
        if (!entryValue.import) return;

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
          if (this.hostname) searchParams.set('hostname', this.hostname);
          searchParams.set('port', String(this.port));

          entryValue.import[clientIndex] = `${pathname}?${searchParams}`;
        }
      });

      if (!foundClientEntry) {
        throw new Error(
          'TinyBrowserHmrWebpackPlugin is used without adding an entry. Either remove a plugin or add an entry',
        );
      }
    });

    /** @type {string | undefined} */
    let latestHash;
    const wss = new WebSocketServer({ port: this.port });

    /** @param {WebSocket} client */
    function sendCheck(client) {
      if (latestHash) client.send(latestHash);
    }

    wss.on('connection', sendCheck);

    compiler.hooks.done.tap(this.constructor.name, stats => {
      latestHash = stats.hash;

      Array.from(wss.clients)
        .filter(client => client.readyState === WebSocket.OPEN)
        .forEach(sendCheck);
    });
  }
}
