import request from './request';
import { getUri, wapperCallback } from './utils';

export function requestJob({ jobId }, callback) {
  request.post(getUri(`/api/requestJob`), {jobId}, wapperCallback(callback));
}

export function getJob({ jobId }, callback) {
  request.get(getUri(`/api/jobs/${jobId}`), wapperCallback(callback));
}

export function getJobWorker({ jobId, userId }, callback) {
  let url = getUri(`/api/jobs/${jobId}/workers/${userId}`);
  request.get(url, wapperCallback(callback));
}

export function getJobWorkers({ jobId, status, page, limit }, callback) {
  let url = getUri(`/api/jobs/${jobId}/workers`, {status, page, limit});
  request.get(url, wapperCallback(callback));
}

export function getJobs({ category, status, userId, page, limit }, callback) {
  let url = getUri('/api/jobs/', { category, status, userId, page, limit });
  request.get(url, wapperCallback(callback));
}

export function getJobRecords({jobId, userId, status, page, limit}, callback) {
  let url = getUri(`/api/jobs/${jobId}/records`, {userId, page, limit, status});
  request.get(url, wapperCallback(callback));
}

export function getJobPayment({ jobId, userId}, callback) {
  let url = getUri(`/api/jobs/${jobId}/payment/${userId}`);
  request.get(url, wapperCallback(callback));
}

export function createJob({ title, summary, payMethod, salary, requiredPeople, status, category, image }, callback) {
  request.post(getUri('/api/jobs/create'),
               { title, summary, payMethod, salary, requiredPeople, status, category, image },
               wapperCallback(callback));
}

export function  publishJob({ jobId }, callback) {
  request.post(getUri(`/api/jobs/${jobId}/publish`), wapperCallback(callback));
}

export function  finishJob({ jobId }, callback) {
  request.post(getUri(`/api/jobs/${jobId}/finish`), wapperCallback(callback));
}

export function deleteJob({ jobId }, callback) {
  request.post(getUri(`/api/jobs/${jobId}/delete`),
               wapperCallback(callback));
}

export function updateJob({ jobId, title, summary, status }, callback) {
  request.post(getUri(`/api/jobs/${jobId}/update`),
               { title, summary, status },
               wapperCallback(callback));
}

export function assignWorker({ jobId, userId }, callback) {
  request.post(getUri(`/api/jobs/${jobId}/assignWorker`),
               { userId },
               wapperCallback(callback));
}

export function workerLeave({ jobId, userId }, callback) {
  request.post(getUri(`/api/jobs/${jobId}/workerLeave`),
               { userId },
               wapperCallback(callback));
}

export function favorite({ jobId }, callback) {
  request.post(getUri(`/api/jobs/${jobId}/favorite`),
               wapperCallback(callback));
}

export function unfavorite({ jobId }, callback) {
  request.post(getUri(`/api/jobs/${jobId}/unfavorite`),
               wapperCallback(callback));
}

export function addRecord({ jobId, userId, recordNumber }, callback) {
  request.post(getUri(`/api/jobs/${jobId}/addRecord`),
               { userId, recordNumber },
               wapperCallback(callback));
}

export function cancelRecord({ jobId, recordId }, callback) {
  request.post(getUri(`/api/jobs/${jobId}/cancelRecord`), { recordId },
               wapperCallback(callback));
}

export function payOffline({ jobId, id, money }, callback) {
    request.post(getUri(`/api/jobs/${jobId}/payOffline`),
                 { id, money },
                 wapperCallback(callback));
}
