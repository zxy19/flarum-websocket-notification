import app from 'flarum/forum/app';
import WebsocketAccessToken from '../common/model/WebsocketAccessToken';
import { WebsocketHelper } from '../common/helper/WebsocketHelper';
import init from './integration';
import PageState from 'flarum/common/states/PageState';
import { extend } from 'flarum/common/extend';
import ConnectionIndicator from './components/ConnectionIndicator';

app.initializers.add('xypp/flarum-websocket-notification', () => {
  WebsocketHelper.getInstance().init(app);
  init();
  setTimeout(() => {
    WebsocketHelper.getInstance().start();
  }, 1000);

  const ctr = $("<div></div>").addClass("connectionIndicator")
  ctr.appendTo(document.body);
  m.mount(ctr[0], { view: function () { return ConnectionIndicator.component() } });
});

