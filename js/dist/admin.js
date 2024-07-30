/******/ (() => { // webpackBootstrap
/******/ 	// runtime can't be in strict mode because a global variable is assign and maybe created.
/******/ 	var __webpack_modules__ = ({

/***/ "./src/admin/components/adminPage.tsx":
/*!********************************************!*\
  !*** ./src/admin/components/adminPage.tsx ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ adminPage)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_inheritsLoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/inheritsLoose */ "./node_modules/@babel/runtime/helpers/esm/inheritsLoose.js");
/* harmony import */ var flarum_admin_components_ExtensionPage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! flarum/admin/components/ExtensionPage */ "flarum/admin/components/ExtensionPage");
/* harmony import */ var flarum_admin_components_ExtensionPage__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(flarum_admin_components_ExtensionPage__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var flarum_admin_app__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! flarum/admin/app */ "flarum/admin/app");
/* harmony import */ var flarum_admin_app__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(flarum_admin_app__WEBPACK_IMPORTED_MODULE_2__);



function _trans(key) {
  return flarum_admin_app__WEBPACK_IMPORTED_MODULE_2___default().translator.trans("xypp-websocket-notification.admin." + key);
}
var adminPage = /*#__PURE__*/function (_ExtensionPage) {
  function adminPage() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _ExtensionPage.call.apply(_ExtensionPage, [this].concat(args)) || this;
    _this.WS_KEYS = ["port", "address", "cert", "pk", "self-signed"];
    _this.WS_TYPES = ["websocket", "internal"];
    _this.WS_FUNCTIONS = ["discussion", "post", "notification"];
    return _this;
  }
  (0,_babel_runtime_helpers_esm_inheritsLoose__WEBPACK_IMPORTED_MODULE_0__["default"])(adminPage, _ExtensionPage);
  var _proto = adminPage.prototype;
  _proto.oncreate = function oncreate(vnode) {
    _ExtensionPage.prototype.oncreate.call(this, vnode);
  };
  _proto.content = function content(vnode) {
    var _this2 = this;
    return m("div", {
      className: "xypp-wsn-adminPage-container"
    }, m("div", {
      className: "xypp-wsn-adminPage-group"
    }, m("h2", null, _trans("settings.common.title")), m("div", null, _trans("settings.common.desc")), this.buildSettingComponent({
      type: "text",
      setting: "xypp.ws_notification.common.public_address",
      label: _trans("settings.common.public_address")
    })), m("div", {
      className: "xypp-wsn-adminPage-group"
    }, m("h2", null, _trans("settings.function.title")), m("div", null, _trans("settings.function.desc")), this.WS_FUNCTIONS.map(function (key) {
      return _this2.buildSettingComponent({
        type: "boolean",
        setting: "xypp.ws_notification.function." + key,
        label: _trans("settings.function." + key)
      });
    })), this.WS_TYPES.map(function (type) {
      return m("div", {
        className: "xypp-wsn-adminPage-group"
      }, m("h2", null, _trans("settings." + type + ".title")), m("div", null, _trans("settings." + type + ".desc")), _this2.WS_KEYS.map(function (key) {
        return _this2.buildSettingComponent({
          type: key === "self-signed" ? "boolean" : "text",
          setting: "xypp.ws_notification." + type + "." + key,
          label: _trans("settings." + type + "." + key)
        });
      }));
    }), this.submitButton());
  };
  return adminPage;
}((flarum_admin_components_ExtensionPage__WEBPACK_IMPORTED_MODULE_1___default()));


/***/ }),

/***/ "./src/admin/index.ts":
/*!****************************!*\
  !*** ./src/admin/index.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var flarum_admin_app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! flarum/admin/app */ "flarum/admin/app");
/* harmony import */ var flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(flarum_admin_app__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _components_adminPage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./components/adminPage */ "./src/admin/components/adminPage.tsx");


flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().initializers.add('xypp/flarum-websocket-notification', function () {
  flarum_admin_app__WEBPACK_IMPORTED_MODULE_0___default().extensionData["for"]("xypp-websocket-notification").registerPage(_components_adminPage__WEBPACK_IMPORTED_MODULE_1__["default"]);
});

