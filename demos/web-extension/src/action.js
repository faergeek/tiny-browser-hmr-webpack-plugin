/* eslint-env browser */
import browser from 'webextension-polyfill';

import { render } from './actionRender.js';

import.meta.webpackHot.accept('./actionRender.js');
import.meta.webpackHot.accept();
import.meta.webpackHot.dispose(() => location.reload());

function connect() {
  const port = browser.runtime.connect();

  port.onMessage.addListener(message => {
    if (message.name === 'updateCounter') {
      counterDiv.innerText = render(message.counter);
    }
  });

  port.onDisconnect.addListener(() => {
    connect();
  });
}

connect();

const input = document.createElement('input');
document.body.appendChild(input);

const counterDiv = document.createElement('div');
counterDiv.innerText = 'Connecting...';
document.body.appendChild(counterDiv);
