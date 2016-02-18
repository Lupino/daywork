import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import config from './config';
import Daywork from './lib/daywork';
import expressCommon from './lib/express_common';
import api from './api';
import cors from 'cors';

var app = module.exports = express();

let daywork = new Daywork();

app.set('port', config.port || process.env.PORT || 3000);
app.set('host', config.host || process.env.HOST || '127.0.0.1');
app.use(cors());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(methodOverride());

app.use(express.static(path.join(__dirname, 'public')));

app.use(daywork.auth('/auth'));

expressCommon(app, daywork);

api(app, daywork);
