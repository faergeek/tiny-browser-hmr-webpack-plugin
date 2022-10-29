/* eslint-env browser */
import { render } from './render.js';

import.meta.webpackHot.accept('./render.js');

let counter = 0;

const div = document.createElement('div');
div.innerText = render(counter);
document.body.appendChild(div);

setInterval(() => {
  div.innerText = render(++counter);
}, 1000);
