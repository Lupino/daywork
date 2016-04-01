import request from './request';
import { getUri, wapperCallback } from './utils';

export function getUserList ({ page, limit }, callback) {
  request.get(getUri('/api/management/getUsers'), { page, limit }, wapperCallback(callback));
}

export function addUser({ phoneNumber, realName, passwd, avatar }, callback) {
  request.post(getUri('/api/management/addUser'), { phoneNumber, realName, passwd, avatar },
               wapperCallback(callback));
}

export function addJob({ userId, title, summary, payMethod, salary, requiredPeople,
                          status, category, image, city, address }, callback) {
  request.post(getUri('/api/management/addJob'),
               { userId, title, summary, payMethod, salary, requiredPeople, status, category, image, city, address },
               wapperCallback(callback));
}

export function addService({ userId, title, summary, unit, price, status, category,
                              image, city, address }, callback) {
  request.post(getUri('/api/management/addService'),
               { userId, title, summary, unit, price, status, category, image, city, address },
               wapperCallback(callback));
}

export function updateUser({ ...user }, callback) {
  request.post(getUri('/api/management/updateUser'), { ...user },
               wapperCallback(callback));
}

export function updatePassword({ phoneNumber, passwd }, callback) {
  request.post(getUri('/api/management/updatePassword'), { phoneNumber, passwd },
               wapperCallback(callback));
}

export function addCity({ cityId, cityName }, callback) {
  request.post(getUri('/api/management/addCity'), { cityId, cityName },
               wapperCallback(callback));
}

export function updateCity({ cityId, cityName }, callback) {
  request.post(getUri('/api/management/updateCity'), { cityId, cityName },
               wapperCallback(callback));
}

export function addCategory({ categoryId, categoryName, categoryType, icon }, callback) {
  request.post(getUri('/api/management/addCategory'), { categoryId, categoryName, categoryType, icon },
               wapperCallback(callback));
}

export function updateCategory({ categoryId, categoryType, categoryName, icon }, callback) {
  request.post(getUri('/api/management/updateCategory'), { categoryId, categoryName, categoryType, icon },
               wapperCallback(callback));
}
