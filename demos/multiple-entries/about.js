/* eslint-env browser */
import { render } from './render.js';

import.meta.webpackHot.accept('./render.js');

let counter = 0;

const heading = document.createElement('h1');
heading.textContent = 'About';
document.body.appendChild(heading);

const input = document.createElement('input');
document.body.appendChild(input);

const counterDiv = document.createElement('div');
counterDiv.innerText = render(counter);
document.body.appendChild(counterDiv);

setInterval(() => {
  counterDiv.innerText = render(++counter);
}, 1000);
