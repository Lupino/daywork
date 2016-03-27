import { apiPrefix } from './config';
import { sendJsonResponse } from './lib/util';
import qs from 'querystring';

export default function(app, daywork) {
  const { requireAdmin } = daywork;

  app.get(apiPrefix + '/management/getUsers', requireAdmin(), (req, res) => {
    let page = Number(req.query.page) || 0;
    let limit = Number(req.query.limit) || 10;
    if (limit > 50) {
      limit = 50;
    }
    let skip = limit * page;

    daywork.getUsers({}, { limit: limit, skip: skip },
                     (err, users) => {
                       daywork.countUser({}, (err, total) => {
                         sendJsonResponse(res, err, { users, total });
                       });

    });
  });

  app.post(apiPrefix + '/management/addUser', requireAdmin(), (req, res) => {
    let user = req.body;
    user.phoneVerified = false;
    daywork.createUser(user, (err, user) => sendJsonResponse(res, err, { user }));
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
    daywork.createJob(job, (err, job) => sendJsonResponse(res, err, { job }));
  });

  app.post(apiPrefix + '/management/addService', requireAdmin(), (req, res) => {
    let service = req.body;
    if (!job.userId) {
      return sendJsonResponse(res, '请选择发布用户');
    }
    if (!service.title) {
      return sendJsonResponse(res, '请填写标题');
    }
    if (!service.price) {
      return sendJsonResponse(res, '请填写服务价格');
    }
    daywork.createService(service, (err, service) => sendJsonResponse(res, err, { service }));
  });

  app.post(apiPrefix + '/management/updateUser', requireAdmin(), (req, res) => {
    const body = req.body;
    const userId = body.userId;

    if (!userId) {
      return sendJsonResponse(res, '请选择用户');
    }
    daywork.updateUser(userId, body,
                       (err, user) => sendJsonResponse(res, err, { user: user }));
  });

}
