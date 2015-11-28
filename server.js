import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import config from './webpack.config';
import errorHandler from 'errorhandler';

import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import mongoStoreLib from 'connect-mongo';
import appConfig from './src/config';
import Daywork from './src/lib/daywork';
import expressCommon from './src/lib/express_common';
import api from './src/api';

function setup(app) {
  let MongoStore = mongoStoreLib(session);
  let daywork = new Daywork();

  app.use(bodyParser.urlencoded({
    extended: false
  }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(cookieParser());
  app.use(session({
    secret: appConfig.cookieSecret,
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
      url: appConfig.mongod
    })
  }));

  app.use(daywork.auth('/auth'));
  expressCommon(app, daywork);
  api(app, daywork);
  app.use(errorhandler());
}

var server = new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true,
  setup: setup,
  contentBase: 'www'
}).listen(3000, 'localhost', () => {
  /*eslint-disable no-console */
  console.log('Express server listening on port 3000');
  /*eslint-enable no-console */
});
