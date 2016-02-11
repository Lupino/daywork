import AV from 'leanengine';
import { leancloud } from '../config';

const { appId, appKey, masterKey } = leancloud;

AV.initialize(appId, appKey, masterKey);

export function requestSmsCode(phoneNumber, callback) {
  AV.Cloud.requestSmsCode(phoneNumber).then(()=>callback(),
                                            (err) => callback(err));
}

export function verifySmsCode(code, phoneNumber, callback) {
  AV.Cloud.verifySmsCode(code, phoneNumber).then(()=>callback(),
                                                 (err) => callback(err));
}
