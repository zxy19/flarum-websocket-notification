/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/common/Data/ModelPath.ts":
/*!**************************************!*\
  !*** ./src/common/Data/ModelPath.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ModelPath: () => (/* binding */ ModelPath)
/* harmony export */ });
var ModelPath = /*#__PURE__*/function () {
  function ModelPath(str) {
    this.nodes = void 0;
    this.data = void 0;
    if (str) {
      if (str.endsWith("}")) {
        var t = str.split('||');
        this.data = JSON.parse(t[1]);
        str = t[0];
      }
      this.nodes = str.split('.').map(function (n) {
        var ret = {
          name: n
        };
        if (n.includes('[')) {
          var _n$split = n.split('['),
            name = _n$split[0],
            id = _n$split[1];
          ret.id = id.substring(0, id.length - 1);
          ret.name = name;
        }
        return ret;
      });
    } else {
      this.nodes = [];
    }
  }
  var _proto = ModelPath.prototype;
  _proto.toString = function toString() {
    return this.nodes.map(function (n) {
      return n.id ? n.name + "[" + n.id + "]" : n.name;
    }).join('.') + (this.data ? "||" + JSON.stringify(this.data) : "");
  };
  _proto.add = function add(name, id) {
    this.nodes.push({
      name: name,
      id: id
    });
    return this;
  };
  _proto.get = function get(name) {
    if (!name) return this.nodes[this.nodes.length - 1] || null;
    return this.nodes.find(function (n) {
      return n.name === name;
    }) || null;
  };
  _proto.getId = function getId(name) {
    var node = this.get(name);
    return node && (node.id || null);
  };
  _proto.remove = function remove(name) {
    var index = this.nodes.findIndex(function (n) {
      return n.name === name;
    });
    if (index >= 0) {
      this.nodes.splice(index, 1);
    }
    return this;
  };
  _proto.getData = function getData() {
    return this.data;
  };
  _proto.setData = function setData(data) {
    this.data = data;
    return this;
  };
  return ModelPath;
}();

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

/***/ "./src/common/helper/WebsocketHelper.ts":
/*!**********************************************!*\
  !*** ./src/common/helper/WebsocketHelper.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WebsocketHelper: () => (/* binding */ WebsocketHelper)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/asyncToGenerator */ "./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/regenerator */ "./node_modules/@babel/runtime/regenerator/index.js");
/* harmony import */ var _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var flarum_common_utils_ItemList__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! flarum/common/utils/ItemList */ "flarum/common/utils/ItemList");
/* harmony import */ var flarum_common_utils_ItemList__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(flarum_common_utils_ItemList__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _Data_ModelPath__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Data/ModelPath */ "./src/common/Data/ModelPath.ts");

var _WebsocketHelper;



var RETRY_INTERVALS = [100, 2000, 5000, 10000, 60000, 120000];
var WebsocketHelper = /*#__PURE__*/function () {
  function WebsocketHelper() {
    this.app = void 0;
    this.ws = void 0;
    this.statusChangeCb = void 0;
    this.context = {};
    this.lastSubscribes = [];
    this.pingInterval = void 0;
    this.nextRetry = 0;
    this.inRetryStatus = false;
  }
  WebsocketHelper.getInstance = function getInstance() {
    if (!WebsocketHelper.instance) {
      WebsocketHelper.instance = new WebsocketHelper();
    }
    return WebsocketHelper.instance;
  };
  var _proto = WebsocketHelper.prototype;
  _proto.init = function init(app) {
    this.app = app;
  };
  _proto.start = /*#__PURE__*/function () {
    var _start = (0,_babel_runtime_helpers_esm_asyncToGenerator__WEBPACK_IMPORTED_MODULE_0__["default"])( /*#__PURE__*/_babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().mark(function _callee() {
      var _this = this;
      var item, ws;
      return _babel_runtime_regenerator__WEBPACK_IMPORTED_MODULE_1___default().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            if (!this.app) {
              _context.next = 22;
              break;
            }
            if (this.ws) {
              try {
                this.ws.onclose = function () {};
                this.ws.close();
              } finally {
                this.ws = undefined;
              }
              ;
            }
            if (this.statusChangeCb) this.statusChangeCb("connecting");
            item = null;
            _context.prev = 4;
            _context.next = 7;
            return this.app.store.createRecord("websocket-access-token").save({});
          case 7:
            item = _context.sent;
            _context.next = 13;
            break;
          case 10:
            _context.prev = 10;
            _context.t0 = _context["catch"](4);
            this.retry();
          case 13:
            if (item) {
              _context.next = 16;
              break;
            }
            this.retry();
            return _context.abrupt("return");
          case 16:
            ws = new WebSocket(item.url());
            this.ws = ws;
            ws.onclose = function () {
              _this.retry();
              if (_this.pingInterval) clearInterval(_this.pingInterval);
            };
            ws.onerror = function () {
              _this.retry();
              if (_this.pingInterval) clearInterval(_this.pingInterval);
            };
            ws.onopen = function () {
              _this.lastSubscribes = [];
              _this.reSubscribe();
              _this.pingInterval = setInterval(_this.ping.bind(_this), 30000);
              if (_this.statusChangeCb) _this.statusChangeCb("online");
              _this.nextRetry = 0;
            };
            ws.onmessage = function (e) {
              var data = JSON.parse(e.data);
              if (data.type === "sync") _this.messageHandler(new _Data_ModelPath__WEBPACK_IMPORTED_MODULE_3__.ModelPath(data.path), data.data);
            };
          case 22:
          case "end":
            return _context.stop();
        }
      }, _callee, this, [[4, 10]]);
    }));
    function start() {
      return _start.apply(this, arguments);
    }
    return start;
  }();
  _proto.messageHandler = function messageHandler(path, data) {
    // To be implemented in extends
    console.log("No handler found " + path.toString() + ": " + JSON.stringify(data));
  };
  _proto.getSubscribes = function getSubscribes(context) {
    return new (flarum_common_utils_ItemList__WEBPACK_IMPORTED_MODULE_2___default())();
  };
  _proto.setContext = function setContext(context) {
    var _this2 = this;
    Object.keys(context).forEach(function (v) {
      if (context[v] === null && _this2.context[v]) delete _this2.context[v];else _this2.context[v] = context[v];
    });
    return this;
  };
  _proto.reSubscribe = function reSubscribe(tempContext) {
    var newSub = this.getSubscribes(Object.assign(tempContext || {}, this.context)).toArray().map(function (v) {
      return v.toString();
    });
    console.log("ReSubscribe: " + newSub.join(", "));
    if (!this.changed(newSub)) return;
    this.lastSubscribes = newSub;
    this.send({
      type: "subscribe",
      path: newSub
    });
    return this;
  };
  _proto.state = function state(path) {
    var _this$app;
    if (!((_this$app = this.app) != null && _this$app.session.user)) return;
    this.send({
      type: "state",
      path: path.toString()
    });
  };
  _proto.send = function send(data) {
    if (this.ws) {
      this.ws.send(JSON.stringify(data));
    }
  };
  _proto.onStatusChange = function onStatusChange(cb) {
    this.statusChangeCb = cb;
  };
  _proto.retry = function retry() {
    var _this3 = this;
    if (this.inRetryStatus) return;
    this.inRetryStatus = true;
    if (this.statusChangeCb) this.statusChangeCb("offline");
    setTimeout(function () {
      _this3.inRetryStatus = false;
      _this3.start();
    }, RETRY_INTERVALS[this.nextRetry - 1]);
    if (this.nextRetry < RETRY_INTERVALS.length) {
      this.nextRetry += 1;
    }
  };
  _proto.ping = function ping() {
    this.send({
      type: "ping"
    });
  };
  _proto.changed = function changed(newSub) {
    newSub.sort(function (a, b) {
      return a.localeCompare(b);
    });
    if (newSub.length !== this.lastSubscribes.length) return true;
    for (var i = 0; i < newSub.length; i++) {
      if (newSub[i] !== this.lastSubscribes[i]) return true;
    }
    return false;
  };
  return WebsocketHelper;
}();
_WebsocketHelper = WebsocketHelper;
WebsocketHelper.instance = void 0;

/***/ }),

/***/ "./src/common/index.ts":
/*!*****************************!*\
  !*** ./src/common/index.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WebsocketHelper: () => (/* reexport safe */ _helper_WebsocketHelper__WEBPACK_IMPORTED_MODULE_0__.WebsocketHelper)
/* harmony export */ });
/* harmony import */ var _helper_WebsocketHelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helper/WebsocketHelper */ "./src/common/helper/WebsocketHelper.ts");



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

/***/ "./src/common/util/NodeUtil.ts":
/*!*************************************!*\
  !*** ./src/common/util/NodeUtil.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   showIf: () => (/* binding */ showIf)
/* harmony export */ });
function showIf(judgement, vnode, def) {
  return judgement ? vnode : def || "";
}

/***/ }),

/***/ "./src/common/util/frontend.ts":
/*!*************************************!*\
  !*** ./src/common/util/frontend.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addMessageCb: () => (/* binding */ addMessageCb),
/* harmony export */   addSubscribeCb: () => (/* binding */ addSubscribeCb)
/* harmony export */ });
/* harmony import */ var flarum_common_extend__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! flarum/common/extend */ "flarum/common/extend");
/* harmony import */ var flarum_common_extend__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(flarum_common_extend__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _helper_WebsocketHelper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../helper/WebsocketHelper */ "./src/common/helper/WebsocketHelper.ts");


function addSubscribeCb(name, cb) {
  (0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_0__.extend)(_helper_WebsocketHelper__WEBPACK_IMPORTED_MODULE_1__.WebsocketHelper.prototype, "getSubscribes", cb);
}
function addMessageCb(name, cb) {
  (0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_0__.override)(_helper_WebsocketHelper__WEBPACK_IMPORTED_MODULE_1__.WebsocketHelper.prototype, "messageHandler", function (orig, path, data) {
    var _path$get;
    if (((_path$get = path.get()) == null ? void 0 : _path$get.name) == name) {
      return cb(path, data);
    }
    orig(path, data);
  });
}

