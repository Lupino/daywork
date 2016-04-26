import { apiPrefix } from './config';
import { sendJsonResponse } from './lib/util';
import qs from 'querystring';

export default function(app, zhaoshizuo) {
  const { requireAdmin } = zhaoshizuo;

  app.get(apiPrefix + '/management/getUsers', requireAdmin(), (req, res) => {
    let page = Number(req.query.page) || 0;
    let limit = Number(req.query.limit) || 10;
    if (limit > 50) {
      limit = 50;
    }
    let skip = limit * page;

    zhaoshizuo.getUsers({}, { limit: limit, skip: skip },
                     (err, users) => {
                       zhaoshizuo.countUser({}, (_, total) => {
                         sendJsonResponse(res, err, { users, total });
                       });

    });
  });

  app.post(apiPrefix + '/management/addUser', requireAdmin(), (req, res) => {
    let user = req.body;
    user.phoneVerified = false;
    zhaoshizuo.createUser(user, (err, user) => sendJsonResponse(res, err, { user }));
  });

  app.post(apiPrefix + '/management/addJob', requireAdmin(), (req, res) => {
    let job = req.body;
    if (!job.userId) {
      return sendJsonResponse(res, '请选择发布用户');
    }
    if (!job.title) {
      return sendJsonResponse(res, '请填写标题');
    }
    if (!job.salary) {
      return sendJsonResponse(res, '请填写单位工资');
    }
    zhaoshizuo.createJob(job, (err, job) => sendJsonResponse(res, err, { job }));
  });

  app.post(apiPrefix + '/management/addService', requireAdmin(), (req, res) => {
    let service = req.body;
    if (!service.userId) {
      return sendJsonResponse(res, '请选择发布用户');
    }
    if (!service.title) {
      return sendJsonResponse(res, '请填写标题');
    }
    if (!service.price) {
      return sendJsonResponse(res, '请填写服务价格');
    }
    zhaoshizuo.createService(service, (err, service) => sendJsonResponse(res, err, { service }));
  });

  app.post(apiPrefix + '/management/updateUser', requireAdmin(), (req, res) => {
    const body = req.body;
    const userId = body.userId;

    if (!userId) {
      return sendJsonResponse(res, '请选择用户');
    }
    zhaoshizuo.updateUser(userId, body,
                       (err, user) => sendJsonResponse(res, err, { user: user }));
  });

  app.post(apiPrefix + '/management/updatePassword', requireAdmin(), (req, res) => {
    let pwds = req.body;
    const phoneNumber = pwds.phoneNumber;

    if (!phoneNumber) {
      return sendJsonResponse(res, '请选择用户');
    }
    if (!pwds.passwd) {
      return sendJsonResponse(res, '请输入密码');
    }
    zhaoshizuo.changePasswd(pwds,
                       (err, user) => sendJsonResponse(res, err, { user }));
  });

  app.post(apiPrefix + '/management/addCity', requireAdmin(), (req, res) => {
    const city = req.body;
    if (!city.cityId) {
      return sendJsonResponse(res, 'cityId is required');
    }
    if (!city.cityName) {
      return sendJsonResponse(res, 'cityName is required');
    }
    zhaoshizuo.addCity(city, (err, city) => {
      sendJsonResponse(res, err, { city });
    });
  });

  app.post(apiPrefix + '/management/updateCity', requireAdmin(), (req, res) => {
    const city = req.body;
    if (!city.cityId) {
      return sendJsonResponse(res, 'cityId is required');
    }
    if (!city.cityName) {
      return sendJsonResponse(res, 'cityName is required');
    }
    zhaoshizuo.updateCity(city, (err, city) => {
      sendJsonResponse(res, err, { city });
    });
  });

  app.post(apiPrefix + '/management/addCategory', requireAdmin(), (req, res) => {
    const category = req.body;
    if (!category.categoryId) {
      return sendJsonResponse(res, 'categoryId is required');
    }
    if (!category.categoryName) {
      return sendJsonResponse(res, 'categoryName is required');
    }
    if (!category.categoryType) {
      return sendJsonResponse(res, 'categoryType is required');
    }
    zhaoshizuo.addCategory(category, (err, category) => {
      sendJsonResponse(res, err, { category });
    });
  });

  app.post(apiPrefix + '/management/updateCategory', requireAdmin(), (req, res) => {
    const category = req.body;
    if (!category.categoryId) {
      return sendJsonResponse(res, 'categoryId is required');
    }
    if (!category.categoryName) {
      return sendJsonResponse(res, 'categoryName is required');
    }
    zhaoshizuo.updateCategory(category, (err, category) => {
      sendJsonResponse(res, err, { category });
    });
  });
}
