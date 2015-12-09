import request from './request';
import { getUri, wapperCallback } from './utils';

export function sendSmsCode(phoneNumber, callback) {
  request.post(getUri('/api/sendSmsCode'), { phoneNumber }, wapperCallback(callback));
}
