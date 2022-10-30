import browser from 'webextension-polyfill';

let counter = 0;
const ports = [];

browser.runtime.onConnect.addListener(port => {
  ports.push(port);

  function handlePortDisconnect() {
    port.onDisconnect.removeListener(handlePortDisconnect);

    const index = ports.indexOf(port);

    if (index !== -1) {
      ports.splice(index, 1);
    }
  }

  port.onDisconnect.addListener(handlePortDisconnect);
});

browser.alarms.create('updateCounter', {
  periodInMinutes: 1 / 60,
});

browser.alarms.onAlarm.addListener(({ name }) => {
  if (name === 'updateCounter') {
    counter++;

    ports.forEach(port => {
      port.postMessage({ name: 'updateCounter', counter });
    });
  }
});