/***/ }),

/***/ "./src/forum/components/ConnectionIndicator.tsx":
/*!******************************************************!*\
  !*** ./src/forum/components/ConnectionIndicator.tsx ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ConnectionIndicator)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_inheritsLoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/inheritsLoose */ "./node_modules/@babel/runtime/helpers/esm/inheritsLoose.js");
/* harmony import */ var flarum_common_Component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! flarum/common/Component */ "flarum/common/Component");
/* harmony import */ var flarum_common_Component__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(flarum_common_Component__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! flarum/forum/app */ "flarum/forum/app");
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_app__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _common__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../common */ "./src/common/index.ts");




var ConnectionIndicator = /*#__PURE__*/function (_Component) {
  function ConnectionIndicator() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Component.call.apply(_Component, [this].concat(args)) || this;
    _this.currentStatus = "offline";
    return _this;
  }
  (0,_babel_runtime_helpers_esm_inheritsLoose__WEBPACK_IMPORTED_MODULE_0__["default"])(ConnectionIndicator, _Component);
  var _proto = ConnectionIndicator.prototype;
  _proto.oninit = function oninit(vnode) {
    _Component.prototype.oninit.call(this, vnode);
    _common__WEBPACK_IMPORTED_MODULE_3__.WebsocketHelper.getInstance().onStatusChange(this.status.bind(this));
  };
  _proto.view = function view(vnode) {
    return this.getContent();
  };
  _proto.getContent = function getContent() {
    switch (this.currentStatus) {
      case "online":
        return m("span", {
          className: "connectionIndicator-icon online"
        }, m("i", {
          className: "far fa-circle"
        }), flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().translator.trans("xypp-websocket-notification.forum.connection.connected"));
      case "offline":
        return m("span", {
          className: "connectionIndicator-icon offline"
        }, m("i", {
          className: "fas fa-times"
        }), flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().translator.trans("xypp-websocket-notification.forum.connection.disconnected"));
      case "connecting":
        return m("span", {
          className: "connectionIndicator-icon connecting"
        }, m("i", {
          className: "fas fa-wifi"
        }), flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().translator.trans("xypp-websocket-notification.forum.connection.connecting"));
    }
  };
  _proto.status = function status(_status) {
    this.currentStatus = _status;
    m.redraw();
  };
  return ConnectionIndicator;
}((flarum_common_Component__WEBPACK_IMPORTED_MODULE_1___default()));


/***/ }),

/***/ "./src/forum/index.ts":
/*!****************************!*\
  !*** ./src/forum/index.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! flarum/forum/app */ "flarum/forum/app");
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_app__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _common_helper_WebsocketHelper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../common/helper/WebsocketHelper */ "./src/common/helper/WebsocketHelper.ts");
/* harmony import */ var _integration__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./integration */ "./src/forum/integration/index.ts");
/* harmony import */ var _components_ConnectionIndicator__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/ConnectionIndicator */ "./src/forum/components/ConnectionIndicator.tsx");




flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().initializers.add('xypp/flarum-websocket-notification', function () {
  _common_helper_WebsocketHelper__WEBPACK_IMPORTED_MODULE_1__.WebsocketHelper.getInstance().init((flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default()));
  (0,_integration__WEBPACK_IMPORTED_MODULE_2__["default"])();
  setTimeout(function () {
    _common_helper_WebsocketHelper__WEBPACK_IMPORTED_MODULE_1__.WebsocketHelper.getInstance().start();
  }, 1000);
  var ctr = $("<div></div>").addClass("connectionIndicator");
  ctr.appendTo(document.body);
  m.mount(ctr[0], {
    view: function view() {
      return _components_ConnectionIndicator__WEBPACK_IMPORTED_MODULE_3__["default"].component();
    }
  });
});

/***/ }),

/***/ "./src/forum/integration/components/ComingDiscussion.tsx":
/*!***************************************************************!*\
  !*** ./src/forum/integration/components/ComingDiscussion.tsx ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ComingDiscussion)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_inheritsLoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/inheritsLoose */ "./node_modules/@babel/runtime/helpers/esm/inheritsLoose.js");
/* harmony import */ var flarum_common_Component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! flarum/common/Component */ "flarum/common/Component");
/* harmony import */ var flarum_common_Component__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(flarum_common_Component__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! flarum/forum/app */ "flarum/forum/app");
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_app__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! flarum/common/components/Button */ "flarum/common/components/Button");
/* harmony import */ var flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var flarum_common_components_Link__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! flarum/common/components/Link */ "flarum/common/components/Link");
/* harmony import */ var flarum_common_components_Link__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(flarum_common_components_Link__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _common_util_NodeUtil__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../common/util/NodeUtil */ "./src/common/util/NodeUtil.ts");






var ComingDiscussion = /*#__PURE__*/function (_Component) {
  function ComingDiscussion() {
    var _this;
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    _this = _Component.call.apply(_Component, [this].concat(args)) || this;
    _this.autoRefreshTimeout = null;
    _this.autoRefresh = false;
    _this.countdown = 30;
    return _this;
  }
  (0,_babel_runtime_helpers_esm_inheritsLoose__WEBPACK_IMPORTED_MODULE_0__["default"])(ComingDiscussion, _Component);
  var _proto = ComingDiscussion.prototype;
  _proto.oncreate = function oncreate(vnode) {
    var _app$session,
      _this2 = this;
    _Component.prototype.oncreate.call(this, vnode);
    this.autoRefresh = ((_app$session = (flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().session)) == null || (_app$session = _app$session.user) == null || (_app$session = _app$session.preferences()) == null ? void 0 : _app$session.xyppWsnNewDiscussionAutoRefresh) || false;
    if (this.autoRefresh) {
      this.autoRefreshTimeout = setInterval(function () {
        _this2.updateCtd();
      }, 1000);
    }
  };
  _proto.onbeforeremove = function onbeforeremove(vnode) {
    _Component.prototype.onbeforeremove.call(this, vnode);
    if (this.autoRefreshTimeout) {
      clearInterval(this.autoRefreshTimeout);
    }
  };
  _proto.view = function view(vnode) {
    return m("div", {
      className: "ComingDiscussion"
    }, m("div", {
      className: "ComingDiscussion-icon"
    }, m("i", {
      className: "fas fa-star-of-life"
    }), m("div", {
      className: "ComingDiscussion-icon-text"
    }, flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().translator.trans('xypp-websocket-notification.forum.new_discussion.tip'))), m("div", {
      className: "ComingDiscussion-item-container"
    }, this.attrs.list.map(function (item) {
      return m("div", {
        "class": "ComingDiscussion-item"
      }, m("span", {
        className: "ComingDiscussion-count"
      }, item.count), m((flarum_common_components_Link__WEBPACK_IMPORTED_MODULE_4___default()), {
        className: "ComingDiscussion-link",
        href: flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().route("discussion.near", {
          id: item.id,
          near: item.post
        })
      }, item.title));
    })), m("div", {
      className: "ComingDiscussion-Reload"
    }, m((flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_3___default()), {
      "class": "Button",
      onclick: this.callback.bind(this)
    }, m("i", {
      className: "fas fa-sync"
    })), (0,_common_util_NodeUtil__WEBPACK_IMPORTED_MODULE_5__.showIf)(this.autoRefresh, m("div", {
      className: "autoReloadIndicator"
    }, this.countdown))));
  };
  _proto.callback = function callback() {
    if (this.autoRefreshTimeout) {
      clearInterval(this.autoRefreshTimeout);
      this.autoRefreshTimeout = null;
      this.autoRefresh = false;
    }
    this.attrs.cb();
  };
  _proto.updateCtd = function updateCtd() {
    if (this.countdown > 0) {
      this.countdown--;
      if (this.countdown == 0) {
        this.callback();
      }
      m.redraw();
    }
  };
  return ComingDiscussion;
}((flarum_common_Component__WEBPACK_IMPORTED_MODULE_1___default()));


/***/ }),

/***/ "./src/forum/integration/components/NotificationFloater.tsx":
/*!******************************************************************!*\
  !*** ./src/forum/integration/components/NotificationFloater.tsx ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ NotificationFloater)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_inheritsLoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/inheritsLoose */ "./node_modules/@babel/runtime/helpers/esm/inheritsLoose.js");
/* harmony import */ var flarum_common_Component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! flarum/common/Component */ "flarum/common/Component");
/* harmony import */ var flarum_common_Component__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(flarum_common_Component__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! flarum/forum/app */ "flarum/forum/app");
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_app__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _common_util_NodeUtil__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../common/util/NodeUtil */ "./src/common/util/NodeUtil.ts");
/* harmony import */ var flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! flarum/common/components/Button */ "flarum/common/components/Button");
/* harmony import */ var flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_4__);





