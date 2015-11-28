import path from 'path';
import http from 'http';
import errorHandler from 'errorhandler';
import app from './app';

if ('development' === app.get('env')) {
  app.use(errorHandler());
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

http.createServer(app).listen(app.get('port'), function() {
  /*eslint-disable no-console */
  console.log('Express server listening on port ' + (app.get('port')));
  /*eslint-enable no-console */
});
