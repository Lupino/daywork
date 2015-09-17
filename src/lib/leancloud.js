import AV from 'leanengine';
import { appId, appKey, masterKey } from '../config';

AV.initialize(appId, appKey, masterKey);

export function requestSmsCode(phoneNumber, callback) {
  AV.Cloud.requestSmsCode(phoneNumber).then(()=>callback(),
                                            (err) => callback(err));
}

export function verifySmsCode(code, phoneNumber, callback) {
  AV.Cloud.verifySmsCode(code, phoneNumber).then(()=>callback(),
                                                 (err) => callback(err));
}
