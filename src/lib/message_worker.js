import Daywork from './daywork';
import async from 'async';

let daywork = new Daywork();

class Worker {
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

const worker = new Worker();

function wrapperCallback(callback) {
  return (payload, done) => {
    let payload = {};
    if (payload.createdAt) {
      payload.createdAt = new Date(payload.createdAt);
    }
    callback(payload, done);
  };
}

worker.addFunction('daywork.addRecord', wrapperCallback(({ userId, recordId, createdAt }, done) => {
  let message = {
    type: 'addRecord',
    content: { recordId }
  };
  daywork.addMessage({ userId, message, createdAt }, done);
}));

worker.addFunction('daywork.cancelRecord', wrapperCallback(({ userId, recordId, createdAt }, done) => {
  let message = {
    type: 'cancelRecord',
    content: { recordId }
  };
  daywork.addMessage({ userId, message, createdAt }, done);
}));

worker.addFunction('daywork.paidRecord', wrapperCallback(({ userId, recordId, createdAt }, done) => {
  let message = {
    type: 'paidRecord',
    content: { recordId }
  };
  daywork.addMessage({ userId, message, createdAt }, done());
}));

worker.addFunction('daywork.requestJob', wrapperCallback(({ jobId, userId, createdAt }, done) => {
  let message = {
    type: 'requestJob',
    content: { userId, jobId }
  };
  async.waterfall([
    (next) => daywork.getJob(jobId, next),
    ({ userId }, next) => daywork.addMessage({ userId, message, createdAt }, next)
  ], done);
}));

worker.addFunction('daywork.joinJob', wrapperCallback(({ userId, jobId, createdAt }, done) => {
  let message = {
    type: 'joinJob',
    content: { jobId }
  };
  daywork.addMessage({ userId, message, createdAt }, done);
}));

export default worker;
