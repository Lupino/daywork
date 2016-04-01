import request from './request';
import { getUri, wapperCallback } from './utils';

export function getCities(callback) {
  request.get(getUri(`/api/cities/`), wapperCallback(callback));
}
