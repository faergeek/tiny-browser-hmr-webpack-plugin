/* eslint-env browser */
/* globals __resourceQuery, __webpack_hash__ */
if (!import.meta.webpackHot) {
  throw new Error(
    'TinyBrowserHmrWebpackPlugin client entry is used without HotModuleReplacementPlugin. Either remove an entry or add a plugin'
  );
}

const searchParams = new URLSearchParams(__resourceQuery);
const hostname = searchParams.get('hostname');
const port = searchParams.get('port');

if (!port) {
  throw new Error(
    'TinyBrowserHmrWebpackPlugin client entry is used without TinyBrowserHmrWebpackPlugin. Either remove an entry or add a plugin'
  );
}

connect();

function connect() {
  const ws = new WebSocket(`ws://${hostname || location.hostname}:${port}`);

  ws.onmessage = async event => {
    const { hash } = JSON.parse(event.data);

    checkForUpdates(hash);
  };

  ws.onclose = () => {
    setTimeout(() => {
      connect();
    }, 5000);
  };
}

function waitForIdle() {
  if (import.meta.webpackHot.status() === 'idle') {
    return;
  }

  return new Promise((resolve, reject) => {
    function statusHandler(status) {
      switch (status) {
        case 'idle':
          resolve();
          break;
        case 'abort':
        case 'fail':
          reject(new Error(`HMR status: "${status}"`));
          break;
        default:
          return;
      }

      import.meta.webpackHot.removeStatusHandler(statusHandler);
    }

    import.meta.webpackHot.addStatusHandler(statusHandler);
  });
}

async function checkForUpdates(hash) {
  if (hash === __webpack_hash__) {
    return;
  }

  await waitForIdle();
  const updatedModules = await import.meta.webpackHot.check(true);

  if (!updatedModules) {
    throw new Error(
      'Could not find an update, probably because of the server restart'
    );
  }

  checkForUpdates(hash);
}
