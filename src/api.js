import { apiPrefix, categories } from './config';
import formidable from 'formidable';
import { sendJsonResponse } from './lib/util';
import async from 'async';
import _ from 'lodash';
import { requestSmsCode, verifySmsCode } from './lib/leancloud';
import { hashedPassword } from './lib/zhaoshizuo';
import { OauthToken } from './lib/models';
import {
  createPayment,
  checkPayment,
  getPayments,
  drawMoney,
  cancelPayment
} from './lib/payment';
import qs from 'querystring';
import { search } from './lib/search';

export default function(app, zhaoshizuo) {
  let  { requireLogin } = zhaoshizuo;

  app.get(apiPrefix + '/users/me', requireLogin(),
          (req, res) => sendJsonResponse(res, null, { user: req.currentUser }));

  app.get(apiPrefix + '/users/:userId',
          (req, res) => sendJsonResponse(res, null, { user: req.user }));

  app.get(apiPrefix + '/jobs/:jobId',
          (req, res) => {
            let options = { user: true };
            if (req.currentUser) {
              options.favorited = options.requested = req.currentUser.userId;
            }
            zhaoshizuo.getJob(req.job.jobId, options, (err, job) => {
              sendJsonResponse(res, err, { job });
            });
          });

  app.get(apiPrefix + '/jobs/:jobId/workers', (req, res) => {
    let page = Number(req.query.page) || 0;
    let limit = Number(req.query.limit) || 10;
    if (limit > 50) {
      limit = 50;
    }
    let status = req.query.status || null;
    let jobId = req.params.jobId;
    let skip = limit * page;

    zhaoshizuo.getJobWorkers(jobId,
                          { limit: limit, skip: skip, status: status },
                          (err, workers) => {
                            sendJsonResponse(res, err, { workers: workers });
                          });
  });

  app.get(apiPrefix + '/jobs/:jobId/workers/:userId', (req, res) => {
    let userId = req.params.userId;
    let jobId = req.params.jobId;

    zhaoshizuo.getWorker({ userId, jobId },
                    (err, worker) => {
                      if (worker) {
                        worker.job = req.job;
                      }
                      sendJsonResponse(res, err, { worker });
                    });
  });

  app.get(apiPrefix + '/users/:userId/jobs', (req, res) => {
    let page = Number(req.query.page) || 0;
    let limit = Number(req.query.limit) || 10;
    if (limit > 50) {
      limit = 50;
    }
    let status = req.query.status || null;
    let userId = Number(req.params.userId);
    let skip = limit * page;

    let query = { userId: userId };
    if (status) {
      query.status = status;
    }

    zhaoshizuo.getJobs(query ,
                    { limit: limit, skip: skip },
                    (err, jobs) => {
                      zhaoshizuo.countJob(query, (_, total) => {
                        sendJsonResponse(res, err, { jobs, total });
                      });
                    });
  });

  app.get(apiPrefix + '/jobs/?', (req, res) => {
    let page = Number(req.query.page) || 0;
    let limit = Number(req.query.limit) || 10;
    if (limit > 50) {
      limit = 50;
    }
    let status = req.query.status || null;
    let category = req.query.category || null;
    let userId = req.query.userId || null;
    let skip = limit * page;

    let query = {};
    if (status) {
      query.status = status;
    }
    if (category) {
      query.category = category;
    }
    if (userId) {
      query.userId = userId;
    }
    let extra = { user: true };
    if (req.currentUser) {
      extra.favorited = extra.requested = req.currentUser.userId;
    }
    zhaoshizuo.getJobs(query,
                    { limit: limit, skip: skip, extra: extra },
                    (err, jobs) => {
                      zhaoshizuo.countJob(query, (_, total) => {
                        sendJsonResponse(res, err, { jobs, total });
                      });
                    });
  });

  app.get(apiPrefix + '/users/:userId/works', (req, res) => {
    let page = Number(req.query.page) || 0;
    let limit = Number(req.query.limit) || 10;
    if (limit > 50) {
      limit = 50;
    }
    let status = req.query.status || null;
    let userId = req.params.userId;
    let skip = limit * page;

    zhaoshizuo.getMyJobs(userId,
                      { limit: limit, skip: skip, status: status },
                      (err, jobs) => {
                        sendJsonResponse(res, err, { works: jobs });
                      });
  });

  app.get(apiPrefix + '/messages', requireLogin(), (req, res) => {
    let page = Number(req.query.page) || 0;
    let limit = Number(req.query.limit) || 10;
    if (limit > 50) {
      limit = 50;
    }
    let userId = req.currentUser.userId;
    let skip = limit * page;

    zhaoshizuo.getMessages(userId, { limit, skip },
                        (err, messages) => sendJsonResponse(res, err, { messages }));

  });

  app.get(apiPrefix + '/users/:userId/works/:jobId', (req, res) => {
    let userId = req.params.userId;
    let jobId = req.params.jobId;

    zhaoshizuo.getWork({ userId, jobId },
                    (err, work) => {
                      sendJsonResponse(res, err, { work });
                    });
  });

  app.get(apiPrefix + '/jobs/:jobId/records', (req, res) => {
    let page = Number(req.query.page) || 0;
    let limit = Number(req.query.limit) || 10;
    if (limit > 50) {
      limit = 50;
    }
    let status = req.query.status || null;
    let jobId = req.params.jobId;
    let userId = req.query.userId || null;
    let skip = limit * page;

    zhaoshizuo.getRecordByJob(jobId,
                           { limit: limit, skip: skip, status: status, userId: userId },
                           (err, records) => {
                             sendJsonResponse(res, err, { records: records });
                           });
  });

  app.get(apiPrefix + '/jobs/:jobId/payment/:userId', requireLogin(), (req, res) => {
    let jobId = req.job.jobId;
    let userId = req.user.userId;
    if (!req.isOwnerJob || userId === req.currentUser.userId) {
      return sendJsonResponse(res, 403, 'no permission.');
    }
    zhaoshizuo.getPayment(jobId, userId,
                       (err, payment) => sendJsonResponse(res, err, { payment: payment }));
  });

  app.get(apiPrefix + '/users/:userId/records', (req, res) => {
    let page = Number(req.query.page) || 0;
    let limit = Number(req.query.limit) || 10;
    if (limit > 50) {
      limit = 50;
    }
    let status = req.query.status || null;
    let userId = req.params.userId;
    let jobId = req.query.jobId || null;
    let skip = limit * page;

    zhaoshizuo.getRecordByUser(userId,
                            { limit: limit, skip: skip, status: status, jobId: jobId },
                            (err, records) => {
                              sendJsonResponse(res, err, { records: records });
                            });
  });

  app.post(apiPrefix + '/jobs/create', requireLogin(), (req, res) => {
    let job = req.body;
    job.userId = req.currentUser.userId;
    if (!job.title) {
      return sendJsonResponse(res, '请填写标题');
    }
    if (!job.salary) {
      return sendJsonResponse(res, '请填写单位工资');
    }
    zhaoshizuo.createJob(job, (err, job) => sendJsonResponse(res, err, { job: job }));
  });

  app.post(apiPrefix + '/jobs/:jobId/publish', requireLogin(), (req, res) => {
    if (req.isOwner || req.isAdmin) {
      zhaoshizuo.publishJob(req.job.jobId,
                         (err, job) => sendJsonResponse(res, err, { job: job }));
    } else {
      sendJsonResponse(res, 403, 'no permission');
    }
  });

  app.post(apiPrefix + '/jobs/:jobId/finish', requireLogin(), (req, res) => {
    if (req.isOwner || req.isAdmin) {
      zhaoshizuo.finishJob(req.job.jobId,
                        (err, job) => sendJsonResponse(res, err, { job: job }));
    } else {
      sendJsonResponse(res, 403, 'no permission');
    }
  });

  app.post(apiPrefix + '/jobs/:jobId/delete', requireLogin(), (req, res) => {
    if (req.isOwner || req.isAdmin) {
      zhaoshizuo.deleteJob(req.job.jobId,
                        (err, job) => sendJsonResponse(res, err, { job: job }));
    } else {
      sendJsonResponse(res, 403, 'no permission');
    }
  });

  app.post(apiPrefix + '/jobs/:jobId/update', requireLogin(), (req, res) => {
    if (req.isOwner || req.isAdmin) {
      zhaoshizuo.updateJob(req.job.jobId, req.body,
                        (err, job) => sendJsonResponse(res, err, { job: job }));
    } else {
      sendJsonResponse(res, 403, 'no permission');
    }
  });

  app.post(apiPrefix + '/requestJob', requireLogin(), (req, res) => {
    let userId = req.currentUser.userId;
    let jobId = Number(req.body.jobId);

    zhaoshizuo.getJob(jobId, (err, job) => {
      if (!job) {
        return sendJsonResponse(res, 404, 'Job not found.');
      }
      if (job.userId === userId) {
        return sendJsonResponse(res, 403, 'You can\'t request job for yourself.');
      }

      zhaoshizuo.requestMyJob(jobId, userId,
                           (err, myJob) => sendJsonResponse(res, err, { work: myJob }));
    });
  });

  app.post(apiPrefix + '/jobs/:jobId/assignWorker', requireLogin(), (req, res) => {
    if (!req.isOwner) {
      return sendJsonResponse(res, 403, 'no permission.');
    }

    let userId = Number(req.body.userId);
    let jobId = req.job.jobId;

    if (req.currentUser.userId === userId) {
      return sendJsonResponse(res, 403, 'You can\'t assign job for yourself.');
    }

    zhaoshizuo.getUser(userId, (err, user) => {
      if (err) {
        return sendJsonResponse(res, err);
      }
      if (!user || !user.userId) {
        return sendJsonResponse(res, 'User: ' + userId + ' is not exists.');
      }
      zhaoshizuo.assignMyJob(userId, jobId,
                          (err, myJob) => sendJsonResponse(res, err, { worker: myJob }));
    });
  });

  app.post(apiPrefix + '/jobs/:jobId/workerLeave', requireLogin(), (req, res) => {
    let userId = Number(req.body.userId) || req.currentUser.userId;
    let jobId = req.job.jobId;

    if (req.currentUser.userId !== userId && !req.isOwner) {
      return sendJsonResponse(res, 403, 'no permission.');
    }

    zhaoshizuo.getUser(req.body.userId, (err, user) => {
      if (err) {
        return sendJsonResponse(res, err);
      }
      if (!user || !user.userId) {
        return sendJsonResponse(res, 'User: ' + userId + ' is not exists.');
      }

      zhaoshizuo.leaveMyJob(userId, jobId,
                         (err, myJob) => sendJsonResponse(res, err, myJob));
    });
  });

  app.post(apiPrefix + '/jobs/:jobId/favorite', requireLogin(), (req, res) => {
    let userId = req.currentUser.userId;
    let jobId = req.job.jobId;
    zhaoshizuo.favorite({ userId, jobId },
                        (err, fav) => sendJsonResponse(res, err, fav));
  });

  app.post(apiPrefix + '/jobs/:jobId/unfavorite', requireLogin(), (req, res) => {
    let userId = req.currentUser.userId;
    let jobId = req.job.jobId;
    zhaoshizuo.unfavorite({ userId, jobId },
                          (err, fav) => sendJsonResponse(res, err, fav));
  });

  app.post(apiPrefix + '/jobs/:jobId/addRecord', requireLogin(), (req, res) => {
    if (!req.isOwner) {
      return sendJsonResponse(res, 403, 'no permission.');
    }

    let userId = Number(req.body.userId);
    let jobId = req.job.jobId;

    if (req.currentUser.userId === userId) {
      return sendJsonResponse(res, 403, 'You can\'t add work record for yourself.');
    }

    zhaoshizuo.getUser(userId, (err, user) => {
      if (err) {
        return sendJsonResponse(res, err);
      }
      if (!user || !user.userId) {
        return sendJsonResponse(res, 'User: ' + userId + ' is not exists.');
      }
      let record = {
        jobId: jobId,
        userId: userId,
        recordNumber: Number(req.body.recordNumber) || 1
      };
      zhaoshizuo.addRecord(record,
                        (err, rec) => sendJsonResponse(res, err, { record: rec }));
    });
  });

  app.post(apiPrefix + '/jobs/:jobId/cancelRecord', requireLogin(), (req, res) => {
    var recId = req.body.recordId;
    if (!req.isOwner) {
      return sendJsonResponse(res, 403, 'no permission.');
    }
    async.waterfall([
      (next) => zhaoshizuo.getRecord(recId, next),
      (record, next) => zhaoshizuo.cancelRecord(recId, next)
    ], (err, rec) => sendJsonResponse(res, err, { record: rec }));
  });

  app.post(apiPrefix + '/jobs/:jobId/payOffline', requireLogin(), (req, res) => {
    if (!req.isOwner) {
      return sendJsonResponse(res, 403, 'no permission.');
    }
    let id = Number(req.body.id);
    let money = Number(req.body.money);
    zhaoshizuo.payOffline(id, money,
                       (err, result) => sendJsonResponse(res, err, { result: result }));
  });

  app.post(apiPrefix + '/jobs/:jobId/payOnline', requireLogin(), (req, res) => {
    if (!req.isOwner) {
      return sendJsonResponse(res, 403, 'no permission.');
    }
    let id = Number(req.body.id);
    let money = Number(req.body.money);
    zhaoshizuo.payOnline(id, money,
                         (err, result) => sendJsonResponse(res, err, { result: result }));
  });

  app.post(apiPrefix + '/signup', (req, res) => {
    let user = req.body;
    verifySmsCode(user.smsCode, user.phoneNumber, (err) => {
      if (err) {
        return sendJsonResponse(res, err);
      }
      user.phoneVerified = true;
      zhaoshizuo.createUser(user, (err, user) => {
        if (user && user.userId && req.session) {
          req.session.currentUser = user;
        }
        sendJsonResponse(res, err, { user: user });
      });
    });
  });

  app.post(apiPrefix + '/logOut', (req, res) => {
    if (req.session && req.session.currentUser) {
      delete req.session.currentUser;
    }
    let token = req.get('Authorization');
    token = token && token.substr(0, 6) === 'Bearer' ? token.substr(7) : false;
    if (!token) {
      token = req.body.access_token || req.query.access_token;
    }
    if (token) {
      OauthToken.findOneAndRemove(
        { accessToken: token },
        (err, token) => sendJsonResponse(res, null, { result: 'success' }));
    } else {
      sendJsonResponse(res, null, { result: 'success' });
    }
  });

  app.post(apiPrefix + '/sendSmsCode', (req, res) => {
    requestSmsCode(req.body.phoneNumber,
                   (err) => sendJsonResponse(res, err, { result: 'success' }));
  });

  app.post(apiPrefix + '/resetPasswd', (req, res) => {
    let pwds = req.body;
    async.waterfall([
      (next) => {
        if (pwds.phoneNumber && pwds.smsCode) {
          verifySmsCode(pwds.smsCode, pwds.phoneNumber, next);
        } else {
          if (!req.currentUser) {
            return next('Unauthorized');
          }
          pwds.phoneNumber = req.currentUser.phoneNumber;
          var oldHash = hashedPassword(pwds.oldPasswd);
          if (oldHash != req.currentUser.passwd) {
            return next('旧密码输入错误');
          }
        }
      },
      (next) => {
        zhaoshizuo.changePasswd(pwds, next);
      }
    ], (err) => sendJsonResponse(res, err, { result: 'success' }));
  });

  app.post(apiPrefix + '/updateProfile', requireLogin(), (req, res) => {
    let userId = req.currentUser.userId;
    let body = req.body;
    zhaoshizuo.updateUser(userId, body,
                       (err, user) => sendJsonResponse(res, err, { user: user }));
  });

  app.post(apiPrefix + '/upload', requireLogin(), (req, res) => {
    async.waterfall([
      (next) => {
        let form = new formidable.IncomingForm();
        form.hash = 'sha1';
        form.parse(req, (err, _, files) => next(err, files));
      },
      (files, next) => {
        async.map(_.values(files), (file, done) => {
          zhaoshizuo.upload(file, (err, file) => done(err, file && file.toJSON()));
        }, next);
      }
    ], (err, files) => {
      sendJsonResponse(res, err, files);
    });
  });
  app.post(apiPrefix + '/updateAvatar', requireLogin(), (req, res) => {
    async.waterfall([
      (next) => {
        let form = new formidable.IncomingForm();
        form.hash = 'sha1';
        form.parse(req, (err, _, files) => next(err, files));
      },
      (files, next) => {
        if (!files.avatar) {
          return next('请选择头像');
        }
        let file = files.avatar;
        zhaoshizuo.upload(file, next);
      },
      (file, next) => {
        zhaoshizuo.updateUser(req.currentUser.userId, { avatar: file.toJSON() },
                           (err) => next(err, file));
      }
    ], (err, file) => {
      sendJsonResponse(res, err, file);
    });
  });

  app.post(apiPrefix + '/createPayment/?', requireLogin(), (req, res) => {
    let payment = req.body;
    let userId = req.currentUser.userId;
    let client_ip = req.ip;
    createPayment({ ...payment, userId, client_ip }, (err, payment) => {
      sendJsonResponse(res, err, { payment });
    });
  });

  app.get(apiPrefix + '/payments/?', requireLogin(), (req, res) => {
    let page = Number(req.query.page) || 0;
    let limit = Number(req.query.limit) || 10;
    if (limit > 50) {
      limit = 50;
    }
    let userId = req.currentUser.userId;
    let skip = limit * page;

    let query = { userId };
    getPayments(query, { limit, skip },
                (err, payments) => sendJsonResponse(res, err, { payments }));
  });


  app.post(apiPrefix + '/payments/:order_no/check/?', requireLogin(), (req, res) => {
    let payment = req.payment;
    checkPayment(payment, (err, payment) => {
      sendJsonResponse(res, err, { payment });
    });
  });

  app.get(apiPrefix + '/payments/:order_no/?', requireLogin(), (req, res) => {
    sendJsonResponse(res, null, { payment: req.payment });
  });

  app.delete(apiPrefix + '/payments/:order_no/?', requireLogin(), (req, res) => {
    let payment = req.payment;
    cancelPayment(payment, (err, payment) => {
      sendJsonResponse(res, err, { payment });
    });
  });

  app.post(apiPrefix + '/drawMoney/?', requireLogin(), (req, res) => {
    let payment = req.body;
    let client_ip = req.ip;
    const { remainMoney, freezeMoney, userId, phoneNumber } = req.currentUser;
    const amount = payment.amount;
    const avalableMoney = (remainMoney - freezeMoney) * 100;
    if ( avalableMoney < amount ) {
      return sendJsonResponse(res, '可用余额不足');
    }

    verifySmsCode(payment.smsCode, phoneNumber, (err) => {
      if (err) {
        return sendJsonResponse(res, err);
      }
      drawMoney({ ...payment, userId, client_ip }, (err, payment) => {
        sendJsonResponse(res, err, { payment });
      });
    });
  });

  app.get(apiPrefix + '/pay_result', (req, res) => {
    res.redirect(`/#/pay_result?${qs.stringify(req.query)}`);
  });

  app.get(apiPrefix + '/pay_cancel', (req, res) => {
    res.redirect(`/#/pay_cancel?${qs.stringify(req.query)}`);
  });

  // service
  app.get(apiPrefix + '/services/:serviceId',
          (req, res) => {
            let options = { user: true };
            if (req.currentUser) {
              options.favorited = req.currentUser.userId;
            }
            zhaoshizuo.getService(req.service.serviceId, options, (err, service) => {
              sendJsonResponse(res, err, { service });
            });
          });

  app.get(apiPrefix + '/users/:userId/services', (req, res) => {
    let page = Number(req.query.page) || 0;
    let limit = Number(req.query.limit) || 10;
    if (limit > 50) {
      limit = 50;
    }
    let status = req.query.status || null;
    let userId = Number(req.params.userId);
    let skip = limit * page;

    let query = { userId: userId };
    if (status) {
      query.status = status;
    }

    zhaoshizuo.getServices(query ,
                    { limit: limit, skip: skip },
                    (err, services) => {
                      zhaoshizuo.countService(query, (_, total) => {
                        sendJsonResponse(res, err, { services, total });
                      });
                    });
  });

  app.get(apiPrefix + '/services/?', (req, res) => {
    let page = Number(req.query.page) || 0;
    let limit = Number(req.query.limit) || 10;
    if (limit > 50) {
      limit = 50;
    }
    let status = req.query.status || null;
    let category = req.query.category || null;
    let userId = req.query.userId || null;
    let skip = limit * page;

    let query = {};
    if (status) {
      query.status = status;
    }
    if (category) {
      query.category = category;
    }
    if (userId) {
      query.userId = userId;
    }
    let extra = { user: true };
    if (req.currentUser) {
      extra.favorited = req.currentUser.userId;
    }
    zhaoshizuo.getServices(query,
                    { limit: limit, skip: skip, extra: extra },
                    (err, services) => {
                      zhaoshizuo.countService(query, (_, total) => {
                        sendJsonResponse(res, err, { services, total });
                      });
                    });
  });

  app.post(apiPrefix + '/services/create', requireLogin(), (req, res) => {
    let service = req.body;
    service.userId = req.currentUser.userId;
    if (!service.title) {
      return sendJsonResponse(res, '请填写标题');
    }
    if (!service.price) {
      return sendJsonResponse(res, '请填写服务价格');
    }
    zhaoshizuo.createService(service, (err, service) => sendJsonResponse(res, err, { service: service }));
  });

  app.post(apiPrefix + '/services/:serviceId/publish', requireLogin(), (req, res) => {
    if (req.isOwner || req.isAdmin) {
      zhaoshizuo.publishService(req.service.serviceId,
                         (err, service) => sendJsonResponse(res, err, { service: service }));
    } else {
      sendJsonResponse(res, 403, 'no permission');
    }
  });

  app.post(apiPrefix + '/services/:serviceId/finish', requireLogin(), (req, res) => {
    if (req.isOwner || req.isAdmin) {
      zhaoshizuo.finishService(req.service.serviceId,
                        (err, service) => sendJsonResponse(res, err, { service: service }));
    } else {
      sendJsonResponse(res, 403, 'no permission');
    }
  });

  app.post(apiPrefix + '/services/:serviceId/delete', requireLogin(), (req, res) => {
    if (req.isOwner || req.isAdmin) {
      zhaoshizuo.deleteService(req.service.serviceId,
                        (err, service) => sendJsonResponse(res, err, { service: service }));
    } else {
      sendJsonResponse(res, 403, 'no permission');
    }
  });

  app.post(apiPrefix + '/services/:serviceId/update', requireLogin(), (req, res) => {
    if (req.isOwner || req.isAdmin) {
      zhaoshizuo.updateService(req.service.serviceId, req.body,
                        (err, service) => sendJsonResponse(res, err, { service: service }));
    } else {
      sendJsonResponse(res, 403, 'no permission');
    }
  });

  app.post(apiPrefix + '/services/:serviceId/favorite', requireLogin(), (req, res) => {
    let userId = req.currentUser.userId;
    let serviceId = req.service.serviceId;
    zhaoshizuo.favorite({ userId, serviceId },
                        (err, fav) => sendJsonResponse(res, err, fav));
  });

  app.post(apiPrefix + '/services/:serviceId/unfavorite', requireLogin(), (req, res) => {
    let userId = req.currentUser.userId;
    let serviceId = req.service.serviceId;
    zhaoshizuo.unfavorite({ userId, serviceId },
                          (err, fav) => sendJsonResponse(res, err, fav));
  });

  app.post(apiPrefix + '/services/:serviceId/createOrder', requireLogin(), (req, res) => {
    const { amount, summary } = req.body;
    const userId = req.currentUser.userId;
    const serviceId = req.service.serviceId;
    zhaoshizuo.createServiceOrder({ userId, serviceId, amount, summary }, (err, order) => {
      sendJsonResponse(res, err, {order});
    });
  });

  app.get(apiPrefix + '/orders/:orderId/', requireLogin(), (req, res) => {
    const order = req.order;
    const userId = req.currentUser.userId;
    if (!req.isOwnerServiceOrder && userId !== order.service.userId) {
      return sendJsonResponse(res, 403, 'no permission.');
    }
    zhaoshizuo.getServiceOrder(order.id, { user: true, service: true },
                            (err, order) => {
                              order.isSaled = userId === order.serviceUserId;
                              order.isPurchased = userId === order.userId;
                              sendJsonResponse(res, err, { order });
                            });
  });

  app.get(apiPrefix + '/orders/', requireLogin(), (req, res) => {
    let page = Number(req.query.page) || 0;
    let limit = Number(req.query.limit) || 10;
    if (limit > 50) {
      limit = 50;
    }

    let skip = limit * page;

    const userId = req.currentUser.userId;
    let query = { userId };

    const keys = ['status', 'serviceId'];
    keys.forEach((key) => {
      if (req.query[key]) {
        query[key] = req.query[key];
      }
    });

    zhaoshizuo.getServiceOrders(query,
                             { limit: limit, skip: skip },
                             (err, orders) => {
                               sendJsonResponse(res, err, { orders });
                             });
  });

  app.get(apiPrefix + '/users/:userId/orders/', requireLogin(), (req, res) => {
    if (!req.isOwner) {
      return sendJsonResponse(res, 403, 'no permission.');
    }
    let page = Number(req.query.page) || 0;
    let limit = Number(req.query.limit) || 10;
    if (limit > 50) {
      limit = 50;
    }

    let skip = limit * page;

    const serviceUserId = req.user.userId;
    let query = { serviceUserId };

    const keys = ['status', 'serviceId'];
    keys.forEach((key) => {
      if (req.query[key]) {
        query[key] = req.query[key];
      }
    });

    zhaoshizuo.getServiceOrders(query,
                             { limit: limit, skip: skip },
                             (err, orders) => {
                               sendJsonResponse(res, err, { orders });
                             });
  });

  app.post(apiPrefix + '/orders/:orderId/pay', requireLogin(), (req, res) => {
    const order = req.order;
    if (!req.isOwnerServiceOrder) {
      return sendJsonResponse(res, 403, 'no permission.');
    }
    zhaoshizuo.payServiceOrder(order.id,
                            (err, order) => sendJsonResponse(res, err, { order }));
  });

  app.post(apiPrefix + '/orders/:orderId/cancel', requireLogin(), (req, res) => {
    const order = req.order;
    const reason = req.body.reason;
    const userId = req.currentUser.userId;
    if (!req.isOwnerServiceOrder && userId !== order.service.userId) {
      return sendJsonResponse(res, 403, 'no permission.');
    }
    zhaoshizuo.cancelServiceOrder({id: order.id, reason},
                               (err, order) => sendJsonResponse(res, err, { order }));
  });

  app.post(apiPrefix + '/orders/:orderId/finish', requireLogin(), (req, res) => {
    const order = req.order;
    const userId = req.currentUser.userId;
    if (!req.isOwnerServiceOrder) {
      return sendJsonResponse(res, 403, 'no permission.');
    }
    zhaoshizuo.finishServiceOrder(order.id,
                               (err, order) => sendJsonResponse(res, err, { order }));
  });

  app.post(apiPrefix + '/orders/:orderId/dealing', requireLogin(), (req, res) => {
    const order = req.order;
    const userId = req.currentUser.userId;
    if (userId !== order.service.userId) {
      return sendJsonResponse(res, 403, 'no permission.');
    }
    zhaoshizuo.dealingServiceOrder(order.id,
                                (err, order) => sendJsonResponse(res, err, { order }));
  });

  app.post(apiPrefix + '/orders/:orderId/dealt', requireLogin(), (req, res) => {
    const order = req.order;
    const userId = req.currentUser.userId;
    if (userId !== order.service.userId) {
      return sendJsonResponse(res, 403, 'no permission.');
    }
    zhaoshizuo.dealtServiceOrder(order.id,
                              (err, order) => sendJsonResponse(res, err, { order }));
  });

  app.get(apiPrefix + '/categories/:categoryType/?', (req, res) => {
    const { categoryType } = req.params;
    zhaoshizuo.getCategories(categoryType, (err, categories) => {
      sendJsonResponse(res, err, { categories });
    });
  });

  app.get(apiPrefix + '/categories/:categoryType/:categoryId?', (req, res) => {
    const { categoryType, categoryId } = req.params;
    zhaoshizuo.getCategory({ categoryId, categoryType }, (err, category) => {
      sendJsonResponse(res, err, { category });
    });
  });

  app.get(apiPrefix + '/cities/?', (req, res) => {
    zhaoshizuo.getCities((err, cities) => {
      sendJsonResponse(res, err, { cities });
    });
  });

  app.get(apiPrefix + '/cities/:cityId', (req, res) => {
    const { city } = req;
    sendJsonResponse(res, null, { city });
  });

  app.get(apiPrefix + '/cities/:cityId/areas/?', (req, res) => {
    const { cityId } = req.params;
    zhaoshizuo.getAreas(cityId, (err, areas) => {
      if (areas) {
        areas = areas.map((area) => {
          area = area.toJSON();
          area.cityName = req.city.cityName;
          return area;
        });
      }
      sendJsonResponse(res, err, { areas });
    });
  });

  app.get(apiPrefix + '/areas/:areaId', (req, res) => {
    zhaoshizuo.getCity(req.area.cityId, (err, city) => {
      let area = req.area.toJSON();
      area.cityName = city.cityName;
      sendJsonResponse(res, err, { area });
    });
  });

  app.get(apiPrefix + '/search/?', (req, res) => {
    const { q, from, size } = req.query;
    search({ q, from, size }, (err, rsp) => {
      if (err) {
        return sendJsonResponse(res, err);
      }

      let options = { user: true };
      if (req.currentUser) {
        options.favorited = options.requested = req.currentUser.userId;
      }

      const { total, from, size, q, docs } = rsp;
      async.map(docs || [], (doc, done) => {
        const line = doc.id.split('-');
        if (line[0] === 'job') {
          zhaoshizuo.getJob(line[1], options, (err, job) => done(err, job));
        } else if (line[0] === 'service') {
          zhaoshizuo.getService(line[1], options, (err, service) => done(err, service));
        } else {
          done();
        }
      }, (err, docs) => {
        sendJsonResponse(res, err, { docs, total, from, size, q });
      });
    });
  });

  app.get(apiPrefix + '/users/:userId/favorites', (req, res) => {
    let from = Number(req.query.from) || 0;
    let size = Number(req.query.size) || 10;
    if (size > 50) {
      size = 50;
    }
    let status = req.query.status || null;
    let userId = Number(req.params.userId);

    let query = { userId: userId };
    if (status) {
      query.status = status;
    }

    let options = { user: true };
    if (req.currentUser) {
      options.favorited = options.requested = req.currentUser.userId;
    }

    zhaoshizuo.getFavorites(query ,
                    { limit: size, skip: from },
                    (err, docs) => {
                      async.map(docs || [], ({ jobId, serviceId }, done) => {
                        if (jobId) {
                          zhaoshizuo.getJob(jobId, options, (err, job) => done(err, job));
                        } else if (serviceId) {
                          zhaoshizuo.getService(serviceId, options, (err, service) => done(err, service));
                        } else {
                          done();
                        }
                      }, (err, docs) => {
                        zhaoshizuo.countFavorite(query, (_, total) => {
                          sendJsonResponse(res, err, { docs, total, from, size });
                        });
                      });
                    });
  });

}