var NotificationFloater = /*#__PURE__*/function (_Component) {
  function NotificationFloater() {
    return _Component.apply(this, arguments) || this;
  }
  (0,_babel_runtime_helpers_esm_inheritsLoose__WEBPACK_IMPORTED_MODULE_0__["default"])(NotificationFloater, _Component);
  var _proto = NotificationFloater.prototype;
  _proto.view = function view(vnode) {
    var _app$session;
    var position = (((_app$session = (flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().session)) == null || (_app$session = _app$session.user) == null ? void 0 : _app$session.preferences()) || {})["xyppWsnFloaterPosition"] || "center";
    return m("div", {
      className: (0,_common_util_NodeUtil__WEBPACK_IMPORTED_MODULE_3__.showIf)(this.attrs.notifications.length > 0, "notification-floater", "notification-floater hidden") + " " + position
    }, this.attrs.notifications.map(function (n) {
      var type = n.notification.data.attributes.contentType;
      var cls = (flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().notificationComponents)[type];
      return m("div", {
        className: (0,_common_util_NodeUtil__WEBPACK_IMPORTED_MODULE_3__.showIf)(n.first, "notification-floater-item in", "notification-floater-item")
      }, (0,_common_util_NodeUtil__WEBPACK_IMPORTED_MODULE_3__.showIf)(!!cls, m(cls, {
        notification: n.notification
      }), m("div", null, type)));
    }), m("div", {
      className: "notification-floater-close-container"
    }, m((flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_4___default()), {
      className: "Button Button-primary",
      onclick: this.attrs.dismiss
    }, m("i", {
      className: "fas fa-times"
    }), flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().translator.trans("xypp-websocket-notification.forum.close_notification_floater"))));
  };
  return NotificationFloater;
}((flarum_common_Component__WEBPACK_IMPORTED_MODULE_1___default()));


/***/ }),

/***/ "./src/forum/integration/components/TypingTip.tsx":
/*!********************************************************!*\
  !*** ./src/forum/integration/components/TypingTip.tsx ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TypingTip)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_inheritsLoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/inheritsLoose */ "./node_modules/@babel/runtime/helpers/esm/inheritsLoose.js");
/* harmony import */ var flarum_common_Component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! flarum/common/Component */ "flarum/common/Component");
/* harmony import */ var flarum_common_Component__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(flarum_common_Component__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! flarum/forum/app */ "flarum/forum/app");
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_app__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _common_util_NodeUtil__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../common/util/NodeUtil */ "./src/common/util/NodeUtil.ts");
/* harmony import */ var flarum_common_helpers_avatar__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! flarum/common/helpers/avatar */ "flarum/common/helpers/avatar");
/* harmony import */ var flarum_common_helpers_avatar__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(flarum_common_helpers_avatar__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var flarum_common_helpers_username__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! flarum/common/helpers/username */ "flarum/common/helpers/username");
/* harmony import */ var flarum_common_helpers_username__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(flarum_common_helpers_username__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var flarum_common_components_Link__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! flarum/common/components/Link */ "flarum/common/components/Link");
/* harmony import */ var flarum_common_components_Link__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(flarum_common_components_Link__WEBPACK_IMPORTED_MODULE_6__);







var TypingTip = /*#__PURE__*/function (_Component) {
  function TypingTip() {
    return _Component.apply(this, arguments) || this;
  }
  (0,_babel_runtime_helpers_esm_inheritsLoose__WEBPACK_IMPORTED_MODULE_0__["default"])(TypingTip, _Component);
  var _proto = TypingTip.prototype;
  _proto.view = function view(vnode) {
    var MAX_LIST_LEN = parseInt(flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().forum.attribute("xyppWsnTypeTipCountLimit") || "4");
    if (!this.attrs.typingUsers.length) {
      return m("div", null, flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().translator.trans("xypp-websocket-notification.forum.typing.no_one"));
    }
    return m("div", {
      className: "PostStream-item"
    }, m("div", {
      className: "LineContainer"
    }, m("div", {
      className: "users"
    }, this.attrs.typingUsers.slice(0, MAX_LIST_LEN).map(function (u) {
      return m((flarum_common_components_Link__WEBPACK_IMPORTED_MODULE_6___default()), {
        className: "typingUser",
        href: flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().route.user(u)
      }, flarum_common_helpers_avatar__WEBPACK_IMPORTED_MODULE_4___default()(u), m("span", {
        className: "username"
      }, flarum_common_helpers_username__WEBPACK_IMPORTED_MODULE_5___default()(u)));
    })), (0,_common_util_NodeUtil__WEBPACK_IMPORTED_MODULE_3__.showIf)(this.attrs.typingUsers.length > MAX_LIST_LEN, m("div", null, flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().translator.trans("xypp-websocket-notification.forum.typing.and_more", {
      rest: this.attrs.typingUsers.length - MAX_LIST_LEN
    }))), m("div", null, flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().translator.trans("xypp-websocket-notification.forum.typing.is_typing"))));
  };
  return TypingTip;
}((flarum_common_Component__WEBPACK_IMPORTED_MODULE_1___default()));


/***/ }),

/***/ "./src/forum/integration/components/WrappedFlagNotification.tsx":
/*!**********************************************************************!*\
  !*** ./src/forum/integration/components/WrappedFlagNotification.tsx ***!
  \**********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ WrappedFlagNotification)
/* harmony export */ });
/* harmony import */ var _babel_runtime_helpers_esm_inheritsLoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/inheritsLoose */ "./node_modules/@babel/runtime/helpers/esm/inheritsLoose.js");
/* harmony import */ var flarum_common_Component__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! flarum/common/Component */ "flarum/common/Component");
/* harmony import */ var flarum_common_Component__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(flarum_common_Component__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var flarum_common_components_Link__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! flarum/common/components/Link */ "flarum/common/components/Link");
/* harmony import */ var flarum_common_components_Link__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(flarum_common_components_Link__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! flarum/forum/app */ "flarum/forum/app");
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_app__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var flarum_common_helpers_avatar__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! flarum/common/helpers/avatar */ "flarum/common/helpers/avatar");
/* harmony import */ var flarum_common_helpers_avatar__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(flarum_common_helpers_avatar__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var flarum_common_helpers_icon__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! flarum/common/helpers/icon */ "flarum/common/helpers/icon");
/* harmony import */ var flarum_common_helpers_icon__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(flarum_common_helpers_icon__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var flarum_common_helpers_username__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! flarum/common/helpers/username */ "flarum/common/helpers/username");
/* harmony import */ var flarum_common_helpers_username__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(flarum_common_helpers_username__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var flarum_common_helpers_humanTime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! flarum/common/helpers/humanTime */ "flarum/common/helpers/humanTime");
/* harmony import */ var flarum_common_helpers_humanTime__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(flarum_common_helpers_humanTime__WEBPACK_IMPORTED_MODULE_7__);








var WrappedFlagNotification = /*#__PURE__*/function (_Component) {
  function WrappedFlagNotification() {
    return _Component.apply(this, arguments) || this;
  }
  (0,_babel_runtime_helpers_esm_inheritsLoose__WEBPACK_IMPORTED_MODULE_0__["default"])(WrappedFlagNotification, _Component);
  var _proto = WrappedFlagNotification.prototype;
  _proto.view = function view() {
    var flag = this.attrs.notification.data.attributes.flag;
    var post = flag.post();
    return m((flarum_common_components_Link__WEBPACK_IMPORTED_MODULE_2___default()), {
      href: flarum_forum_app__WEBPACK_IMPORTED_MODULE_3___default().route.post(post),
      className: "Notification Flag",
      onclick: function onclick(e) {
        (flarum_forum_app__WEBPACK_IMPORTED_MODULE_3___default().flags).index = post;
        e.redraw = false;
      }
    }, flarum_common_helpers_avatar__WEBPACK_IMPORTED_MODULE_4___default()(post.user()), flarum_common_helpers_icon__WEBPACK_IMPORTED_MODULE_5___default()('fas fa-flag', {
      className: 'Notification-icon'
    }), m("span", {
      className: "Notification-content"
    }, flarum_forum_app__WEBPACK_IMPORTED_MODULE_3___default().translator.trans('flarum-flags.forum.flagged_posts.item_text', {
      username: flarum_common_helpers_username__WEBPACK_IMPORTED_MODULE_6___default()(post.user()),
      em: m("em", null),
      discussion: post.discussion().title()
    })), flarum_common_helpers_humanTime__WEBPACK_IMPORTED_MODULE_7___default()(flag.createdAt()), m("div", {
      className: "Notification-excerpt"
    }, post.contentPlain()));
  };
  return WrappedFlagNotification;
}((flarum_common_Component__WEBPACK_IMPORTED_MODULE_1___default()));


/***/ }),

/***/ "./src/forum/integration/discussionList.tsx":
/*!**************************************************!*\
  !*** ./src/forum/integration/discussionList.tsx ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initDiscussionList: () => (/* binding */ initDiscussionList)
/* harmony export */ });
/* harmony import */ var _common_util_frontend__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../common/util/frontend */ "./src/common/util/frontend.ts");
/* harmony import */ var _common_Data_ModelPath__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../common/Data/ModelPath */ "./src/common/Data/ModelPath.ts");
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! flarum/forum/app */ "flarum/forum/app");
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_app__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var flarum_forum_components_DiscussionPage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! flarum/forum/components/DiscussionPage */ "flarum/forum/components/DiscussionPage");
/* harmony import */ var flarum_forum_components_DiscussionPage__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_components_DiscussionPage__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var flarum_common_extend__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! flarum/common/extend */ "flarum/common/extend");
/* harmony import */ var flarum_common_extend__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(flarum_common_extend__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _common_helper_WebsocketHelper__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../common/helper/WebsocketHelper */ "./src/common/helper/WebsocketHelper.ts");
/* harmony import */ var flarum_forum_components_DiscussionList__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! flarum/forum/components/DiscussionList */ "flarum/forum/components/DiscussionList");
/* harmony import */ var flarum_forum_components_DiscussionList__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_components_DiscussionList__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var _components_ComingDiscussion__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./components/ComingDiscussion */ "./src/forum/integration/components/ComingDiscussion.tsx");
/* harmony import */ var flarum_common_components_FieldSet__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! flarum/common/components/FieldSet */ "flarum/common/components/FieldSet");
/* harmony import */ var flarum_common_components_FieldSet__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(flarum_common_components_FieldSet__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var flarum_forum_components_SettingsPage__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! flarum/forum/components/SettingsPage */ "flarum/forum/components/SettingsPage");
/* harmony import */ var flarum_forum_components_SettingsPage__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_components_SettingsPage__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var flarum_common_components_Switch__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! flarum/common/components/Switch */ "flarum/common/components/Switch");
/* harmony import */ var flarum_common_components_Switch__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(flarum_common_components_Switch__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! flarum/common/components/Button */ "flarum/common/components/Button");
/* harmony import */ var flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_11__);












