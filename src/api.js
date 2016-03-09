import { apiPrefix } from './config';
import formidable from 'formidable';
import { sendJsonResponse } from './lib/util';
import async from 'async';
import _ from 'lodash';
import { requestSmsCode, verifySmsCode } from './lib/leancloud';
import { hashedPassword } from './lib/daywork';
import { OauthToken } from './lib/models';
import { createPayment, checkPayment, getPayments, drawMoney, cancelPayment } from './lib/payment';
import qs from 'querystring';

export default function(app, daywork) {
  let  { requireLogin } = daywork;

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
            daywork.getJob(req.job.jobId, options, (err, job) => {
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

    daywork.getJobWorkers(jobId,
                          { limit: limit, skip: skip, status: status },
                          (err, workers) => {
                            sendJsonResponse(res, err, { workers: workers });
                          });
  });

  app.get(apiPrefix + '/jobs/:jobId/workers/:userId', (req, res) => {
    let userId = req.params.userId;
    let jobId = req.params.jobId;

    daywork.getWorker({ userId, jobId },
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

    daywork.getJobs(query ,
                    { limit: limit, skip: skip },
                    (err, jobs) => {
                      sendJsonResponse(res, err, { jobs: jobs });
                    });
  });

  app.get(apiPrefix + '/jobs/?', (req, res) => {
    let page = Number(req.query.page) || 0;
    let limit = Number(req.query.limit) || 10;
    if (limit > 50) {
      limit = 50;
    }
    let status = req.query.status || null;
    let userId = req.query.userId || null;
    let skip = limit * page;

    let query = {};
    if (status) {
      query.status = status;
    }
    if (userId) {
      query.userId = userId;
    }
    let extra = { user: true };
    if (req.currentUser) {
      extra.favorited = extra.requested = req.currentUser.userId;
    }
    daywork.getJobs(query,
                    { limit: limit, skip: skip, extra: extra },
                    (err, jobs) => {
                      sendJsonResponse(res, err, { jobs: jobs });
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

    daywork.getMyJobs(userId,
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

    daywork.getMessages(userId, { limit, skip },
                        (err, messages) => sendJsonResponse(res, err, { messages }));

  });

  app.get(apiPrefix + '/users/:userId/works/:jobId', (req, res) => {
    let userId = req.params.userId;
    let jobId = req.params.jobId;

    daywork.getWork({ userId, jobId },
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

    daywork.getRecordByJob(jobId,
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
    daywork.getPayment(jobId, userId,
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

    daywork.getRecordByUser(userId,
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
    daywork.createJob(job, (err, job) => sendJsonResponse(res, err, { job: job }));
  });

  app.post(apiPrefix + '/jobs/:jobId/publish', requireLogin(), (req, res) => {
    if (req.isOwner) {
      daywork.publishJob(req.job.jobId,
                         (err, job) => sendJsonResponse(res, err, { job: job }));
    } else {
      sendJsonResponse(res, 403, 'no permission');
    }
  });

  app.post(apiPrefix + '/jobs/:jobId/finish', requireLogin(), (req, res) => {
    if (req.isOwner) {
      daywork.finishJob(req.job.jobId,
                        (err, job) => sendJsonResponse(res, err, { job: job }));
    } else {
      sendJsonResponse(res, 403, 'no permission');
    }
  });

  app.post(apiPrefix + '/jobs/:jobId/delete', requireLogin(), (req, res) => {
    if (req.isOwner) {
      daywork.deleteJob(req.job.jobId,
                        (err, job) => sendJsonResponse(res, err, { job: job }));
    } else {
      sendJsonResponse(res, 403, 'no permission');
    }
  });

  app.post(apiPrefix + '/jobs/:jobId/update', requireLogin(), (req, res) => {
    if (req.isOwner) {
      daywork.updateJob(req.job.jobId, req.body,
                        (err, job) => sendJsonResponse(res, err, { job: job }));
    } else {
      sendJsonResponse(res, 403, 'no permission');
    }
  });

  app.post(apiPrefix + '/requestJob', requireLogin(), (req, res) => {
    let userId = req.currentUser.userId;
    let jobId = Number(req.body.jobId);

    daywork.getJob(jobId, (err, job) => {
      if (!job) {
        return sendJsonResponse(res, 404, 'Job not found.');
      }
      if (job.userId === userId) {
        return sendJsonResponse(res, 403, 'You can\'t request job for yourself.');
      }

      daywork.requestMyJob(jobId, userId,
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

    daywork.getUser(userId, (err, user) => {
      if (err) {
        return sendJsonResponse(res, err);
      }
      if (!user || !user.userId) {
        return sendJsonResponse(res, 'User: ' + userId + ' is not exists.');
      }
      daywork.assignMyJob(userId, jobId,
                          (err, myJob) => sendJsonResponse(res, err, { worker: myJob }));
    });
  });

  app.post(apiPrefix + '/jobs/:jobId/workerLeave', requireLogin(), (req, res) => {
    let userId = Number(req.body.userId) || req.currentUser.userId;
    let jobId = req.job.jobId;

    if (req.currentUser.userId !== userId && !req.isOwner) {
      return sendJsonResponse(res, 403, 'no permission.');
    }

    daywork.getUser(req.body.userId, (err, user) => {
      if (err) {
        return sendJsonResponse(res, err);
      }
      if (!user || !user.userId) {
        return sendJsonResponse(res, 'User: ' + userId + ' is not exists.');
      }

      daywork.leaveMyJob(userId, jobId,
                         (err, myJob) => sendJsonResponse(res, err, myJob));
    });
  });

  app.post(apiPrefix + '/jobs/:jobId/favorite', requireLogin(), (req, res) => {
    let userId = req.currentUser.userId;
    let jobId = req.job.jobId;
    daywork.favorite(userId, jobId,
                     (err, fav) => sendJsonResponse(res, err, fav));
  });

  app.post(apiPrefix + '/jobs/:jobId/unfavorite', requireLogin(), (req, res) => {
    let userId = req.currentUser.userId;
    let jobId = req.job.jobId;
    daywork.unfavorite(userId, jobId,
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

    daywork.getUser(userId, (err, user) => {
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
      daywork.addRecord(record,
                        (err, rec) => sendJsonResponse(res, err, { record: rec }));
    });
  });

  app.post(apiPrefix + '/jobs/:jobId/cancelRecord', requireLogin(), (req, res) => {
    var recId = req.body.recordId;
    if (!req.isOwner) {
      return sendJsonResponse(res, 403, 'no permission.');
    }
    async.waterfall([
      (next) => daywork.getRecord(recId, next),
      (record, next) => daywork.cancelRecord(recId, next)
    ], (err, rec) => sendJsonResponse(res, err, { record: rec }));
  });

  app.post(apiPrefix + '/jobs/:jobId/payOffline', requireLogin(), (req, res) => {
    if (!req.isOwner) {
      return sendJsonResponse(res, 403, 'no permission.');
    }
    let id = Number(req.body.id);
    let money = Number(req.body.money);
    daywork.payOffline(id, money,
                       (err, result) => sendJsonResponse(res, err, { result: result }));
  });

  app.post(apiPrefix + '/signup', (req, res) => {
    let user = req.body;
    verifySmsCode(user.smsCode, user.phoneNumber, (err) => {
      if (err) {
        return sendJsonResponse(res, err);
      }
      user.phoneVerified = true;
      daywork.createUser(user, (err, user) => {
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
        daywork.changePasswd(pwds, next);
      }
    ], (err) => sendJsonResponse(res, err, { result: 'success' }));
  });

  app.post(apiPrefix + '/updateProfile', requireLogin(), (req, res) => {
    let userId = req.currentUser.userId;
    let body = req.body;
    daywork.updateUser(userId, body,
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
          daywork.upload(file, (err, file) => done(err, file && file.toJSON()));
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
        daywork.upload(file, next);
      },
      (file, next) => {
        daywork.updateUser(req.currentUser.userId, { avatar: file.toJSON() },
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
            daywork.getService(req.service.serviceId, options, (err, service) => {
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

    daywork.getServices(query ,
                    { limit: limit, skip: skip },
                    (err, services) => {
                      sendJsonResponse(res, err, { services: services });
                    });
  });

  app.get(apiPrefix + '/services/?', (req, res) => {
    let page = Number(req.query.page) || 0;
    let limit = Number(req.query.limit) || 10;
    if (limit > 50) {
      limit = 50;
    }
    let status = req.query.status || null;
    let userId = req.query.userId || null;
    let skip = limit * page;

    let query = {};
    if (status) {
      query.status = status;
    }
    if (userId) {
      query.userId = userId;
    }
    let extra = { user: true };
    if (req.currentUser) {
      extra.favorited = req.currentUser.userId;
    }
    daywork.getServices(query,
                    { limit: limit, skip: skip, extra: extra },
                    (err, services) => {
                      sendJsonResponse(res, err, { services: services });
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
    daywork.createService(service, (err, service) => sendJsonResponse(res, err, { service: service }));
  });

  app.post(apiPrefix + '/services/:serviceId/publish', requireLogin(), (req, res) => {
    if (req.isOwner) {
      daywork.publishService(req.service.serviceId,
                         (err, service) => sendJsonResponse(res, err, { service: service }));
    } else {
      sendJsonResponse(res, 403, 'no permission');
    }
  });

  app.post(apiPrefix + '/services/:serviceId/finish', requireLogin(), (req, res) => {
    if (req.isOwner) {
      daywork.finishService(req.service.serviceId,
                        (err, service) => sendJsonResponse(res, err, { service: service }));
    } else {
      sendJsonResponse(res, 403, 'no permission');
    }
  });

  app.post(apiPrefix + '/services/:serviceId/delete', requireLogin(), (req, res) => {
    if (req.isOwner) {
      daywork.deleteService(req.service.serviceId,
                        (err, service) => sendJsonResponse(res, err, { service: service }));
    } else {
      sendJsonResponse(res, 403, 'no permission');
    }
  });

  app.post(apiPrefix + '/services/:serviceId/update', requireLogin(), (req, res) => {
    if (req.isOwner) {
      daywork.updateService(req.service.serviceId, req.body,
                        (err, service) => sendJsonResponse(res, err, { service: service }));
    } else {
      sendJsonResponse(res, 403, 'no permission');
    }
  });

  app.post(apiPrefix + '/services/:serviceId/favorite', requireLogin(), (req, res) => {
    let userId = req.currentUser.userId;
    let serviceId = req.service.serviceId;
    daywork.favoriteService(userId, serviceId,
                     (err, fav) => sendJsonResponse(res, err, fav));
  });

  app.post(apiPrefix + '/services/:serviceId/unfavorite', requireLogin(), (req, res) => {
    let userId = req.currentUser.userId;
    let serviceId = req.service.serviceId;
    daywork.unfavoriteService(userId, serviceId,
                       (err, fav) => sendJsonResponse(res, err, fav));
  });
}
