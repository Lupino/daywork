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

export function createServiceOrder({ serviceId, amount, summary }, callback) {
  const form = {
    amount, summary
  };

  request.post(getUri(`/api/services/${serviceId}/createOrder`), form, wapperCallback(callback));
}

export function getServiceOrder({ orderId }, callback) {
  request.get(getUri(`/api/orders/${orderId}`), wapperCallback(callback));
}

export function getPurchasedOrders({ page, limit }, callback) {
  request.get(getUri(`/api/orders/`, { page, limit }), wapperCallback(callback));
}

export function getSaledOrders({ userId, page, limit }, callback) {
  request.get(getUri(`/api/users/${userId}/orders/`, { page, limit }), wapperCallback(callback));
}

export function payServiceOrder({ orderId }, callback) {
  request.post(getUri(`/api/orders/${orderId}/pay`), wapperCallback(callback));
}

export function cancelServiceOrder({ orderId }, callback) {
  request.post(getUri(`/api/orders/${orderId}/cancel`), wapperCallback(callback));
}

export function finishServiceOrder({ orderId }, callback) {
  request.post(getUri(`/api/orders/${orderId}/finish`), wapperCallback(callback));
}