function initDiscussionList() {
  (0,_common_util_frontend__WEBPACK_IMPORTED_MODULE_0__.addSubscribeCb)("discussion", function (items, context) {
    if (context.discussionList) {
      if (context.discussionListTag) {
        var tag = flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().store.getBy("tags", "slug", context.discussionListTag);
        if (tag) {
          items.add("discussionList", new _common_Data_ModelPath__WEBPACK_IMPORTED_MODULE_1__.ModelPath().add("tag", tag.id()).add("discussion"));
        }
      } else {
        items.add("discussionList", new _common_Data_ModelPath__WEBPACK_IMPORTED_MODULE_1__.ModelPath().add("discussion"));
      }
    }
  });
  var comingDiscussions = [];
  var toPullUpDiscussions = [];
  function refresh() {
    toPullUpDiscussions.forEach(flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().discussions.addDiscussion.bind((flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().discussions)));
    comingDiscussions = [];
    toPullUpDiscussions = [];
    m.redraw();
  }
  function addOne(id, title, post) {
    var _app$current, _app$session;
    if (((_app$current = (flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().current)) == null || (_app$current = _app$current.data) == null || (_app$current = _app$current.discussion) == null ? void 0 : _app$current.id()) == id) return;
    var baseCount = 0;
    for (var i = 0; i < comingDiscussions.length; i++) {
      if (comingDiscussions[i].id == id) {
        baseCount = comingDiscussions[i].count;
        comingDiscussions.splice(i, 1);
        break;
      }
    }
    comingDiscussions.unshift({
      title: title,
      post: post,
      id: id,
      count: baseCount + 1
    });
    var maxLen = (((_app$session = (flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().session)) == null || (_app$session = _app$session.user) == null ? void 0 : _app$session.preferences()) || {})["xyppWsnNewDiscussionListLen"] || 5;
    if (comingDiscussions.length > maxLen) {
      comingDiscussions.pop();
    }
  }
  (0,_common_util_frontend__WEBPACK_IMPORTED_MODULE_0__.addMessageCb)("discussion", function (path, data) {
    var discussion = flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().store.pushPayload(data.discussion);
    var idx = toPullUpDiscussions.findIndex(function (d) {
      return d.id() == discussion.id();
    });
    if (idx != -1) {
      toPullUpDiscussions.splice(idx, 1);
    }
    toPullUpDiscussions.push(discussion);
    addOne(discussion.id(), discussion.title(), data.post);
    m.redraw();
  });
  (0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_4__.extend)((flarum_forum_components_DiscussionList__WEBPACK_IMPORTED_MODULE_6___default().prototype), "view", function (vnode) {
    if (comingDiscussions.length && vnode && vnode.children && Array.isArray(vnode.children)) {
      vnode.children.unshift(_components_ComingDiscussion__WEBPACK_IMPORTED_MODULE_7__["default"].component({
        list: comingDiscussions,
        cb: function () {
          refresh();
        }.bind(this)
      }));
    }
  });
  (0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_4__.extend)((flarum_forum_components_DiscussionList__WEBPACK_IMPORTED_MODULE_6___default().prototype), "oncreate", function () {
    var tag = this.attrs.state.params.tags;
    _common_helper_WebsocketHelper__WEBPACK_IMPORTED_MODULE_5__.WebsocketHelper.getInstance().setContext({
      discussionListTag: tag,
      discussionList: true
    }).reSubscribe();
  });
  (0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_4__.extend)((flarum_forum_components_DiscussionList__WEBPACK_IMPORTED_MODULE_6___default().prototype), "onbeforeremove", function () {
    _common_helper_WebsocketHelper__WEBPACK_IMPORTED_MODULE_5__.WebsocketHelper.getInstance().setContext({
      discussionList: null
    }).reSubscribe();
  });
  (0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_4__.extend)((flarum_forum_components_DiscussionPage__WEBPACK_IMPORTED_MODULE_3___default().prototype), "show", function (r, discussion) {
    if (discussion) for (var i = comingDiscussions.length - 1; i >= 0; i--) {
      if (comingDiscussions[i].id == discussion.id()) {
        comingDiscussions.splice(i, 1);
        break;
      }
    }
  });
  var savingList = false;
  (0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_4__.extend)((flarum_forum_components_SettingsPage__WEBPACK_IMPORTED_MODULE_9___default().prototype), 'settingsItems', function (items) {
    var _app$session2, _app$session4;
    items.add('xypp-wsn-newPostOption', m((flarum_common_components_FieldSet__WEBPACK_IMPORTED_MODULE_8___default()), {
      label: flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().translator.trans("xypp-websocket-notification.forum.new_discussion.title"),
      className: "Settings-newPost"
    }, m("p", null, m((flarum_common_components_Switch__WEBPACK_IMPORTED_MODULE_10___default()), {
      state: (((_app$session2 = (flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().session)) == null || (_app$session2 = _app$session2.user) == null ? void 0 : _app$session2.preferences()) || {})["xyppWsnNewDiscussionAutoRefresh"] || false,
      onchange: function onchange(v) {
        var _app$session3;
        (_app$session3 = (flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().session)) == null || (_app$session3 = _app$session3.user) == null || _app$session3.savePreferences({
          "xyppWsnNewDiscussionAutoRefresh": v
        });
      }
    }, flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().translator.trans("xypp-websocket-notification.forum.new_discussion.auto_refresh"))), m("p", null, flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().translator.trans("xypp-websocket-notification.forum.new_discussion.list_length")), m("div", null, m("input", {
      id: "input-xyppWsnNewDiscussionListLen",
      className: "FormControl",
      type: "number",
      value: (((_app$session4 = (flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().session)) == null || (_app$session4 = _app$session4.user) == null ? void 0 : _app$session4.preferences()) || {})["xyppWsnNewDiscussionListLen"] || 5
    }), m((flarum_common_components_Button__WEBPACK_IMPORTED_MODULE_11___default()), {
      onclick: function onclick(e) {
        var _app$session5;
        e.preventDefault();
        savingList = true;
        m.redraw();
        (_app$session5 = (flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().session)) == null || (_app$session5 = _app$session5.user) == null || _app$session5.savePreferences({
          "xyppWsnNewDiscussionListLen": parseInt($("#input-xyppWsnNewDiscussionListLen").val())
        }).then(function () {
          savingList = false;
          m.redraw();
        });
      },
      disabled: savingList,
      loading: savingList
    }, flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().translator.trans("xypp-websocket-notification.forum.new_discussion.list_len_button")))));
  });
}

/***/ }),

/***/ "./src/forum/integration/index.ts":
/*!****************************************!*\
  !*** ./src/forum/integration/index.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ init)
/* harmony export */ });
/* harmony import */ var _notification__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./notification */ "./src/forum/integration/notification.tsx");
/* harmony import */ var _post__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./post */ "./src/forum/integration/post.ts");
/* harmony import */ var _discussionList__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./discussionList */ "./src/forum/integration/discussionList.tsx");
/* harmony import */ var _like__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./like */ "./src/forum/integration/like.ts");
/* harmony import */ var _typing__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./typing */ "./src/forum/integration/typing.tsx");
/* harmony import */ var _reaction__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./reaction */ "./src/forum/integration/reaction.ts");
/* harmony import */ var _online__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./online */ "./src/forum/integration/online.tsx");
/* harmony import */ var _poll__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./poll */ "./src/forum/integration/poll.ts");








function init() {
  (0,_notification__WEBPACK_IMPORTED_MODULE_0__.initNotification)();
  (0,_post__WEBPACK_IMPORTED_MODULE_1__.initPost)();
  (0,_discussionList__WEBPACK_IMPORTED_MODULE_2__.initDiscussionList)();
  (0,_like__WEBPACK_IMPORTED_MODULE_3__.initLike)();
  (0,_typing__WEBPACK_IMPORTED_MODULE_4__.initTypingTip)();
  (0,_reaction__WEBPACK_IMPORTED_MODULE_5__.initReaction)();
  (0,_online__WEBPACK_IMPORTED_MODULE_6__.initOnline)();
  (0,_poll__WEBPACK_IMPORTED_MODULE_7__.initPoll)();
}

/***/ }),

/***/ "./src/forum/integration/like.ts":
/*!***************************************!*\
  !*** ./src/forum/integration/like.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initLike: () => (/* binding */ initLike)
/* harmony export */ });
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! flarum/forum/app */ "flarum/forum/app");
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_app__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _common_Data_ModelPath__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../common/Data/ModelPath */ "./src/common/Data/ModelPath.ts");
/* harmony import */ var _common_util_frontend__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../common/util/frontend */ "./src/common/util/frontend.ts");



function initLike() {
  (0,_common_util_frontend__WEBPACK_IMPORTED_MODULE_2__.addSubscribeCb)("like", function (items, context) {
    if (context.discussion) {
      items.add("like", new _common_Data_ModelPath__WEBPACK_IMPORTED_MODULE_1__.ModelPath().add("discussion", context.discussion).add("post").add("like"));
    }
  });
  (0,_common_util_frontend__WEBPACK_IMPORTED_MODULE_2__.addMessageCb)("like", function (path, data) {
    var post = flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().store.getById("posts", data.post);
    if (!flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().store.getById("users", data.user.data.id)) {
      flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().store.pushPayload(data.user);
    }
    if (post) {
      var like = post.data.relationships.likes;
      for (var i = 0; i < like.data.length; i++) {
        if (like.data[i].id == data.user.data.id) {
          if (!data.like) {
            like.data.splice(i, 1);
            post.freshness = new Date();
            m.redraw();
          }
          return;
        }
      }
      if (data.like) {
        like.data.push({
          type: "users",
          id: data.user.data.id
        });
        post.freshness = new Date();
        m.redraw();
      }
    }
  });
}

