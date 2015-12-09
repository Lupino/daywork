import request from 'superagent';
import { getUri, wapperCallback } from './utils';

export function requestJob({ jobId, token }, callback) {
  request.post(getUri(`/api/requestJob`), {jobId, access_token: token},
               wapperCallback(callback));
}

export function getJob({ jobId, token }, callback) {
  request.get(getUri(`/api/jobs/${jobId}`, {access_token: token}),
              wapperCallback(callback));
}

export function getJobWorkers({ jobId, token, status, page, limit }, callback) {
  let url = getUri(`/api/jobs/${jobId}/workers`,
                   {access_token: token, status, page, limit});
  request.get(url, wapperCallback(callback));
}

export function getJobs({ status, userId, page, limit, token }, callback) {
  let url = getUri('/api/jobs/', { access_token: token, status, userId, page, limit });
  request.get(url, wapperCallback(callback));
}

export function getJobRecords({jobId, userId, status, page, limit, token}) {
  let url = getUri(`/api/jobs/${jobId}/records`,
                   {access_token: token, userId, page, limit, status});
  request.get(url, wapperCallback(callback));
}

export function getJobPayment({ jobId, userId, token}, callback) {
  let url = getUri(`/api/jobs/${jobId}/payment/${userId}`, {access_token: token});
  request.get(url, wapperCallback(callback));
}

export function createJob({ title, summary, payMethod, requiredPeople, status, token }, callback) {
  request.post(getUri('/api/jobs/create'),
               { title, summary, payMethod, requiredPeople, status, access_token: token },
               wapperCallback(callback));
}

export function  publishJob({ jobId, token }, callback) {
  request.post(getUri(`/api/jobs/${jobId}/publish`), {access_token: token},
               wapperCallback(callback));
}

export function  finishJob({ jobId, token }, callback) {
  request.post(getUri(`/api/jobs/${jobId}/finish`), {access_token: token},
               wapperCallback(callback));
}

export function deleteJob({ jobId, token }, callback) {
  request.post(getUri(`/api/jobs/${jobId}/delete`), {access_token: token},
               wapperCallback(callback));
}

export function updateJob({ jobId, title, summary, status, token }, callback) {
  request.post(getUri(`/api/jobs/${jobId}/update`),
               { access_token: token, title, summary, status },
               wapperCallback(callback));
}

export function assignWorker({ jobId, userId, token }, callback) {
  request.post(getUri(`/api/jobs/${jobId}/assignWorker`),
               { access_token: token, userId },
               wapperCallback(callback));
}

export function workerLeave({ jobId, userId, token }, callback) {
  request.post(getUri(`/api/jobs/${jobId}/workerLeave`),
               { access_token: token, userId },
               wapperCallback(callback));
}

export function favorite({ jobId, token }, callback) {
  request.post(getUri(`/api/jobs/${jobId}/favorite`),
               { access_token: token, userId },
               wapperCallback(callback));
}

export function unfavorite({ jobId, token }, callback) {
  request.post(getUri(`/api/jobs/${jobId}/unfavorite`),
               { access_token: token, userId },
               wapperCallback(callback));
}

export function addRecord({ jobId, userId, recordNumber }, callback) {
  request.post(getUri(`/api/jobs/${jobId}/addRecord`),
               { access_token: token, userId, recordNumber },
               wapperCallback(callback));
}

export function cancelRecord({ jobId, recordId }, callback) {
  request.post(getUri(`/api/jobs/${jobId}/cancelRecord`),
               { access_token: token, recordId },
               wapperCallback(callback));
}

export function payOffline({ jobId, id, money, token }, callback) {
    request.post(getUri(`/api/jobs/${jobId}/payOffline`),
                 { access_token: token, id, money },
                 wapperCallback(callback));
}
