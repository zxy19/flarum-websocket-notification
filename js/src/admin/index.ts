import app from 'flarum/admin/app';
import adminPage from './components/adminPage';


app.initializers.add('xypp/flarum-websocket-notification', () => {
  app.extensionData
    .for("xypp-websocket-notification")
    .registerPage(adminPage);
});