/***/ }),

/***/ "./src/forum/integration/notification.tsx":
/*!************************************************!*\
  !*** ./src/forum/integration/notification.tsx ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initNotification: () => (/* binding */ initNotification)
/* harmony export */ });
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! flarum/forum/app */ "flarum/forum/app");
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_app__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _common_util_frontend__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../common/util/frontend */ "./src/common/util/frontend.ts");
/* harmony import */ var _common_Data_ModelPath__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../common/Data/ModelPath */ "./src/common/Data/ModelPath.ts");
/* harmony import */ var _components_NotificationFloater__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/NotificationFloater */ "./src/forum/integration/components/NotificationFloater.tsx");
/* harmony import */ var flarum_common_extend__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! flarum/common/extend */ "flarum/common/extend");
/* harmony import */ var flarum_common_extend__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(flarum_common_extend__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var flarum_forum_components_SettingsPage__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! flarum/forum/components/SettingsPage */ "flarum/forum/components/SettingsPage");
/* harmony import */ var flarum_forum_components_SettingsPage__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_components_SettingsPage__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var flarum_common_components_FieldSet__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! flarum/common/components/FieldSet */ "flarum/common/components/FieldSet");
/* harmony import */ var flarum_common_components_FieldSet__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(flarum_common_components_FieldSet__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var flarum_common_components_Select__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! flarum/common/components/Select */ "flarum/common/components/Select");
/* harmony import */ var flarum_common_components_Select__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(flarum_common_components_Select__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _components_WrappedFlagNotification__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./components/WrappedFlagNotification */ "./src/forum/integration/components/WrappedFlagNotification.tsx");









function initNotification() {
  var notifications = [];
  (0,_common_util_frontend__WEBPACK_IMPORTED_MODULE_1__.addSubscribeCb)('notification', function (items) {
    var _app$session, _app$session2;
    if ((_app$session = (flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().session)) != null && _app$session.user) items.add("notification", new _common_Data_ModelPath__WEBPACK_IMPORTED_MODULE_2__.ModelPath().add("notification", flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().session.user.id()));
    if ((_app$session2 = (flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().session)) != null && (_app$session2 = _app$session2.user) != null && _app$session2.isAdmin()) {
      items.add("flag", new _common_Data_ModelPath__WEBPACK_IMPORTED_MODULE_2__.ModelPath().add("flag"));
    }
  });
  (0,_common_util_frontend__WEBPACK_IMPORTED_MODULE_1__.addMessageCb)('notification', function (path, data) {
    var _app$session$user$unr, _app$session$user$new;
    var model = flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().store.pushPayload(data);
    var obj = {
      time: 8,
      first: false,
      notification: model
    };
    notifications.unshift(obj);
    if ((flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().session).user) flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().session.user.pushAttributes({
      unreadNotificationCount: (_app$session$user$unr = flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().session.user.unreadNotificationCount()) != null ? _app$session$user$unr : 0 + 1,
      newNotificationCount: (_app$session$user$new = flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().session.user.newNotificationCount()) != null ? _app$session$user$new : 0 + 1
    });
    m.redraw();
    setTimeout(function () {
      obj.first = true;
      m.redraw();
    }, 100);
  });
  (0,_common_util_frontend__WEBPACK_IMPORTED_MODULE_1__.addMessageCb)('flag', function (path, data) {
    var _app$flags;
    var model = flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().store.pushPayload(data);
    var notification = {
      data: {
        attributes: {
          contentType: "wrappedFlag",
          flag: model
        }
      }
    };
    var obj = {
      time: 8,
      first: false,
      notification: notification
    };
    notifications.unshift(obj);
    if ((_app$flags = (flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().flags)) != null && _app$flags.cache && Array.isArray((flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().flags).cache)) {
      flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().flags.cache.unshift(model);
    }
    (flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().forum).data.attributes.flagCount++;
    m.redraw();
    setTimeout(function () {
      obj.first = true;
      m.redraw();
    }, 100);
  });
  function dismiss() {
    while (notifications.length) {
      notifications.pop();
    }
  }
  var ctr = $("<div></div>").addClass("notification-floater-container");
  ctr.appendTo(document.body);
  m.mount(ctr[0], {
    view: function view() {
      return _components_NotificationFloater__WEBPACK_IMPORTED_MODULE_3__["default"].component({
        notifications: notifications,
        dismiss: dismiss
      });
    }
  });
  setInterval(function () {
    notifications.forEach(function (element) {
      element.time--;
    });
    var changed = false;
    for (var i = notifications.length - 1; i >= 0; i--) {
      if (notifications[i].time <= 0) {
        notifications.splice(i, 1);
        changed = true;
      }
    }
    if (changed) m.redraw();
  }, 1000);
  var SELECT_FLOATER = {
    "left": flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans("xypp-websocket-notification.forum.notification_floater.left"),
    "right": flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans("xypp-websocket-notification.forum.notification_floater.right"),
    "center": flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans("xypp-websocket-notification.forum.notification_floater.center")
  };
  (0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_4__.extend)((flarum_forum_components_SettingsPage__WEBPACK_IMPORTED_MODULE_5___default().prototype), 'settingsItems', function (items) {
    var _app$session3;
    var position = (((_app$session3 = (flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().session)) == null || (_app$session3 = _app$session3.user) == null ? void 0 : _app$session3.preferences()) || {})["xyppWsnFloaterPosition"] || "center";
    items.add('xypp-wsn-floater-position', m((flarum_common_components_FieldSet__WEBPACK_IMPORTED_MODULE_6___default()), {
      label: flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans("xypp-websocket-notification.forum.notification_floater.title"),
      className: "Settings-floater"
    }, m("p", null, flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().translator.trans("xypp-websocket-notification.forum.notification_floater.desc")), m((flarum_common_components_Select__WEBPACK_IMPORTED_MODULE_7___default()), {
      options: SELECT_FLOATER,
      value: position,
      onchange: function onchange(value) {
        flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().session.user.savePreferences({
          "xyppWsnFloaterPosition": value
        });
      }
    })));
  });
  (flarum_forum_app__WEBPACK_IMPORTED_MODULE_0___default().notificationComponents).wrappedFlag = _components_WrappedFlagNotification__WEBPACK_IMPORTED_MODULE_8__["default"];
}

/***/ }),

/***/ "./src/forum/integration/online.tsx":
/*!******************************************!*\
  !*** ./src/forum/integration/online.tsx ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initOnline: () => (/* binding */ initOnline)
/* harmony export */ });
/* harmony import */ var _common_Data_ModelPath__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../common/Data/ModelPath */ "./src/common/Data/ModelPath.ts");
/* harmony import */ var _common_util_frontend__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../common/util/frontend */ "./src/common/util/frontend.ts");
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! flarum/forum/app */ "flarum/forum/app");
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_app__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var flarum_common_models_User__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! flarum/common/models/User */ "flarum/common/models/User");
/* harmony import */ var flarum_common_models_User__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(flarum_common_models_User__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var flarum_common_extend__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! flarum/common/extend */ "flarum/common/extend");
/* harmony import */ var flarum_common_extend__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(flarum_common_extend__WEBPACK_IMPORTED_MODULE_4__);





function initOnline() {
  (0,_common_util_frontend__WEBPACK_IMPORTED_MODULE_1__.addSubscribeCb)("online", function (items, context) {
    items.add("online", new _common_Data_ModelPath__WEBPACK_IMPORTED_MODULE_0__.ModelPath().add("state").add("online"));
  });
  (0,_common_util_frontend__WEBPACK_IMPORTED_MODULE_1__.addMessageCb)("online", function (path, data) {
    var id = path.getId("state");
    if (id) {
      var model = flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().store.getById("users", id);
      if (model) {
        model.pushAttributes({
          onlineState: data.state
        });
        m.redraw();
      }
    }
  });
  (0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_4__.override)((flarum_common_models_User__WEBPACK_IMPORTED_MODULE_3___default().prototype), "isOnline", function (fn) {
    var online = this.attribute("onlineState");
    if (online === false || online === true) return online;
    return fn();
  });
}

/***/ }),

/***/ "./src/forum/integration/poll.ts":
/*!***************************************!*\
  !*** ./src/forum/integration/poll.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initPoll: () => (/* binding */ initPoll)
/* harmony export */ });
/* harmony import */ var _common_Data_ModelPath__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../common/Data/ModelPath */ "./src/common/Data/ModelPath.ts");
/* harmony import */ var _common_util_frontend__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../common/util/frontend */ "./src/common/util/frontend.ts");
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! flarum/forum/app */ "flarum/forum/app");
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_app__WEBPACK_IMPORTED_MODULE_2__);



function initPoll() {
  (0,_common_util_frontend__WEBPACK_IMPORTED_MODULE_1__.addSubscribeCb)("poll", function (items, context) {
    if (context.discussion && flarum.extensions['fof-polls']) {
      var discussion = flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().store.getById("discussions", context.discussion);
      if (discussion.hasPoll()) {
        discussion.posts().forEach(function (post) {
          var poll = post.polls();
          if (poll && poll.length) {
            poll.forEach(function (p) {
              items.add("poll-" + p.id(), new _common_Data_ModelPath__WEBPACK_IMPORTED_MODULE_0__.ModelPath().add("poll", p.id()));
            });
          }
        });
      }
    }
  });
  (0,_common_util_frontend__WEBPACK_IMPORTED_MODULE_1__.addMessageCb)("poll", function (path, data) {
    var count = 0;
    Object.keys(data).forEach(function (key) {
      var pollOption = flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().store.getById("poll_options", key);
      if (pollOption) {
        pollOption.pushAttributes({
          voteCount: data[key]
        });
        count += data[key];
      }
    });
    var poll = flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().store.getById("polls", path.getId());
    poll == null || poll.pushAttributes({
      "voteCount": count
    });
    m.redraw();
  });
}

