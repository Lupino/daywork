import _ from 'lodash';

export function omit(data) {
  return _.omit(data, ['__v', '_id', 'passwd']);
}

function cleanPlainObject(obj) {
  obj = omit(obj);
  return _.mapValues(obj, (subObj) => cleanObj(subObj));
}

function cleanArray(obj) {
  return _.map(obj, (subObj) => cleanObj(subObj));
}

export function cleanObj(obj) {
  if (obj.toJSON) {
    obj = obj.toJSON();
  }
  if (_.isPlainObject(obj)) {
    return cleanPlainObject(obj);
  }
  if (_.isArray(obj)) {
    return cleanArray(obj);
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
