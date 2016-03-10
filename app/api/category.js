import request from './request';
import { getUri, wapperCallback } from './utils';

export function getCategories(callback) {
  request.get(getUri(`/api/categories/`), wapperCallback(callback));
}