/***/ }),

/***/ "./src/forum/integration/post.ts":
/*!***************************************!*\
  !*** ./src/forum/integration/post.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initPost: () => (/* binding */ initPost)
/* harmony export */ });
/* harmony import */ var _common_util_frontend__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../common/util/frontend */ "./src/common/util/frontend.ts");
/* harmony import */ var _common_Data_ModelPath__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../common/Data/ModelPath */ "./src/common/Data/ModelPath.ts");
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! flarum/forum/app */ "flarum/forum/app");
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_app__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var flarum_forum_components_DiscussionPage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! flarum/forum/components/DiscussionPage */ "flarum/forum/components/DiscussionPage");
/* harmony import */ var flarum_forum_components_DiscussionPage__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_components_DiscussionPage__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var flarum_common_extend__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! flarum/common/extend */ "flarum/common/extend");
/* harmony import */ var flarum_common_extend__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(flarum_common_extend__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _common_helper_WebsocketHelper__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../common/helper/WebsocketHelper */ "./src/common/helper/WebsocketHelper.ts");






function initPost() {
  (0,_common_util_frontend__WEBPACK_IMPORTED_MODULE_0__.addSubscribeCb)("post", function (items, context) {
    if (context.discussion) {
      items.add("discussion", new _common_Data_ModelPath__WEBPACK_IMPORTED_MODULE_1__.ModelPath().add("discussion", context.discussion).add("post"));
    }
  });
  (0,_common_util_frontend__WEBPACK_IMPORTED_MODULE_0__.addMessageCb)("post", function (path, data) {
    var _ref;
    var route = ((_ref = (flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().current).data) != null ? _ref : {}).routeName;
    if (route !== "discussion" && route !== "discussion.near") return;
    var discussion = (flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().current).data.discussion;
    var stream = flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().current.get("stream");
    if (discussion.id() == path.getId("discussion") && stream.viewingEnd()) {
      var model = flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().store.pushPayload(data);
      if (!discussion.data.relationships.posts.data.find(function (v) {
        return v.id == model.id();
      })) {
        discussion.data.relationships.posts.data.push({
          type: 'posts',
          id: model.id()
        });
        stream.loadNext();
      } else {
        m.redraw();
      }
    }
  });
  var removeStack = 0;
  (0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_4__.extend)((flarum_forum_components_DiscussionPage__WEBPACK_IMPORTED_MODULE_3___default().prototype), "show", function (r, discussion) {
    if (discussion) {
      removeStack++;
      _common_helper_WebsocketHelper__WEBPACK_IMPORTED_MODULE_5__.WebsocketHelper.getInstance().setContext({
        discussion: discussion.id()
      }).reSubscribe();
    }
  });
  (0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_4__.extend)((flarum_forum_components_DiscussionPage__WEBPACK_IMPORTED_MODULE_3___default().prototype), "onbeforeremove", function () {
    if (this.discussion) {
      removeStack--;
      if (removeStack < 0) removeStack = 0;
      if (removeStack == 0) _common_helper_WebsocketHelper__WEBPACK_IMPORTED_MODULE_5__.WebsocketHelper.getInstance().setContext({
        discussion: null
      }).reSubscribe();
    }
  });
}

/***/ }),

/***/ "./src/forum/integration/reaction.ts":
/*!*******************************************!*\
  !*** ./src/forum/integration/reaction.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initReaction: () => (/* binding */ initReaction)
/* harmony export */ });
/* harmony import */ var _common_Data_ModelPath__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../common/Data/ModelPath */ "./src/common/Data/ModelPath.ts");
/* harmony import */ var _common_util_frontend__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../common/util/frontend */ "./src/common/util/frontend.ts");
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! flarum/forum/app */ "flarum/forum/app");
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_app__WEBPACK_IMPORTED_MODULE_2__);



function initReaction() {
  (0,_common_util_frontend__WEBPACK_IMPORTED_MODULE_1__.addSubscribeCb)("reaction", function (items, context) {
    if (context.discussion) {
      items.add("reaction", new _common_Data_ModelPath__WEBPACK_IMPORTED_MODULE_0__.ModelPath().add("discussion", context.discussion).add("post").add("reaction"));
    }
  });
  (0,_common_util_frontend__WEBPACK_IMPORTED_MODULE_1__.addMessageCb)("reaction", function (path, data) {
    if (path.getId("post")) {
      var post = flarum_forum_app__WEBPACK_IMPORTED_MODULE_2___default().store.getById("posts", path.getId("post"));
      if (post) {
        post.pushAttributes({
          reactionCounts: data.counts
        });
        post.freshness = new Date();
        m.redraw();
      }
    }
  });
}

/***/ }),

/***/ "./src/forum/integration/typing.tsx":
/*!******************************************!*\
  !*** ./src/forum/integration/typing.tsx ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initTypingTip: () => (/* binding */ initTypingTip)
