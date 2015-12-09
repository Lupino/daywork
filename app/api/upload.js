import request from './request';
import { getUri, wapperCallback } from './utils';

export function upload({ files }, callback) {
  let req = request.post(getUri('/api/upload'));
  files.forEach((file) => req.attach('file', file));
  req.end(wapperCallback(callback));
}
