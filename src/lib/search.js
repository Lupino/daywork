import request from 'request';
import { searchRoot } from '../config';
import qs from 'querystring';

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

export default class Search {
  index(doc, callback) {
    request.post(searchRoot + '/api/docs/', { form: doc }, wapperCallback(callback));
  }
  indexJob({ jobId, title, summary, city, address, salary, payMethod, status,
           category, createdAt }, callback) {
    const doc = {
      id: 'job-' + jobId, title, summary, city, address, price: salary, unit: payMethod,
      status, category, spec: 'job', createdAt: createdAt.toISOString()
    };
    this.index(doc, callback);
  }
  indexService({ serviceId, title, summary, city, address, price, unit, status,
               category, createdAt }, callback) {
    const doc = {
      id: 'service-' + serviceId, title, summary, city, address, price, unit, status,
      category, spec: 'service', createdAt: createdAt.toISOString()
    };
    this.index(doc, callback);
  }
  delete(docId, callback) {
    request.del(searchRoot + '/api/docs/' + docId, wapperCallback(callback));
  }
  get(docId, callback) {
    request.get(searchRoot + '/api/docs/' + docId, wapperCallback(callback));
  }
  search({q, from, size}, callback) {
    request.get(`${searchRoot}/api/search/?${qs.stringify({q, from, size})}`,
                wapperCallback(callback));
  }
}

const realSearch = new Search();

export function wapperIndexJobCallback(callback) {
  return (err, job) => {
    if (err) {
      return callback(err);
    }
    realSearch.indexJob(job, (e) => {
      console.error(e);
      callback(err, job);
    });
  };
}

export function wapperIndexServiceCallback(callback) {
  return (err, service) => {
    if (err) {
      return callback(err);
    }
    realSearch.indexService(service, (e) => {
      console.error(e);
      callback(err, service);
    });
  };
}

export function search({ q, from, size }, callback) {
  realSearch.search({ q, from, size }, callback);
}
