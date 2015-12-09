import request from 'superagent';
import { getUri, wapperCallback } from './utils';

export function upload({ files, token }, callback) {
  let req = request.post(getUri('/api/upload', { access_token: token }));
  files.forEach((file) => req.attach('file', file));
  req.end(wapperCallback(callback));
}
