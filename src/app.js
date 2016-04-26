import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import { port, host } from './config';
import ZhaoShiZuo from './lib/zhaoshizuo';
import expressCommon from './lib/express_common';
import api from './api';
import management from './management';
import cors from 'cors';

var app = module.exports = express();

let zhaoshizuo = new ZhaoShiZuo();

app.set('port', port || process.env.PORT || 3000);
app.set('host', host || process.env.HOST || '127.0.0.1');
app.use(cors());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(methodOverride());

app.use(express.static(path.join(__dirname, 'public')));

app.use(zhaoshizuo.auth('/auth'));

expressCommon(app, zhaoshizuo);

api(app, zhaoshizuo);
management(app, zhaoshizuo);