/* harmony export */ });
/* harmony import */ var flarum_common_extend__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! flarum/common/extend */ "flarum/common/extend");
/* harmony import */ var flarum_common_extend__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(flarum_common_extend__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var flarum_forum_components_ComposerBody__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! flarum/forum/components/ComposerBody */ "flarum/forum/components/ComposerBody");
/* harmony import */ var flarum_forum_components_ComposerBody__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_components_ComposerBody__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../common */ "./src/common/index.ts");
/* harmony import */ var _common_Data_ModelPath__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../common/Data/ModelPath */ "./src/common/Data/ModelPath.ts");
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! flarum/forum/app */ "flarum/forum/app");
/* harmony import */ var flarum_forum_app__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_app__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var flarum_forum_components_DiscussionPage__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! flarum/forum/components/DiscussionPage */ "flarum/forum/components/DiscussionPage");
/* harmony import */ var flarum_forum_components_DiscussionPage__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_components_DiscussionPage__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _common_util_frontend__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../../common/util/frontend */ "./src/common/util/frontend.ts");
/* harmony import */ var flarum_forum_components_PostStream__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! flarum/forum/components/PostStream */ "flarum/forum/components/PostStream");
/* harmony import */ var flarum_forum_components_PostStream__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_components_PostStream__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var _components_TypingTip__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./components/TypingTip */ "./src/forum/integration/components/TypingTip.tsx");
/* harmony import */ var flarum_common_components_FieldSet__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! flarum/common/components/FieldSet */ "flarum/common/components/FieldSet");
/* harmony import */ var flarum_common_components_FieldSet__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(flarum_common_components_FieldSet__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var flarum_common_components_Switch__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! flarum/common/components/Switch */ "flarum/common/components/Switch");
/* harmony import */ var flarum_common_components_Switch__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(flarum_common_components_Switch__WEBPACK_IMPORTED_MODULE_10__);
/* harmony import */ var flarum_forum_components_SettingsPage__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! flarum/forum/components/SettingsPage */ "flarum/forum/components/SettingsPage");
/* harmony import */ var flarum_forum_components_SettingsPage__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(flarum_forum_components_SettingsPage__WEBPACK_IMPORTED_MODULE_11__);
function _createForOfIteratorHelperLoose(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (t) return (t = t.call(r)).next.bind(t); if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var o = 0; return function () { return o >= r.length ? { done: !0 } : { done: !1, value: r[o++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }












function initTypingTip() {
  (0,_common_util_frontend__WEBPACK_IMPORTED_MODULE_6__.addMessageCb)("typing", function (path, data) {
    var discussion = flarum_forum_app__WEBPACK_IMPORTED_MODULE_4___default().store.getById("discussions", path.getId("discussion"));
    if (discussion) {
      var typings = discussion.typingUsers;
      for (var i = 0; i < typings.length; i++) {
        if (typings[i].id() == path.getId("state")) {
          typings.splice(i, 1);
          if (!data.state) {
            m.redraw();
            return;
          }
        }
      }
      if (!data.state) {
        discussion.restTypingUsers--;
        return;
      }
      typings.unshift(flarum_forum_app__WEBPACK_IMPORTED_MODULE_4___default().store.pushPayload(data.user));
      m.redraw();
    }
  });
  (0,_common_util_frontend__WEBPACK_IMPORTED_MODULE_6__.addSubscribeCb)("typing", function (items, context) {
    if (!flarum_forum_app__WEBPACK_IMPORTED_MODULE_4___default().forum.attribute("xyppWsnTypeTip")) {
      return;
    }
    if (context.discussion) {
      items.add("typing", new _common_Data_ModelPath__WEBPACK_IMPORTED_MODULE_3__.ModelPath().add("state").add("discussion", context.discussion).add("typing"));
    }
  });
  (0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_0__.extend)((flarum_forum_components_ComposerBody__WEBPACK_IMPORTED_MODULE_1___default().prototype), "oninit", function (val) {
    var _app$session, _app$session2, _app$session3;
    if (!flarum_forum_app__WEBPACK_IMPORTED_MODULE_4___default().forum.attribute("xyppWsnTypeTip")) {
      return;
    }
    if ((((_app$session = (flarum_forum_app__WEBPACK_IMPORTED_MODULE_4___default().session)) == null || (_app$session = _app$session.user) == null ? void 0 : _app$session.preferences()) || {})["xyppWsnNoTypeTip"]) {
      return;
    }
    if (this.attrs.discussion) _common__WEBPACK_IMPORTED_MODULE_2__.WebsocketHelper.getInstance().state(new _common_Data_ModelPath__WEBPACK_IMPORTED_MODULE_3__.ModelPath().add("state", (_app$session2 = (flarum_forum_app__WEBPACK_IMPORTED_MODULE_4___default().session)) == null || (_app$session2 = _app$session2.user) == null ? void 0 : _app$session2.id()).add("discussion", this.attrs.discussion.id()).add("typing"));
    if (this.attrs.post) _common__WEBPACK_IMPORTED_MODULE_2__.WebsocketHelper.getInstance().state(new _common_Data_ModelPath__WEBPACK_IMPORTED_MODULE_3__.ModelPath().add("state", (_app$session3 = (flarum_forum_app__WEBPACK_IMPORTED_MODULE_4___default().session)) == null || (_app$session3 = _app$session3.user) == null ? void 0 : _app$session3.id()).add("discussion", this.attrs.post.discussion().id()).add("typing"));
  });
  (0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_0__.extend)((flarum_forum_components_ComposerBody__WEBPACK_IMPORTED_MODULE_1___default().prototype), "onbeforeremove", function (r) {
    var _app$session4, _app$session5, _app$session6;
    if (!flarum_forum_app__WEBPACK_IMPORTED_MODULE_4___default().forum.attribute("xyppWsnTypeTip")) {
      return;
    }
    if ((((_app$session4 = (flarum_forum_app__WEBPACK_IMPORTED_MODULE_4___default().session)) == null || (_app$session4 = _app$session4.user) == null ? void 0 : _app$session4.preferences()) || {})["xyppWsnNoTypeTip"]) {
      return;
    }
    if (this.attrs.discussion) _common__WEBPACK_IMPORTED_MODULE_2__.WebsocketHelper.getInstance().state(new _common_Data_ModelPath__WEBPACK_IMPORTED_MODULE_3__.ModelPath().add("state", (_app$session5 = (flarum_forum_app__WEBPACK_IMPORTED_MODULE_4___default().session)) == null || (_app$session5 = _app$session5.user) == null ? void 0 : _app$session5.id()).add("release").add("discussion", this.attrs.discussion.id()).add("typing"));
    if (this.attrs.post) _common__WEBPACK_IMPORTED_MODULE_2__.WebsocketHelper.getInstance().state(new _common_Data_ModelPath__WEBPACK_IMPORTED_MODULE_3__.ModelPath().add("state", (_app$session6 = (flarum_forum_app__WEBPACK_IMPORTED_MODULE_4___default().session)) == null || (_app$session6 = _app$session6.user) == null ? void 0 : _app$session6.id()).add("release").add("discussion", this.attrs.post.discussion().id()).add("typing"));
  });
  (0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_0__.extend)((flarum_forum_components_DiscussionPage__WEBPACK_IMPORTED_MODULE_5___default().prototype), "show", function (r, discussion) {
    var typings = discussion.attribute("typeTip");
    //@ts-ignore
    discussion.typingUsers = [];
    for (var _iterator = _createForOfIteratorHelperLoose(typings.user), _step; !(_step = _iterator()).done;) {
      var _app$session7;
      var user = _step.value;
      if (((_app$session7 = (flarum_forum_app__WEBPACK_IMPORTED_MODULE_4___default().session)) == null || (_app$session7 = _app$session7.user) == null ? void 0 : _app$session7.id()) == user.data.id) continue;
      var u = flarum_forum_app__WEBPACK_IMPORTED_MODULE_4___default().store.getById("users", user.data.id);
      if (!u) {
        u = flarum_forum_app__WEBPACK_IMPORTED_MODULE_4___default().store.pushPayload(user);
      }
      //@ts-ignore
      discussion.typingUsers.push(u);
    }
  });
  (0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_0__.extend)((flarum_forum_components_PostStream__WEBPACK_IMPORTED_MODULE_7___default().prototype), "endItems", function (items) {
    if (this.discussion.typingUsers.length) items.add("typings", _components_TypingTip__WEBPACK_IMPORTED_MODULE_8__["default"].component({
      typingUsers: this.discussion.typingUsers,
      key: "typingTip"
    }));
  });
  (0,flarum_common_extend__WEBPACK_IMPORTED_MODULE_0__.extend)((flarum_forum_components_SettingsPage__WEBPACK_IMPORTED_MODULE_11___default().prototype), 'settingsItems', function (items) {
    var _app$session8;
    items.add('xypp-wsn-newPostOption', m((flarum_common_components_FieldSet__WEBPACK_IMPORTED_MODULE_9___default()), {
      label: flarum_forum_app__WEBPACK_IMPORTED_MODULE_4___default().translator.trans("xypp-websocket-notification.forum.typing.title"),
      className: "Settings-typing"
    }, m("p", null, m((flarum_common_components_Switch__WEBPACK_IMPORTED_MODULE_10___default()), {
      state: (((_app$session8 = (flarum_forum_app__WEBPACK_IMPORTED_MODULE_4___default().session)) == null || (_app$session8 = _app$session8.user) == null ? void 0 : _app$session8.preferences()) || {})["xyppWsnNoTypeTip"] || false,
      onchange: function onchange(v) {
        var _app$session9;
        (_app$session9 = (flarum_forum_app__WEBPACK_IMPORTED_MODULE_4___default().session)) == null || (_app$session9 = _app$session9.user) == null || _app$session9.savePreferences({
          "xyppWsnNoTypeTip": v
        });
      }
    }, flarum_forum_app__WEBPACK_IMPORTED_MODULE_4___default().translator.trans("xypp-websocket-notification.forum.typing.no_type_tip")))));
  });
}

/***/ }),

/***/ "flarum/common/Component":
/*!*********************************************************!*\
  !*** external "flarum.core.compat['common/Component']" ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.core.compat['common/Component'];

/***/ }),

/***/ "flarum/common/Model":
/*!*****************************************************!*\
  !*** external "flarum.core.compat['common/Model']" ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.core.compat['common/Model'];

/***/ }),

/***/ "flarum/common/components/Button":
/*!*****************************************************************!*\
  !*** external "flarum.core.compat['common/components/Button']" ***!
  \*****************************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.core.compat['common/components/Button'];

/***/ }),

/***/ "flarum/common/components/FieldSet":
/*!*******************************************************************!*\
  !*** external "flarum.core.compat['common/components/FieldSet']" ***!
  \*******************************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.core.compat['common/components/FieldSet'];

/***/ }),

/***/ "flarum/common/components/Link":
/*!***************************************************************!*\
  !*** external "flarum.core.compat['common/components/Link']" ***!
  \***************************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.core.compat['common/components/Link'];

/***/ }),

/***/ "flarum/common/components/Select":
/*!*****************************************************************!*\
  !*** external "flarum.core.compat['common/components/Select']" ***!
  \*****************************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.core.compat['common/components/Select'];

/***/ }),

/***/ "flarum/common/components/Switch":
/*!*****************************************************************!*\
  !*** external "flarum.core.compat['common/components/Switch']" ***!
  \*****************************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.core.compat['common/components/Switch'];

/***/ }),

/***/ "flarum/common/extend":
/*!******************************************************!*\
  !*** external "flarum.core.compat['common/extend']" ***!
  \******************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.core.compat['common/extend'];

/***/ }),

/***/ "flarum/common/extenders":
/*!*********************************************************!*\
  !*** external "flarum.core.compat['common/extenders']" ***!
  \*********************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.core.compat['common/extenders'];

/***/ }),

/***/ "flarum/common/helpers/avatar":
/*!**************************************************************!*\
  !*** external "flarum.core.compat['common/helpers/avatar']" ***!
  \**************************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.core.compat['common/helpers/avatar'];

/***/ }),

/***/ "flarum/common/helpers/humanTime":
/*!*****************************************************************!*\
  !*** external "flarum.core.compat['common/helpers/humanTime']" ***!
  \*****************************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.core.compat['common/helpers/humanTime'];

/***/ }),

/***/ "flarum/common/helpers/icon":
/*!************************************************************!*\
  !*** external "flarum.core.compat['common/helpers/icon']" ***!
  \************************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.core.compat['common/helpers/icon'];

/***/ }),

/***/ "flarum/common/helpers/username":
/*!****************************************************************!*\
  !*** external "flarum.core.compat['common/helpers/username']" ***!
  \****************************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.core.compat['common/helpers/username'];

/***/ }),

/***/ "flarum/common/models/User":
/*!***********************************************************!*\
  !*** external "flarum.core.compat['common/models/User']" ***!
  \***********************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.core.compat['common/models/User'];

/***/ }),

/***/ "flarum/common/utils/ItemList":
/*!**************************************************************!*\
  !*** external "flarum.core.compat['common/utils/ItemList']" ***!
  \**************************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.core.compat['common/utils/ItemList'];

/***/ }),

/***/ "flarum/forum/app":
/*!**************************************************!*\
  !*** external "flarum.core.compat['forum/app']" ***!
  \**************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.core.compat['forum/app'];

/***/ }),

/***/ "flarum/forum/components/ComposerBody":
/*!**********************************************************************!*\
  !*** external "flarum.core.compat['forum/components/ComposerBody']" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.core.compat['forum/components/ComposerBody'];

/***/ }),

/***/ "flarum/forum/components/DiscussionList":
/*!************************************************************************!*\
  !*** external "flarum.core.compat['forum/components/DiscussionList']" ***!
  \************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.core.compat['forum/components/DiscussionList'];

/***/ }),

/***/ "flarum/forum/components/DiscussionPage":
/*!************************************************************************!*\
  !*** external "flarum.core.compat['forum/components/DiscussionPage']" ***!
  \************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.core.compat['forum/components/DiscussionPage'];

/***/ }),

/***/ "flarum/forum/components/PostStream":
/*!********************************************************************!*\
  !*** external "flarum.core.compat['forum/components/PostStream']" ***!
  \********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.core.compat['forum/components/PostStream'];

/***/ }),

/***/ "flarum/forum/components/SettingsPage":
/*!**********************************************************************!*\
  !*** external "flarum.core.compat['forum/components/SettingsPage']" ***!
  \**********************************************************************/
