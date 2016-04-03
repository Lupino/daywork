import request from './request';
import { getUri, wapperCallback } from './utils';

export function search({ q, from, size }, callback) {
  request.get(getUri('/api/search/', { q, from, size }), wapperCallback(callback));
}
