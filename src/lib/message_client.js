import { cleanObj } from './util';
import worker from './message_worker';

export function submitJob(funcName, data, done) {
  data.createdAt = new Date();
  data = cleanObj(data);
  worker.process(funcName, data, done);
}

export function wrapperAddRecordCallback(callback) {
  return (err, record) => {
    var cb = () => {
      callback(err, record);
    };
    if (!err) {
      let { recordId, userId } = record;
      submitJob('zhaoshizuo.addRecord', { recordId, userId }, cb);
      return;
    }
    cb();
  };
}

export function wrapperCancelRecordCallback(callback) {
  return (err, record) => {
    var cb = () => {
      callback(err, record);
    };
    if (!err) {
      let { recordId, userId } = record;
      submitJob('zhaoshizuo.cancelRecord', { recordId, userId }, cb);
      return;
    }
    cb();
  };
}

export function wrapperPaidRecordCallback(callback) {
  return (err, result) => {
    var cb = () => {
      callback(err, result);
    };
    if (!err) {
      let { paidRecord } = result;
      let { recordId, userId } = paidRecord;
      submitJob('zhaoshizuo.paidRecord', { recordId, userId }, cb);
      return;
    }
    cb();
  };
}

export function wrapperRequestJobCallback(callback) {
  return (err, myJob) => {
    var cb = () => {
      callback(err, myJob);
    };
    if (!err) {
      let { userId, jobId } = myJob;
      submitJob('zhaoshizuo.requestJob', { userId, jobId }, cb);
      return;
    }
    cb();
  };
}

export function wrapperJoinJobCallback(callback) {
  return (err, myJob) => {
    var cb = () => {
      callback(err, myJob);
    };
    if (!err) {
      let { userId, jobId } = myJob;
      submitJob('zhaoshizuo.joinJob', { userId, jobId }, cb);
      return;
    }
    cb();
  };
}
