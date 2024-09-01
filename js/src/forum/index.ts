import app from 'flarum/forum/app';
import WebsocketAccessToken from '../common/model/WebsocketAccessToken';
import { WebsocketHelper } from '../common/helper/WebsocketHelper';
import init from './integration';
import PageState from 'flarum/common/states/PageState';
import { extend } from 'flarum/common/extend';
import ConnectionIndicator from './components/ConnectionIndicator';
import HeaderSecondary from 'flarum/forum/components/HeaderSecondary';
import { initUnreadTip } from './utils/unreadTip';

app.initializers.add('xypp/flarum-websocket-notification', () => {
  WebsocketHelper.getInstance().init(app);
  init();
  setTimeout(() => {
    WebsocketHelper.getInstance().start();
  }, 0);
  extend(HeaderSecondary.prototype, 'items', function (items) {
    items.add('wsn', ConnectionIndicator.component(), 1000);
  });
  initUnreadTip();
});