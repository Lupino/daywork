import request from 'superagent';
import { getUri, wapperCallback } from './utils';

export function getMessages({ page, limit, token }, callback) {
  request.get(getUri(`/api/messages`, {access_token: token, limit, page}), wapperCallback(callback));
}
