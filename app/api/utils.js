import qs from 'querystring';
import { appRoot } from './config';

export function getUri(path, query) {
  if (query) {
    path = `${path}?${qs.stringify(query)}`;
  }
  path = `${appRoot}${path}`;
  return path;
}

export function wapperCallback(callback, redirect) {
  if (redirect === undefined) {
    redirect = true;
  }
  return function(err, res) {
    if (err) return callback(err);
    if (!res.ok) {
      return callback('请求失败！');
    }
    if (res && res.body) {
      const rsp = res.body;
      if (rsp.err) {
        const msg = rsp.msg || rsp.err;
        if (msg === 'Unauthorized' && redirect) {
          window.location.href=`/signin?next=${window.location.pathname}`
        }
        return callback(msg);
      }
      return callback(null, rsp);
    }
    if (res && res.text) {
      return callback(null, res.text)
    }
    callback();
  }
}