/***/ }),

/***/ "./src/common/extend.ts":
/*!******************************!*\
  !*** ./src/common/extend.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var flarum_common_extenders__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! flarum/common/extenders */ "flarum/common/extenders");
/* harmony import */ var flarum_common_extenders__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(flarum_common_extenders__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _model_WebsocketAccessToken__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./model/WebsocketAccessToken */ "./src/common/model/WebsocketAccessToken.ts");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ([new (flarum_common_extenders__WEBPACK_IMPORTED_MODULE_0___default().Store)().add('websocket-access-token', _model_WebsocketAccessToken__WEBPACK_IMPORTED_MODULE_1__["default"])]);

/***/ }),

/***/ "./src/common/model/WebsocketAccessToken.ts":
/*!**************************************************!*\
  !*** ./src/common/model/WebsocketAccessToken.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ WebsocketAccessToken)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_inheritsLoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/inheritsLoose */ "./node_modules/@babel/runtime/helpers/esm/inheritsLoose.js");
/* harmony import */ var flarum_common_Model__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! flarum/common/Model */ "flarum/common/Model");
/* harmony import */ var flarum_common_Model__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(flarum_common_Model__WEBPACK_IMPORTED_MODULE_1__);


var WebsocketAccessToken = /*#__PURE__*/function (_Model) {
  function WebsocketAccessToken() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Model.call.apply(_Model, [this].concat(args)) || this;
    _this.token = flarum_common_Model__WEBPACK_IMPORTED_MODULE_1___default().attribute('token');
    _this.url = flarum_common_Model__WEBPACK_IMPORTED_MODULE_1___default().attribute('url', function (url) {
      return url && url.replace("0.0.0.0", location.hostname);
    });
    return _this;
  }
  (0,_babel_runtime_helpers_esm_inheritsLoose__WEBPACK_IMPORTED_MODULE_0__["default"])(WebsocketAccessToken, _Model);
  return WebsocketAccessToken;
}((flarum_common_Model__WEBPACK_IMPORTED_MODULE_1___default()));


/***/ }),

/***/ "flarum/admin/app":
/*!**************************************************!*\
  !*** external "flarum.core.compat['admin/app']" ***!
  \**************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.core.compat['admin/app'];

/***/ }),

/***/ "flarum/admin/components/ExtensionPage":
/*!***********************************************************************!*\
  !*** external "flarum.core.compat['admin/components/ExtensionPage']" ***!
  \***********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.core.compat['admin/components/ExtensionPage'];

/***/ }),

/***/ "flarum/common/Model":
/*!*****************************************************!*\
  !*** external "flarum.core.compat['common/Model']" ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.core.compat['common/Model'];

/***/ }),

/***/ "flarum/common/extenders":
/*!*********************************************************!*\
  !*** external "flarum.core.compat['common/extenders']" ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.core.compat['common/extenders'];

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/inheritsLoose.js":
/*!******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/inheritsLoose.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _inheritsLoose)
/* harmony export */ });
/* harmony import */ var _setPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./setPrototypeOf.js */ "./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js");

function _inheritsLoose(t, o) {
  t.prototype = Object.create(o.prototype), t.prototype.constructor = t, (0,_setPrototypeOf_js__WEBPACK_IMPORTED_MODULE_0__["default"])(t, o);
}


/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _setPrototypeOf)
/* harmony export */ });
function _setPrototypeOf(t, e) {
  return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) {
    return t.__proto__ = e, t;
  }, _setPrototypeOf(t, e);
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!******************!*\
  !*** ./admin.ts ***!
  \******************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   extend: () => (/* reexport safe */ _src_common_extend__WEBPACK_IMPORTED_MODULE_0__["default"])
/* harmony export */ });
/* harmony import */ var _src_common_extend__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/common/extend */ "./src/common/extend.ts");
/* harmony import */ var _src_admin__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./src/admin */ "./src/admin/index.ts");


})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=admin.js.map