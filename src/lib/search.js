import request from 'request';
import { searchRoot } from '../config';

function wapperCallback(callback) {
  return (err, rsp, body) => {
    if (err) {
      return callback(err);
    }

    try {
      const rsp = JSON.parse(body);
      if (rsp.err) {
        callback(rsp.msg || rsp.err);
      } else {
        callback(null, rsp);
      }
    } catch(e) {
      callback(e);
    }
  }
}

export default class Search extends Object {
  index(doc, callback) {
    request.post(searchRoot + '/api/docs/', { form: doc }, wapperCallback(callback));
  }
  delete(docId, callback) {
    request.del(searchRoot + '/api/docs/' + docId, wapperCallback(callback));
  }
  get(docId, callback) {
    request.get(searchRoot + '/api/docs/' + docId, wapperCallback(callback));
  }
  search({q, from, size}, callback) {
    request.get(`${searchRoot}/api/search/?q=${q}&from=${from}&size=${size}`,
                wapperCallback(callback));
  }
}
