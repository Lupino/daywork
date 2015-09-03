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

var MongoStore = mongoStoreLib(session);

var app = express();

app.set('port', config.port || process.env.PORT || 3000);
app.set('host', config.host || process.env.HOST || '127.0.0.1');

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
  secret: config.cookie_secret,
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({
    url: config.mongod
  })
}));

app.use(express.static(path.join(__dirname, 'public')));

if ('development' === app.get('env')) {
  app.use(errorHandler());
}

http.createServer(app).listen(app.get('port'), function() {
  /*eslint-disable no-console */
  console.log('Express server listening on port ' + (app.get('port')));
  /*eslint-enable no-console */
});
