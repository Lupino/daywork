import _ from 'lodash';

export function omit(data) {
  if (data.toJSON) {
    data = data.toJSON();
  }
  return _.omit(data, ['__v', '_id', 'passwd']);
}

export function cleanObj(obj) {
  obj = omit(obj);
  if (obj.file) {
    obj.file = omit(obj.file);
  }
  if (obj.user) {
    obj.user = cleanObj(obj.user);
  }
  if (obj.avatar) {
    obj.avatar = cleanObj(obj.avatar);
  }
  if (obj.job) {
    obj.job = cleanObj(obj.job);
  }
  if (obj.record) {
    obj.record = cleanObj(obj.record);
  }
  if (obj.jobs) {
    obj.jobs = _.map(obj.jobs, (obj) => cleanObj(obj));
  }
  if (obj.workers) {
    obj.workers = _.map(obj.workers, (obj) => cleanObj(obj));
  }
  if (obj.works) {
    obj.works = _.map(obj.works, (obj) => cleanObj(obj));
  }
  return obj;
}

export function sendJsonResponse(res, statusCode, err, data) {
  if (typeof statusCode !== 'number') {
    data = err;
    err = statusCode;
    statusCode = 401;
  }
  if (err) {
    return res.json({ err: statusCode, msg: err });
  } else {
    if (!data) {
      data = {};
    }
    return res.json(cleanObj(data));
  }
}
