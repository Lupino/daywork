import express from 'express';
import http from 'http';
import path from 'path';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import errorHandler from 'errorhandler';
import mongoStoreLib from 'connect-mongo';
import config from './config';
import Daywork from './lib/daywork';
import expressCommon from './lib/express_common';
import api from './api';

var MongoStore = mongoStoreLib(session);

var app = express();

let daywork = new Daywork(config);

app.set('port', config.port || process.env.PORT || 3000);
app.set('host', config.host || process.env.HOST || '127.0.0.1');

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
  secret: config.cookieSecret,
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({
    url: config.mongod
  })
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(daywork.auth('/auth'));

expressCommon(app, daywork);

api(app, daywork);

app.get('/', (req, res) => {
  res.send('Daywork.');
});

if ('development' === app.get('env')) {
  app.use(errorHandler());
}

http.createServer(app).listen(app.get('port'), function() {
  /*eslint-disable no-console */
  console.log('Express server listening on port ' + (app.get('port')));
  /*eslint-enable no-console */
});
