(()=>{var t={n:n=>{var e=n&&n.__esModule?()=>n.default:()=>n;return t.d(e,{a:e}),e},d:(n,e)=>{for(var o in e)t.o(e,o)&&!t.o(n,o)&&Object.defineProperty(n,o,{enumerable:!0,get:e[o]})},o:(t,n)=>Object.prototype.hasOwnProperty.call(t,n),r:t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},n={};(()=>{"use strict";t.r(n),t.d(n,{extend:()=>l});const e=flarum.core.compat["common/extenders"];var o=t.n(e);function i(t,n){return i=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,n){return t.__proto__=n,t},i(t,n)}function r(t,n){t.prototype=Object.create(n.prototype),t.prototype.constructor=t,i(t,n)}const a=flarum.core.compat["common/Model"];var s=t.n(a),c=function(t){function n(){for(var n,e=arguments.length,o=new Array(e),i=0;i<e;i++)o[i]=arguments[i];return(n=t.call.apply(t,[this].concat(o))||this).token=s().attribute("token"),n.url=s().attribute("url",(function(t){return t&&t.replace("0.0.0.0",location.hostname)})),n}return r(n,t),n}(s());const l=[(new(o().Store)).add("websocket-access-token",c)],p=flarum.core.compat["admin/app"];var u=t.n(p);const d=flarum.core.compat["admin/components/ExtensionPage"];function f(t){return u().translator.trans("xypp-websocket-notification.admin."+t)}var g=function(t){function n(){for(var n,e=arguments.length,o=new Array(e),i=0;i<e;i++)o[i]=arguments[i];return(n=t.call.apply(t,[this].concat(o))||this).WS_KEYS=["port","address","cert","pk","self-signed"],n.WS_TYPES=["websocket","internal"],n.WS_FUNCTIONS=["discussion","post","notification"],n}r(n,t);var e=n.prototype;return e.oncreate=function(n){t.prototype.oncreate.call(this,n)},e.content=function(t){var n=this;return m("div",{className:"xypp-wsn-adminPage-container"},m("div",{className:"xypp-wsn-adminPage-group"},m("h2",null,f("settings.common.title")),m("div",null,f("settings.common.desc")),this.buildSettingComponent({type:"text",setting:"xypp.ws_notification.common.public_address",label:f("settings.common.public_address")}),this.buildSettingComponent({type:"text",setting:"xypp.ws_notification.common.internal_address",label:f("settings.common.internal_address")})),m("div",{className:"xypp-wsn-adminPage-group"},m("h2",null,f("settings.function.title")),m("div",null,f("settings.function.desc")),this.WS_FUNCTIONS.map((function(t){return n.buildSettingComponent({type:"boolean",setting:"xypp.ws_notification.function."+t,label:f("settings.function."+t)})}))),this.WS_TYPES.map((function(t){return m("div",{className:"xypp-wsn-adminPage-group"},m("h2",null,f("settings."+t+".title")),m("div",null,f("settings."+t+".desc")),n.WS_KEYS.map((function(e){return n.buildSettingComponent({type:"self-signed"===e?"boolean":"text",setting:"xypp.ws_notification."+t+"."+e,label:f("settings."+t+"."+e)})})))})),this.submitButton())},n}(t.n(d)());u().initializers.add("xypp/flarum-websocket-notification",(function(){u().extensionData.for("xypp-websocket-notification").registerPage(g)}))})(),module.exports=n})();
//# sourceMappingURL=admin.js.map