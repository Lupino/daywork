import request from './request';
import { getUri, wapperCallback } from './utils';
import store from '../modules/store';

export function getProfile(callback) {
  request.get(getUri('/api/users/me'), wapperCallback(callback, false));
}

export function getUser({ userId }, callback) {
  if (!userId) {
    const profile = store.get('profile');
    userId = profile.userId;
  }
  request.get(getUri(`/api/users/${userId}`), wapperCallback(callback));
}

export function getUserJobs({ userId, status, page, limit }, callback) {
  if (!userId) {
    const profile = store.get('profile');
    userId = profile.userId;
  }
  request.get(getUri(`/api/users/${userId}/jobs`, {status, limit, page}),
              wapperCallback(callback));
}

export function getUserServices({ userId, status, page, limit }, callback) {
  if (!userId) {
    const profile = store.get('profile');
    userId = profile.userId;
  }
  request.get(getUri(`/api/users/${userId}/services`, {status, limit, page}),
              wapperCallback(callback));
}

export function getUserWorks({ userId, page, limit }, callback) {
  if (!userId) {
    const profile = store.get('profile');
    userId = profile.userId;
  }
  request.get(getUri(`/api/users/${userId}/works`, { limit, page}),
              wapperCallback(callback));
}

export function getUserWork({ userId, jobId }, callback) {
  if (!userId) {
    const profile = store.get('profile');
    userId = profile.userId;
  }
  request.get(getUri(`/api/users/${userId}/works/${jobId}`),
              wapperCallback(callback));
}

export function getUserRecords({ userId, jobId, page, limit, status }, callback) {
  if (!userId) {
    const profile = store.get('profile');
    userId = profile.userId;
  }
  request.get(getUri(`/api/users/${userId}/records`, {jobId, page, limit, status}),
              wapperCallback(callback));
}

export function updateProfile({ ...profile }, callback) {
  request.post(getUri('/api/updateProfile'), { ...profile },
               wapperCallback(callback));
}

export function updateAvatar(file, callback) {
  let req = request.post(getUri('/api/updateAvatar'));
  req.attach('avatar', file, file.name);
  req.end(wapperCallback(callback));
}

export function getFavorites({ userId, from, size }, callback) {
  if (!userId) {
    const profile = store.get('profile');
    userId = profile.userId;
  }
  request.get(getUri(`/api/users/${userId}/favorites`, { from, size }), wapperCallback(callback));
}
