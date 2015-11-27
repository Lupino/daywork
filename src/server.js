import http from 'http';
import errorHandler from 'errorhandler';
import { app } from './app';

if ('development' === app.get('env')) {
  app.use(errorHandler());
}

http.createServer(app).listen(app.get('port'), function() {
  /*eslint-disable no-console */
  console.log('Express server listening on port ' + (app.get('port')));
  /*eslint-enable no-console */
});
