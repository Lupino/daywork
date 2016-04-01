import request from './request';
import { getUri, wapperCallback } from './utils';

export function getCategories(type, callback) {
  request.get(getUri(`/api/categories/${type}`), wapperCallback(callback));
}

export function getCategory({ categoryType, categoryId }, callback) {
  request.get(getUri(`/api/categories/${categoryType}/${categoryId}`),
              wapperCallback(callback));
}
