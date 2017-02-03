/*
 * Etagi project
 * o.e.kurgaev@it.etagi.com
 */

import {clientComponents} from './mobileBoot';
import {clientApp} from './core/clientApp';

function run() {
  clientApp(clientComponents);
}

// Run the application when both DOM is ready and page content is loaded
if (['complete', 'loaded', 'interactive'].includes(document.readyState) &&
  document.body) {
  run();
} else {
  document.addEventListener('DOMContentLoaded', run, false);
}
