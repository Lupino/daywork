import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import config from './webpack.config';
import errorHandler from 'errorhandler';

import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import appConfig from './src/config';
import ZhaoShiZuo from './src/lib/zhaoshizuo';
import expressCommon from './src/lib/express_common';
import api from './src/api';
import management from './src/management';
import cors from 'cors';

function setup(app) {
  let zhaoshizuo = new ZhaoShiZuo();

  app.use(bodyParser.urlencoded({
    extended: false
  }));
  app.use(cors());
  app.use(express.static(path.join(__dirname, 'www')));
  app.use(bodyParser.json());
  app.use(methodOverride());

  app.use(zhaoshizuo.auth('/auth'));
  expressCommon(app, zhaoshizuo);
  api(app, zhaoshizuo);
  management(app, zhaoshizuo);
  app.use(errorHandler());
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
