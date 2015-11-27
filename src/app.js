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
import cors from 'cors';
import fs from 'fs';

var MongoStore = mongoStoreLib(session);

export var app = express();

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

app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.use(daywork.auth('/auth'));

expressCommon(app, daywork);

api(app, daywork);

app.get('/*', (req, res) => {
  fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, content) => {
    if (err) {
      res.status(404).send('Cannot GET ' + req.url);
    } else {
      res.header('Content-Type', 'text/html; charset=UTF-8');
      res.send(content);
    }
  });
});
