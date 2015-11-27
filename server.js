var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');
import http from 'http';
import errorHandler from 'errorhandler';
import { app } from './src/app';
app.use(errorHandler());

http.createServer(app).listen(3001, function() {
  /*eslint-disable no-console */
  console.log('Express server listening on port ' + (app.get('port')));
  /*eslint-enable no-console */
});

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
  proxy: { '*': 'http://localhost:3001' }
}).listen(3000, 'localhost', function (err, result) {
  if (err) {
    console.log(err);
  }

  console.log('Listening at localhost:3000');
});
