import app from 'flarum/forum/app';
import WebsocketAccessToken from '../common/model/WebsocketAccessToken';
import { WebsocketHelper } from '../common/helper/WebsocketHelper';
import init from './integration';

app.initializers.add('xypp/flarum-websocket-notification', () => {
  WebsocketHelper.getInstance().init(app);
  init();
  setTimeout(() => {
    WebsocketHelper.getInstance().start();
  }, 1000);
});

