import gearmanode from 'gearmanode';
import Daywork from './daywork';
import async from 'async';
import { gearmanHost } from '../config';

let daywork = new Daywork();

let worker = gearmanode.worker(gearmanHost);

function wrapperCallback(callback) {
  return (job) => {
    let payload = {};
    try {
      payload = JSON.parse(job.payload);
    } catch (e) {
      console.log('parse json fail:', e);
    }
    if (payload.createdAt) {
      payload.createdAt = new Date(payload.createdAt);
    }
    payload.job = job;
    callback(payload);
  };
}

function report(job) {
  return (err) => {
    if (err) {
      job.reportError();
    } else {
      job.workComplete('ok');
    }
  };
}

worker.addFunction('daywork.addRecord', wrapperCallback(({ userId, recordId, createdAt, job }) => {
  let message = {
    type: 'addRecord',
    content: { recordId }
  };
  daywork.addMessage({ userId, message, createdAt }, report(job));
}));

worker.addFunction('daywork.cancelRecord', wrapperCallback(({ userId, recordId, createdAt, job }) => {
  let message = {
    type: 'cancelRecord',
    content: { recordId }
  };
  daywork.addMessage({ userId, message, createdAt }, report(job));
}));

worker.addFunction('daywork.paidRecord', wrapperCallback(({ userId, recordId, createdAt, job }) => {
  let message = {
    type: 'paidRecord',
    content: { recordId }
  };
  daywork.addMessage({ userId, message, createdAt }, report(job));
}));

worker.addFunction('daywork.requestJob', wrapperCallback(({ jobId, userId, createdAt, job }) => {
  let message = {
    type: 'requestJob',
    content: { userId, jobId }
  };
  async.waterfall([
    (next) => daywork.getJob(jobId, next),
    ({ userId }, next) => daywork.addMessage({ userId, message, createdAt }, next)
  ], report(job));
}));

worker.addFunction('daywork.joinJob', wrapperCallback(({ userId, jobId, createdAt, job }) => {
  let message = {
    type: 'joinJob',
    content: { jobId }
  };
  daywork.addMessage({ userId, message, createdAt }, report(job));
}));
