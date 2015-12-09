import request from './request';
import { getUri, wapperCallback } from './utils';

export function getProfile(callback) {
  request.get(getUri('/api/users/me'), wapperCallback(callback));
}

export function getUser({ userId }, callback) {
  request.get(getUri(`/api/users/${userId}`), wapperCallback(callback));
}

export function getUserJobs({ userId, page, limit }, callback) {
  request.get(getUri(`/api/users/${userId}/jobs`, {limit, page}),
              wapperCallback(callback));
}

export function getUserWorks({ userId, page, limit }, callback) {
  request.get(getUri(`/api/users/${userId}/works`, { limit, page}),
              wapperCallback(callback));
}

export function getUserWork({ userId, jobId }, callback) {
  request.get(getUri(`/api/users/${userId}/works/${jobId}`),
              wapperCallback(callback));
}

export function getUserRecords({ userId, jobId, page, limit, status }, callback) {
  request.get(getUri(`/api/users/${userId}/records`, {jobId, page, limit, status}),
              wapperCallback(callback));
}

export function updateProfile({ ...profile }, callback) {
  request.post(getUri('/api/updateProfile'), { ...profile },
               wapperCallback(callback));
}

export function updateAvatar({ file }, callback) {
  let req = request.post(getUri('/api/updateAvatar'));
  req.attach('avatar', file);
  req.end(wapperCallback(callback));
}
