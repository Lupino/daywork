import request from './request';
import { getUri, wapperCallback } from './utils';

export function getService({ serviceId }, callback) {
  request.get(getUri(`/api/services/${serviceId}`), wapperCallback(callback));
}

export function getServices({ status, userId, page, limit }, callback) {
  let url = getUri('/api/services/', { status, userId, page, limit });
  request.get(url, wapperCallback(callback));
}

export function createService({ title, summary, unit, price, status, image }, callback) {
  request.post(getUri('/api/services/create'),
               { title, summary, unit, price, status, image },
               wapperCallback(callback));
}

export function  publishService({ serviceId }, callback) {
  request.post(getUri(`/api/services/${serviceId}/publish`), wapperCallback(callback));
}

export function  finishService({ serviceId }, callback) {
  request.post(getUri(`/api/services/${serviceId}/finish`), wapperCallback(callback));
}

export function deleteService({ serviceId }, callback) {
  request.post(getUri(`/api/services/${serviceId}/delete`),
               wapperCallback(callback));
}

export function updateService({ serviceId, title, summary, status }, callback) {
  request.post(getUri(`/api/services/${serviceId}/update`),
               { title, summary, status },
               wapperCallback(callback));
}

export function favoriteService({ serviceId }, callback) {
  request.post(getUri(`/api/services/${serviceId}/favorite`),
               wapperCallback(callback));
}

export function unfavoriteService({ serviceId }, callback) {
  request.post(getUri(`/api/services/${serviceId}/unfavorite`),
               wapperCallback(callback));
}
