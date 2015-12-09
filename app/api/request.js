import _request from 'superagent';
import methods from 'methods';
import store from '../modules/store';

function request(method, url) {
  let req = _request(method, url);
  const token = store.get('token');
  if (token && token.accessToken) {
    req.set('Authorization', `Bearer ${token.accessToken}`);
  }

  return req;
}

// generate HTTP verb methods
methods.indexOf('del') == -1 && methods.push('del');
methods.forEach(function(method){
  var name = method;
  method = 'del' == method ? 'delete' : method;

  method = method.toUpperCase();
  request[name] = function(url, data, fn){
    var req = request(method, url);
    if ('function' == typeof data) fn = data, data = null;
    if (data) req.send(data);
    fn && req.end(fn);
    return req;
  };
});

export default request;
