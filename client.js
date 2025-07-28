/* globals __resourceQuery, __webpack_hash__ */
if (!import.meta.webpackHot) {
  throw new Error(
    'TinyBrowserHmrWebpackPlugin client entry is used without HotModuleReplacementPlugin. Either remove an entry or add a plugin',
  );
}

const { hostname = location.hostname, port } = Object.fromEntries(
  new URLSearchParams(__resourceQuery),
);

if (!port) {
  throw new Error(
    'TinyBrowserHmrWebpackPlugin client entry is used without TinyBrowserHmrWebpackPlugin. Either remove an entry or add a plugin',
  );
}

const WEBSOCKET_URL = `ws://${hostname}:${port}`;
const LOG_PREFIX = '🔥 [HMR]';

(function connect() {
  const ws = new WebSocket(WEBSOCKET_URL);
  ws.onclose = () => setTimeout(connect, 1000);

  /** @param {MessageEvent<unknown>} event */
  ws.onmessage = async event => {
    try {
      const hash = event.data;
      if (typeof hash !== 'string') {
        throw new Error(`Expected 'string', received: "${typeof hash}"`);
      }

      if (
        hash === __webpack_hash__ ||
        import.meta.webpackHot.status() !== 'idle'
      ) {
        return;
      }

      if (await import.meta.webpackHot.check(true)) return;

      throw new Error(
        'Could not find an update, probably because of the server restart',
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        LOG_PREFIX,
        // avoid showing useless stacktrace
        err &&
          typeof err === 'object' &&
          'message' in err &&
          typeof err.message === 'string'
          ? err.message
          : err,
      );

      if (
        typeof location === 'undefined' ||
        typeof location.reload !== 'function'
      ) {
        // eslint-disable-next-line no-console
        console.error(
          LOG_PREFIX,
          'Cannot apply update. You need to do it manually',
        );
        return;
      }

      location.reload();
    }
  };
})();
