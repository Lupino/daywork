import request from './request';
import { getUri, wapperCallback } from './utils';

export function getCategories({ type }, callback) {
  request.get(getUri(`/api/categories/`, { type }), wapperCallback(callback));
}
