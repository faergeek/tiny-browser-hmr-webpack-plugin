/* eslint-env browser */
/* globals __resourceQuery, __webpack_hash__ */
function onceIdle(cb) {
  if (import.meta.webpackHot.status() === 'idle') {
    cb();
    return;
  }

  function statusHandler(status) {
    if (status === 'idle') {
      cb();
      import.meta.webpackHot.removeStatusHandler(statusHandler);
    }
  }

  import.meta.webpackHot.addStatusHandler(statusHandler);
}

if (import.meta.webpackHot) {
  const searchParams = new URLSearchParams(__resourceQuery);
  const port = searchParams.get('port');

  if (!port) {
    throw new Error(
      'TinyBrowserHmrWebpackPlugin client entry is used without a plugin. Either remove an entry or add a plugin'
    );
  }

  let lastHash = __webpack_hash__;

  new EventSource(`http://${location.hostname}:${port}`).addEventListener(
    'check',
    event => {
      const newHash = event.data;

      if (newHash !== lastHash) {
        onceIdle(() => {
          import.meta.webpackHot
            .check(true)
            .then(updatedModules => {
              if (!updatedModules) {
                window.location.reload();
                throw new Error('Cannot find an update');
              }

              lastHash = newHash;
            })
            .catch(err => {
              location.reload();
              throw err;
            });
        });
      }
    }
  );
}
