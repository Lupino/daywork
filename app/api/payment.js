import request from './request';
import { getUri, wapperCallback } from './utils';

export function createPayment({subject, body, amount, channel}, callback) {
  request.post(getUri('/api/createPayment'), { subject, body, amount, channel },
               wapperCallback(callback));
}

export function getPayment(order_no, callback) {
  request.get(getUri('/api/payments/' + order_no), wapperCallback(callback));
}

export function checkPayment(order_no, callback) {
  request.post(getUri('/api/payments/' + order_no + '/check'),
               wapperCallback(callback));
}

export function getPayments({ page, limit }, callback) {
  let url = getUri('/api/payments/', { page, limit });
  request.get(url, wapperCallback(callback));
}

export function drawMoney({subject, body, amount, channel, smsCode, raw}, callback) {
  request.post(getUri('/api/drawMoney'), { subject, body, amount, channel, smsCode, raw },
               wapperCallback(callback));
}

export function cancelPayment(order_no, callback) {
  request.delete(getUri('/api/payments/' + order_no),
               wapperCallback(callback));
}
