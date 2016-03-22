import qs from 'querystring';
import { appRoot } from './config';

export function getUri(path, query) {
  if (query) {
    path = `${path}?${qs.stringify(query)}`;
  }
  path = `${appRoot}${path}`;
  return path;
}

export function wapperCallback(callback) {
  if (!callback)  callback = function() {};
  return function(err, res) {
    if (err) return callback(err);
    if (!res.ok) {
      return callback('请求失败！');
    }
    if (res && res.body) {
      let rsp = res.body;
      if (rsp.err) {
        return callback(rsp.msg || rsp.err);
      }
      return callback(null, rsp);
    }
    if (res && res.text) {
      return callback(null, res.text)
    }
    callback();
  }
}
