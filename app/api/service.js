import request from './request';
import { getUri, wapperCallback } from './utils';

export function getService({ serviceId }, callback) {
  request.get(getUri(`/api/services/${serviceId}`), wapperCallback(callback));
}

export function getServices({ category, status, userId, page, limit }, callback) {
  let url = getUri('/api/services/', { category, status, userId, page, limit });
  request.get(url, wapperCallback(callback));
}

export function createService({ title, summary, unit, price, status, category,
                              image, city, address }, callback) {
  request.post(getUri('/api/services/create'),
               { title, summary, unit, price, status, category, image, city, address },
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

export function updateService({ serviceId, title, summary, image, status, category, city, address }, callback) {
  request.post(getUri(`/api/services/${serviceId}/update`),
               { title, summary, image, status, category, city, address },
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
