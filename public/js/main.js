var main =
webpackJsonp_name_([0,1],[
/* 0 */
/***/ function(module, exports) {

"use strict";
/* WEBPACK VAR INJECTION */(function(__dirname) {"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (message) {

	console.log(__dirname);

	alert("wasdaselcome " + message);
};
/* WEBPACK VAR INJECTION */}.call(exports, "/"))

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
'use strict';

var _main = __webpack_require__(0);

var _main2 = _interopRequireDefault(_main);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _main2.default)('hi');

exports.welcome = _main2.default;

/***/ }
],[1]);