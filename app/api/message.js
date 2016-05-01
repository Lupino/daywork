import request from './request';
import { getUri, wapperCallback } from './utils';

export function getMessages({ page, limit }, callback) {
  request.get(getUri('/api/messages', {limit, page}), wapperCallback(callback));
}
