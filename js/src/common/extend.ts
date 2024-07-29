import Extend from 'flarum/common/extenders';
import WebsocketAccessToken from './model/WebsocketAccessToken';
export default [
    new Extend.Store()
        .add('websocket-access-token', WebsocketAccessToken)
];