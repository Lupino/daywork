import { apiPrefix } from './config';
import formidable from 'formidable';
import { sendJsonResponse } from './lib/util';
import async from 'async';
import _ from 'lodash';
import { requestSmsCode, verifySmsCode } from './lib/leancloud';
import { hashedPassword } from './lib/daywork';

export default function(app, daywork) {
  let  { requireLogin } = daywork;

  app.get(apiPrefix + '/users/me', requireLogin(),
          (req, res) => sendJsonResponse(res, null, { user: req.currentUser }));

  app.get(apiPrefix + '/users/:userId',
          (req, res) => sendJsonResponse(res, null, { user: req.user }));

  app.get(apiPrefix + '/jobs/:jobId',
          (req, res) => {
            let job = req.job.toJSON();
            daywork.getUser(job.userId, (err, user) => {
              job.user = user;
              sendJsonResponse(res, err, { job: job });
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
    let filled = { user: true };
    if (req.currentUser) {
      filled.favorited = filled.requested = req.currentUser.userId;
    }
    daywork.getJobs(query,
                    { limit: limit, skip: skip, filled: filled },
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

  app.post(apiPrefix + '/jobs/:jobId/assignWorker', requireLogin(), (req, res) => {
    if (!req.isOwner) {
      return sendJsonResponse(res, 403, 'no permission.');
    }

    let userId = Number(req.param('userId'));
    let jobId = req.job.jobId;

    if (req.currentUser.userId === userId) {
      return sendJsonResponse(res, 403, 'You can\'t assign job for your self.');
    }

    daywork.getUser(userId, (err, user) => {
      if (err) {
        return sendJsonResponse(res, err);
      }
      if (!user || !user.userId) {
        return sendJsonResponse(res, 'User: ' + userId + ' is not exists.');
      }
      daywork.assignMyJob(userId, jobId,
                          (err, myJob) => sendJsonResponse(res, err, myJob));
    });
  });

  app.post(apiPrefix + '/jobs/:jobId/workerLeave', requireLogin(), (req, res) => {
    let userId = Number(req.param('userId')) || req.currentUser.userId;
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
      return sendJsonResponse(res, 403, 'You can\'t add work record for your self.');
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
      (record, next) => {
        if (record.userId != req.currentUser.userId) {
          return sendJsonResponse(res, 403, 'no permission.');
        }
        return daywork.cancelRecord(recId, next);
      }
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
        if (user && user.userId) {
          req.session.currentUser = user;
        }
        sendJsonResponse(res, err, { user: user });
      });
    });
  });

  app.post(apiPrefix + '/logOut', (req, res) => {
    if (req.session.currentUser) {
      delete req.session.currentUser;
    }
    sendJsonResponse(res, null, { result: 'success' });
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
}
