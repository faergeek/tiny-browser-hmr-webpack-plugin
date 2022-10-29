/* eslint-env browser */
/* globals __DEV__ */
__DEV__ && require('preact/debug');
import { render } from 'preact';

import { App } from './app';

render(<App />, document.body);
