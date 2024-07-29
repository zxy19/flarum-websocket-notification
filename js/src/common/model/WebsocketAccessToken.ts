import Model from 'flarum/common/Model';

export default class WebsocketAccessToken extends Model {
  token = Model.attribute<string>('token');
  url = Model.attribute<string>('url', (url?: any) => url && url.replace("0.0.0.0", location.hostname));
}