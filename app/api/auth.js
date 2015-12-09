import request from './request';
import { getUri, wapperCallback } from './utils';

export function signin ({ userName, passwd, type }, callback) {
  request.post(getUri('/auth'), { type, userName, passwd },
               wapperCallback(callback));
}

export function signinForToken({ userName, passwd }, callback) {
  signin({ userName, passwd, type: 'access_token' }, callback);
}

export function signup({ phoneNumber, smsCode, realName, passwd }, callback) {
  request.post(getUri('/api/signup'), { phoneNumber, smsCode, realName, passwd },
               wapperCallback(callback));
}

export function resetPassword({ phoneNumber, smsCode, passwd }, callback) {
  request.post(getUri('/api/resetPasswd'), { phoneNumber, smsCode, passwd },
               wapperCallback(callback));
}

export function logOut(callback) {
  request.post(getUri('/api/logOut'), wapperCallback(callback));
}
