import gearmanode from 'gearmanode';
import { cleanObj } from './util';
import { gearmanHost } from '../config';

let client = gearmanode.client(gearmanHost);

export function submitJob(funcName, data) {
  data.createdAt = new Date();
  data = cleanObj(data);
  data = JSON.stringify(data);
  client.submitJob(funcName, data, { background: true });
}

export function wrapperAddRecordCallback(callback) {
  return (err, record) => {
    if (!err) {
      let { recordId, userId } = record;
      submitJob('daywork.addRecord', { recordId, userId });
    }
    callback(err, record);
  };
}

export function wrapperCancelRecordCallback(callback) {
  return (err, record) => {
    if (!err) {
      let { recordId, userId } = record;
      submitJob('daywork.cancelRecord', { recordId, userId });
    }
    callback(err, record);
  };
}

export function wrapperPaidRecordCallback(callback) {
  return (err, result) => {
    if (!err) {
      let { paidRecord } = result;
      let { recordId, userId } = paidRecord;
      submitJob('daywork.paidRecord', { recordId, userId });
    }
    callback(err, result);
  };
}

export function wrapperRequestJobCallback(callback) {
  return (err, myJob) => {
    if (!err) {
      let { userId, jobId } = myJob;
      submitJob('daywork.requestJob', { userId, jobId });
    }
    callback(err, myJob);
  };
}

export function wrapperJoinJobCallback(callback) {
  return (err, myJob) => {
    if (!err) {
      let { userId, jobId } = myJob;
      submitJob('daywork.joinJob', { userId, jobId });
    }
    callback(err, myJob);
  };
}