/***/ ((module) => {

"use strict";
module.exports = flarum.core.compat['forum/components/SettingsPage'];

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/regeneratorRuntime.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/regeneratorRuntime.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(/*! ./typeof.js */ "./node_modules/@babel/runtime/helpers/typeof.js")["default"]);
function _regeneratorRuntime() {
  "use strict";

  /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */
  module.exports = _regeneratorRuntime = function _regeneratorRuntime() {
    return e;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  var t,
    e = {},
    r = Object.prototype,
    n = r.hasOwnProperty,
    o = Object.defineProperty || function (t, e, r) {
      t[e] = r.value;
    },
    i = "function" == typeof Symbol ? Symbol : {},
    a = i.iterator || "@@iterator",
    c = i.asyncIterator || "@@asyncIterator",
    u = i.toStringTag || "@@toStringTag";
  function define(t, e, r) {
    return Object.defineProperty(t, e, {
      value: r,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }), t[e];
  }
  try {
    define({}, "");
  } catch (t) {
    define = function define(t, e, r) {
      return t[e] = r;
    };
  }
  function wrap(t, e, r, n) {
    var i = e && e.prototype instanceof Generator ? e : Generator,
      a = Object.create(i.prototype),
      c = new Context(n || []);
    return o(a, "_invoke", {
      value: makeInvokeMethod(t, r, c)
    }), a;
  }
  function tryCatch(t, e, r) {
    try {
      return {
        type: "normal",
        arg: t.call(e, r)
      };
    } catch (t) {
      return {
        type: "throw",
        arg: t
      };
    }
  }
  e.wrap = wrap;
  var h = "suspendedStart",
    l = "suspendedYield",
    f = "executing",
    s = "completed",
    y = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  var p = {};
  define(p, a, function () {
    return this;
  });
  var d = Object.getPrototypeOf,
    v = d && d(d(values([])));
  v && v !== r && n.call(v, a) && (p = v);
  var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p);
  function defineIteratorMethods(t) {
    ["next", "throw", "return"].forEach(function (e) {
      define(t, e, function (t) {
        return this._invoke(e, t);
      });
    });
  }
  function AsyncIterator(t, e) {
    function invoke(r, o, i, a) {
      var c = tryCatch(t[r], t, o);
      if ("throw" !== c.type) {
        var u = c.arg,
          h = u.value;
        return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) {
          invoke("next", t, i, a);
        }, function (t) {
          invoke("throw", t, i, a);
        }) : e.resolve(h).then(function (t) {
          u.value = t, i(u);
        }, function (t) {
          return invoke("throw", t, i, a);
        });
      }
      a(c.arg);
    }
    var r;
    o(this, "_invoke", {
      value: function value(t, n) {
        function callInvokeWithMethodAndArg() {
          return new e(function (e, r) {
            invoke(t, n, e, r);
          });
        }
        return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
      }
    });
  }
  function makeInvokeMethod(e, r, n) {
    var o = h;
    return function (i, a) {
      if (o === f) throw Error("Generator is already running");
      if (o === s) {
        if ("throw" === i) throw a;
        return {
          value: t,
          done: !0
        };
      }
      for (n.method = i, n.arg = a;;) {
        var c = n.delegate;
        if (c) {
          var u = maybeInvokeDelegate(c, n);
          if (u) {
            if (u === y) continue;
            return u;
          }
        }
        if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) {
          if (o === h) throw o = s, n.arg;
          n.dispatchException(n.arg);
        } else "return" === n.method && n.abrupt("return", n.arg);
        o = f;
        var p = tryCatch(e, r, n);
        if ("normal" === p.type) {
          if (o = n.done ? s : l, p.arg === y) continue;
          return {
            value: p.arg,
            done: n.done
          };
        }
        "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg);
      }
    };
  }
  function maybeInvokeDelegate(e, r) {
    var n = r.method,
      o = e.iterator[n];
    if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y;
    var i = tryCatch(o, e.iterator, r.arg);
    if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y;
    var a = i.arg;
    return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y);
  }
  function pushTryEntry(t) {
    var e = {
      tryLoc: t[0]
    };
    1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e);
  }
  function resetTryEntry(t) {
    var e = t.completion || {};
    e.type = "normal", delete e.arg, t.completion = e;
  }
  function Context(t) {
    this.tryEntries = [{
      tryLoc: "root"
    }], t.forEach(pushTryEntry, this), this.reset(!0);
  }
  function values(e) {
    if (e || "" === e) {
      var r = e[a];
      if (r) return r.call(e);
      if ("function" == typeof e.next) return e;
      if (!isNaN(e.length)) {
        var o = -1,
          i = function next() {
            for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next;
            return next.value = t, next.done = !0, next;
          };
        return i.next = i;
      }
    }
    throw new TypeError(_typeof(e) + " is not iterable");
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", {
    value: GeneratorFunctionPrototype,
    configurable: !0
  }), o(GeneratorFunctionPrototype, "constructor", {
    value: GeneratorFunction,
    configurable: !0
  }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) {
    var e = "function" == typeof t && t.constructor;
    return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name));
  }, e.mark = function (t) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t;
  }, e.awrap = function (t) {
    return {
      __await: t
    };
  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () {
    return this;
  }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) {
    void 0 === i && (i = Promise);
    var a = new AsyncIterator(wrap(t, r, n, o), i);
    return e.isGeneratorFunction(r) ? a : a.next().then(function (t) {
      return t.done ? t.value : a.next();
    });
  }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () {
    return this;
  }), define(g, "toString", function () {
    return "[object Generator]";
  }), e.keys = function (t) {
    var e = Object(t),
      r = [];
    for (var n in e) r.push(n);
    return r.reverse(), function next() {
      for (; r.length;) {
        var t = r.pop();
        if (t in e) return next.value = t, next.done = !1, next;
      }
      return next.done = !0, next;
    };
  }, e.values = values, Context.prototype = {
    constructor: Context,
    reset: function reset(e) {
      if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t);
    },
    stop: function stop() {
      this.done = !0;
      var t = this.tryEntries[0].completion;
      if ("throw" === t.type) throw t.arg;
      return this.rval;
    },
    dispatchException: function dispatchException(e) {
      if (this.done) throw e;
      var r = this;
      function handle(n, o) {
        return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o;
      }
      for (var o = this.tryEntries.length - 1; o >= 0; --o) {
        var i = this.tryEntries[o],
          a = i.completion;
        if ("root" === i.tryLoc) return handle("end");
        if (i.tryLoc <= this.prev) {
          var c = n.call(i, "catchLoc"),
            u = n.call(i, "finallyLoc");
          if (c && u) {
            if (this.prev < i.catchLoc) return handle(i.catchLoc, !0);
            if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
          } else if (c) {
            if (this.prev < i.catchLoc) return handle(i.catchLoc, !0);
          } else {
            if (!u) throw Error("try statement without catch or finally");
            if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
          }
        }
      }
    },
    abrupt: function abrupt(t, e) {
      for (var r = this.tryEntries.length - 1; r >= 0; --r) {
        var o = this.tryEntries[r];
        if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) {
          var i = o;
          break;
        }
      }
      i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null);
      var a = i ? i.completion : {};
      return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a);
    },
    complete: function complete(t, e) {
      if ("throw" === t.type) throw t.arg;
      return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y;
    },
    finish: function finish(t) {
      for (var e = this.tryEntries.length - 1; e >= 0; --e) {
        var r = this.tryEntries[e];
        if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y;
      }
    },
    "catch": function _catch(t) {
      for (var e = this.tryEntries.length - 1; e >= 0; --e) {
        var r = this.tryEntries[e];
        if (r.tryLoc === t) {
          var n = r.completion;
          if ("throw" === n.type) {
            var o = n.arg;
            resetTryEntry(r);
          }
          return o;
        }
      }
      throw Error("illegal catch attempt");
    },
    delegateYield: function delegateYield(e, r, n) {
      return this.delegate = {
        iterator: values(e),
        resultName: r,
        nextLoc: n
      }, "next" === this.method && (this.arg = t), y;
    }
  }, e;
}
module.exports = _regeneratorRuntime, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/typeof.js":
/*!*******************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/typeof.js ***!
  \*******************************************************/
/***/ ((module) => {

function _typeof(o) {
  "@babel/helpers - typeof";

  return (module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports), _typeof(o);
}
module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ "./node_modules/@babel/runtime/regenerator/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/@babel/runtime/regenerator/index.js ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// TODO(Babel 8): Remove this file.

var runtime = __webpack_require__(/*! ../helpers/regeneratorRuntime */ "./node_modules/@babel/runtime/helpers/regeneratorRuntime.js")();
module.exports = runtime;

// Copied from https://github.com/facebook/regenerator/blob/main/packages/runtime/runtime.js#L736=
try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}

/***/ }),

/***/ "./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js":
/*!*********************************************************************!*\
  !*** ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ _asyncToGenerator)
/* harmony export */ });
function asyncGeneratorStep(n, t, e, r, o, a, c) {
  try {
    var i = n[a](c),
      u = i.value;
  } catch (n) {
    return void e(n);
  }
  i.done ? t(u) : Promise.resolve(u).then(r, o);
}
function _asyncToGenerator(n) {
  return function () {
    var t = this,
      e = arguments;
    return new Promise(function (r, o) {
      var a = n.apply(t, e);
      function _next(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
      }
      function _throw(n) {
        asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
      }
      _next(void 0);
    });
  };
}


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
  !*** ./forum.ts ***!
  \******************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WebsocketHelper: () => (/* reexport safe */ _src_common__WEBPACK_IMPORTED_MODULE_2__.WebsocketHelper),
/* harmony export */   extend: () => (/* reexport safe */ _src_common_extend__WEBPACK_IMPORTED_MODULE_0__["default"])
/* harmony export */ });
/* harmony import */ var _src_common_extend__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./src/common/extend */ "./src/common/extend.ts");
/* harmony import */ var _src_forum__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./src/forum */ "./src/forum/index.ts");
/* harmony import */ var _src_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./src/common */ "./src/common/index.ts");



})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=forum.js.map