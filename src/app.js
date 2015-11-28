import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import mongoStoreLib from 'connect-mongo';
import config from './config';
import Daywork from './lib/daywork';
import expressCommon from './lib/express_common';
import api from './api';

var MongoStore = mongoStoreLib(session);

var app = module.exports = express();

let daywork = new Daywork();

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
