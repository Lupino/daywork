import request from 'superagent';
import { getUri, wapperCallback } from './utils';

export function getProfile(token, callback) {
  if (typeof token === 'function') {
    callback = token;
    token = '';
  }
  request.get(getUri('/api/users/me', {access_token: token}),
              wapperCallback(callback));
}

export function getUser({ userId, token }, callback) {
  if (typeof token === 'function') {
    callback = token;
    token = '';
  }
  request.get(getUri(`/api/users/${userId}`, {access_token: token}),
              wapperCallback(callback));
}

export function getUserJobs({ userId, page, limit, token }, callback) {
  request.get(getUri(`/api/users/${userId}/jobs`, {access_token: token, limit, page}),
              wapperCallback(callback));
}

export function getUserWorks({ userId, page, limit, token }, callback) {
  request.get(getUri(`/api/users/${userId}/works`, {access_token: token, limit, page}),
              wapperCallback(callback));
}

export function getUserWork({ userId, jobId, token }, callback) {
  request.get(getUri(`/api/users/${userId}/works/${jobId}`, {access_token: token}),
              wapperCallback(callback));
}

export function getUserRecords({ userId, jobId, token, page, limit, status }, callback) {
  request.get(getUri(`/api/users/${userId}/records`,
                     {access_token: token, jobId, page, limit, status}),
              wapperCallback(callback));
}

export function updateProfile({ token, ...profile }, callback) {
  request.post(getUri('/api/updateProfile'), { access_token: token, ...profile },
               wapperCallback(callback));
}

export function updateAvatar({ file, token }, callback) {
  let req = request.post(getUri('/api/updateAvatar', { access_token: token }));
  req.attach('avatar', file);
  req.end(wapperCallback(callback));
}
