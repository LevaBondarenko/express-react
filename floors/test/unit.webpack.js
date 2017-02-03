// Browser ES6 Polyfill
require('babel-polyfill');
var testsContext = require.context('../src/', true, /-test$/);

var data = global.data = {}; // eslint-disable-line

testsContext.keys().forEach(testsContext);
