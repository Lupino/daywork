import async from 'async';

import { Message, Job } from './models';

export class Worker {
  constructor() {
    this.funcs = {};
  }
  addFunction(funcName, callback) {
    this.funcs[funcName] = callback;
  }
  process(funcName, data, done) {
    const func = this.funcs[funcName];
    func(data, done);
  }
}

function addMessage({ userId, message, createdAt }, callback) {
  let msg = new Message({ userId, message, createdAt });
  msg.save((err, msg) => callback(err, msg));
}
function  getJob(jobId, callback) {
  let query = { jobId: jobId, status: { $nin: [ 'Deleted' ] } };
  Job.findOne(query, (err, job) => callback(err, job));
}

let worker = new Worker();

function wrapperCallback(callback) {
  return (payload, done) => {
    payload = payload || {};
    if (payload.createdAt) {
      payload.createdAt = new Date(payload.createdAt);
    }
    callback(payload, done);
  };
}

worker.addFunction('zhaoshizuo.addRecord', wrapperCallback(({ userId, recordId, createdAt }, done) => {
  let message = {
    type: 'addRecord',
    content: { recordId }
  };
  addMessage({ userId, message, createdAt }, done);
}));

worker.addFunction('zhaoshizuo.cancelRecord', wrapperCallback(({ userId, recordId, createdAt }, done) => {
  let message = {
    type: 'cancelRecord',
    content: { recordId }
  };
  addMessage({ userId, message, createdAt }, done);
}));

worker.addFunction('zhaoshizuo.paidRecord', wrapperCallback(({ userId, recordId, createdAt }, done) => {
  let message = {
    type: 'paidRecord',
    content: { recordId }
  };
  addMessage({ userId, message, createdAt }, done);
}));

worker.addFunction('zhaoshizuo.requestJob', wrapperCallback(({ jobId, userId, createdAt }, done) => {
  let message = {
    type: 'requestJob',
    content: { userId, jobId }
  };
  async.waterfall([
    (next) => getJob(jobId, next),
    ({ userId }, next) => addMessage({ userId, message, createdAt }, next)
  ], done);
}));

worker.addFunction('zhaoshizuo.joinJob', wrapperCallback(({ userId, jobId, createdAt }, done) => {
  let message = {
    type: 'joinJob',
    content: { jobId }
  };
  addMessage({ userId, message, createdAt }, done);
}));

export default worker;
