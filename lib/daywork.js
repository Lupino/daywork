import async from 'async';
import crypto from 'crypto';
import { parse as urlParse } from 'url';
import _ from 'lodash';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { User, File, OauthToken, Job, MyJob, WorkRecord, Sequence } from './models';
import { sendJsonResponse } from './util';

var passwordSalt = 'IW~#$@Asfk%*(skaADfd3#f@13l!sa9';

export function hashedPassword(rawPassword) {
  return crypto.createHmac('sha1', passwordSalt).update(rawPassword).digest('hex');
}

export default class extends Object {
  constructor(config) {
    super(config);
    this.config = config;
  }

  createUser(user, callback) {
    async.waterfall([
      (next) => {
        User.findOne({$or: [
          { userName: user.userName || user.phoneNumber },
          { phoneNumber: user.phoneNumber }
        ]}, (_, u) => next(u && 'userName or phoneNumber is already exists.' || null));
      },
      (next) => {
        var u = new User({
          userName: user.userName || user.phoneNumber,
          realName: user.realName,
          sex: user.sex,
          intro: user.intro,
          phoneNumber: user.phoneNumber,
          phoneVerified: false,
          passwd: hashedPassword(user.passwd),
          avatar: user.avatar || ''
        });

        u.save((err, u) => next(err, u));
      }
    ], (err, result) => callback(err, result));
  }

  getUser(userId, callback) {
    User.findOne({ userId: userId }, (err, user) => {
      if (!user) return callback('User not found.');
      callback(null, user);
    });
  }

  changePasswd(pwds, callback) {
    var hash = hashedPassword(pwds.passwd);
    User.findOneAndUpdate({ phoneNumber: pwds.phoneNumber },
                          { passwd: hash }, (err, user) => {
                            if (err || !user) {
                              return callback('password changed fail.');
                            }
                            callback();
                          });
  }

  updateUser(userId, update, callback) {
    var profile = {};
    ['realName', 'sex', 'intro', 'avatar'].forEach((k) => {
      if (update[k]) {
        profile[k] = update[k];
      }
    });
    User.findOneAndUpdate({ userId: userId }, profile, callback);
  }

  upload(file, callback) {
    File.findOne({ key: file.hash }, (err, fileObj) => {
      if (fileObj) {
        return callback(null, fileObj);
      }
      fs.rename(file.path, this.config.uploadPath + '/' + file.hash, (err) => {
        if (err) {
          return callback(err);
        }
        let extra = {};
        extra.type = file.type;
        fileObj = new File({ key: file.hash, extra: extra });
        fileObj.save((err, f) => callback(err, f));
      });
    });
  }

  auth(authPath) {
    if (!authPath)  {
      authPath = '/auth';
    }
    return (req, res, next) => {
      let url = urlParse(req.url);
      let token = req.get('Authorization');
      token = token && token.substr(0, 6) === 'Bearer' ? token.substr(7) : false;
      if (!token) {
        token = req.body.access_token || req.query.access_token;
      }
      let now = new Date();
      if (req.url.match(/^\/(js|css|img|favicon|logout)$/)) {
        return next();
      } else if (req.session && req.session.currentUser) {
        res.header('P3P', 'CP="CURa ADMa DEVa PSAo PSDoOUR BUS UNI PUR INT DEM STA PRE COM NAV OTC NOI DSP  COR"');
        req.currentUser = _.clone(req.session.currentUser);
        return next();
      } else if (token) {
        OauthToken.findOne({ accessToken: token }, (err, token) => {
          if (err || !token || token.createdAt + token.expireIn * 1000 < now) {
            next();
          } else {
            this.getUser(token.userId, (err, user) => {
              if (user) {
                req.currentUser = user;
              }
              return next();
            });
          }
        });
      } else {
        if (url.pathname !== authPath) {
          return next();
        }
        let type = req.body.type || req.query.type;
        let body = req.body || {};
        res.header('P3P', 'CP="CURa ADMa DEVa PSAo PSDoOUR BUS UNI PUR INT DEM STA PRE COM NAV OTC NOI DSP  COR"');
        if (type === 'refresh_token') {
          OauthToken.findOne({ refreshToken: body.refreshToken }, (err, token) => {
            if (err || !token) {
              return sendJsonResponse(res, 403, 'Token not found');
            }
            if (token.createdAt + 60 * 24 * 3600 * 1000 < now) {
              token.remove(() => sendJsonResponse(res, 403, 'refreshToken expires'));
            } else {
              token.accessToken = uuid();
              token.save((err, token) => sendJsonResponse(res, err, token));
            }
          });
        } else {
          this.doAuth(body.userName, body.passwd, (err, user) => {
            if (err || !user) {
              return sendJsonResponse(res, 403, '账号或密码错误');
            }
            if (type === 'access_token') {
              token = new OauthToken({
                userId: user.userId,
                accessToken: uuid(),
                refreshToken: uuid(),
                expireIn: 7 * 24 * 3600
              });
              token.save((err, token) => sendJsonResponse(res, 403, err, token));
            } else {
              req.session.currentUser = user;
              return sendJsonResponse(res, null, user);
            }
          });
        }
      }
    };
  }

  doAuth(userName, passwd, callback) {
    let hash = hashedPassword(passwd);

    User.findOne({$or: [
      { userName: userName, passwd: hash },
      { phoneNumber: userName, passwd: hash }
    ]}, (err, user) => callback(err, user));
  }

  requireLogin() {
    return (req, res, next) => {
      if (req.currentUser) {
        return next();
      }
      return res.json({ err: 401, msg: 'Unauthorized' });
    };
  }

  requireAdmin() {
    return (req, res, next) => {
      if (req.currentUser && ~req.currentUser.roles.indexOf('admin')) {
        return next();
      }
      return res.json({ err: 401, msg: 'Unauthorized' });
    };
  }

  createJob(job, callback) {
    if (job.status !== 'Draft' && job.status !== 'Publish') {
      job.status = 'Draft';
    }
    let jobObj = new Job({
      userId: job.userId,
      title: job.title,
      summary: job.summary,
      salary: job.salary,
      payMethod: job.payMethod,
      requiredPeople: job.requiredPeople,
      status: job.status
    });
    jobObj.save((err, jobObj) => callback(err, jobObj));
  }

  publishJob(jobId, callback) {
    let query = { jobId: jobId, status: 'Draft' };
    Job.findOneAndUpdate(query, {status: 'Publish'}, (err, job) => callback(err, job));
  }

  finishJob(jobId, callback) {
    let query = { jobId: jobId, status: 'Publish' };
    Job.findOneAndUpdate(query, {status: 'Finish'}, (err, job) => callback(err, job));
  }

  deleteJob(jobId, callback) { // you can set job deleted on Draft or Finish
    let query = { jobId: jobId, status: { $in: [ 'Draft', 'Finish' ] }};
    Job.findOneAndUpdate(query, {status: 'Deleted'}, (err, job) => callback(err, job));
  }

  getJob(jobId, callback) {
    let query = { jobId: jobId, status: { $nin: [ 'Deleted' ] } };
    Job.findOne(query, (err, job) => callback(err, job));
  }

  getJobs(query, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    if (!options.sort) {
      options.sort = 'field -createdAt';
    }
    query = { $and: [ query, { status: { $nin: [ 'Deleted' ] } } ] };
    Job.find(query, null, options, callback);
  }

  assignMyJob(userId, jobId, callback) {
    let query = { userId: userId, jobId: jobId };
    MyJob.findOne(query, (err, myJob) => {
      if (err) {
        return callback(err);
      }
      if (myJob) {
        return callback(null, myJob);
      }
      myJob = new MyJob(query);
      myJob.save((err, myJob) => callback(err, myJob));
    });
  }

  leaveMyJob(userId, jobId, callback) {
    let query = { userId: userId, jobId: jobId, status: 'Join' };
    MyJob.findOneAndUpdate(query, {status: 'Leave'}, (err, myJob) => callback(err, myJob));
  }

  finishMyJob(userId, jobId, callback) {
    let query = { userId: userId, jobId: jobId, status: 'Join' };
    MyJob.findOneAndUpdate(query, {status: 'Finish'}, (err, myJob) => callback(err, myJob));
  }

  getMyJobs(userId, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    options = options || {};

    if (!options.sort) {
      options.sort = 'field -createdAt';
    }

    let query = { userId: userId };
    if (options.status) {
      query.status = options.status;
      delete options.status;
    }
    MyJob.find(query, null, options, (err, myJobs) => {
      if (err) {
        callback(err);
      }
      let jobIds = myJobs.map((myJob) => myJob.jobId);
      Job.find({ jobId: { $in: jobIds } }, (err, jobs) => {
        if (err) {
          return callback(err);
        }

        myJobs = _.zipWith(myJobs, jobs, (myJob, job) => {
          myJob = myJob.toJSON();
          myJob.job = job.toJSON();
          return myJob;
        });

        callback(null, myJobs);
      });
    });
  }

  getJobWorkers(jobId, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    options = options || {};

    let query = { jobId: jobId };
    if (options.status) {
      query.status = options.status;
      delete options.status;
    }
    if (!options.sort) {
      options.sort = 'field -createdAt';
    }
    MyJob.find(query, null, options, (err, myJobs) => {
      if (err) {
        callback(err);
      }
      let userIds = myJobs.map((myJob) => myJob.userId);
      User.find({ userId: { $in: userIds } }, (err, users) => {
        if (err) {
          return callback(err);
        }

        myJobs = _.zipWith(myJobs, users, (myJob, user) => {
          myJob = myJob.toJSON();
          myJob.user = user.toJSON();
          return myJob;
        });

        callback(null, myJobs);
      });
    });
  }

  getPayment(jobId, userId, callback) {
    async.parallel({
      user: (done) => User.findOne({ userId }, (err, user) => done(err, user)),
      job: (done) => Job.findOne({ jobId }, (err, job) => done(err, job)),
      myJob: (done) => MyJob.findOne({ jobId, userId }, (err, myJob) => done(err, myJob))
    }, (err, result) => {
      if (err) {
        return callback(err);
      }
      let payment = result.myJob.toJSON();
      payment.job = result.job;
      payment.user = result.user;
      callback(null, payment);
    });
  }

  addRecord(record, callback) {
    async.waterfall([
      (next) => {
        MyJob.findOne({ jobId: record.jobId, userId: record.userId },
                      (err, myJob) => next(err, myJob));
      },
      (myJob, next) => {
        if (myJob.status === 'Leave') {
          return next('User: is leave this job.');
        }

        Job.findOne({ jobId: record.jobId }, (err, job) => next(err, job));
      },
      (job, next) => {
        if (job.status === 'Deleted') {
          return next('Job: ' + job.title + ' is Deleted');
        }

        let rec = {
          userId: record.userId,
          jobId: record.jobId,
          salary: job.salary * record.recordNumber,
          recordNumber: record.recordNumber
        };

        let seqName = 'record-' + record.userId + '-' + record.jobId;
        Sequence.next(seqName, (err, seq) => {
          let recObj = new WorkRecord(rec);
          recObj.seq = seq;
          recObj.save((err, rec) => next(err, rec));
        });
      },

      (rec, next) => {
        async.parallel([
          (done) => {
            User.findOneAndUpdate({ userId: record.userId },
                                  { $inc: { unpaid: rec.salary, totalSalary: rec.salary } },
                                  (err) => done(err));
          },
          (done) => {
            MyJob.findOneAndUpdate({ userId: record.userId, jobId: record.jobId },
                                  { $inc: { unpaid: rec.salary, totalSalary: rec.salary } },
                                  (err) => done(err));
          }
        ], () => next(null, rec));
      }
    ], callback);
  }

  cancelRecord(recordId, callback) {
    let query = {
      recordId: recordId,
      status: 'Unpaid'
    };
    async.waterfall([
      (next) => WorkRecord.findOne(query, (err, rec) => next(err, rec)),
      (rec, next) => {
        if (rec.status === 'Unpaid') {
          return next('该记录以被支付了');
        }
        if (new Date() - rec.createdAt < 30 * 60 * 1000) {
          return next('无法取消超过 30 分钟的记录');
        }
        async.parallel([
          (done) => {
            User.findOneAndUpdate({ userId: rec.userId },
                                  { $dec: { unpaid: rec.salary, totalSalary: rec.salary } },
                                  (err) => done(err));
          },
          (done) => {
            MyJob.findOneAndUpdate({ userId: rec.userId, jobId: rec.jobId },
                                  { $dec: { unpaid: rec.salary, totalSalary: rec.salary } },
                                  (err) => done(err));
          }
        ], () => next(null, rec));
      },
      (rec, next) => {
        this.updateRecord(recordId, 'Cancel', next);
      }
    ], callback);
  }

  updateRecord(recordId, status, callback) {
    let query = {
      recordId: recordId,
      status: 'Unpaid'
    };
    WorkRecord.findOneAndUpdate(query, { status: status },
                                (err, record) => callback(err, record));
  }

  getRecord(recordId, callback) {
    WorkRecord.findOne({ recordId: recordId },
                       (err, record) => callback(err, record));
  }

  getRecordByUser(userId, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    options = options || {};

    let query = { userId: userId };
    if (options.status) {
      query.status = options.status;
      delete options.status;
    }
    if (options.jobId) {
      query.jobId = options.jobId;
      delete options.jobId;
    }
    if (!options.sort) {
      options.sort = 'field -createdAt';
    }
    WorkRecord.find(query, null, options, (err, records) => {
      if (err) {
        callback(err);
      }
      let jobIds = _.compact(records.map((record) => record.jobId));
      Job.find({ jobId: { $in: jobIds } }, (err, jobs) => {
        if (err) {
          return callback(err);
        }

        records = records.map((record) => {
          record = record.toJSON();
          record.job = _.filter(jobs, (job) => job.jobId === record.jobId)[0];
          return record;
        });

        callback(null, records);
      });
    });
  }

  getRecordByJob(jobId, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    options = options || {};

    let query = { jobId: jobId };
    if (options.status) {
      query.status = options.status;
      delete options.status;
    }
    if (options.userId) {
      query.userId = options.userId;
      delete options.userId;
    }
    if (!options.sort) {
      options.sort = 'field -createdAt';
    }
    WorkRecord.find(query, null, options, (err, records) => {
      if (err) {
        callback(err);
      }
      let userIds = _.compact(records.map((record) => record.userId));
      User.find({ userId: { $in: userIds } }, (err, users) => {
        if (err) {
          return callback(err);
        }

        records = records.map((record) => {
          record = record.toJSON();
          record.user = _.filter(users, (user) => user.userId === record.userId)[0];
          return record;
        });

        callback(null, records);
      });
    });
  }

  payOffline(id, money, callback) {
    let context = {};
    function errRecover() {
      let myJob = context.myJob;
      async.waterfall([
        (next) => {
          if (context.user) {
            User.findOneAndUpdate({ userId: myJob.userId },
                                  { $inc: { unpaid: money }, $dec: { paidOffline: money } },
                                  (err) => next(err));

          } else {
            next();
          }
        },
        (next) => {
          if (!context.updatedMyJob) {
            return next();
          }
          MyJob.findOneAndUpdate({ id: id },
                                 { $inc: { unpaid: money }, $dec: { paidOffline: money },
                                   remainMoney: myJob.remainMoney, recordNumber: context.recordNumber },
                                 (err) => next(err));

        },
        (next) => {
          WorkRecord.findAndUpdate({ recordId: { $in: context.paidRecs } },
                                   { status: 'Unpaid' },
                                   (err) => next(err));

        }
      ], (err) => {
        callback('paidOffline and recover: ' + err.toString());
      });
    }
    async.waterfall([
      (next) => MyJob.find({ id: id }, (err, myJob) => next(err, myJob)),
      (myJob, next) => {
        if (myJob.Unpaid < money) {
          next('Too more money to pay, pleace check.');
        } else {
          context.myJob = myJob;
          this.getJob(myJob.jobId, next);
        }
      },
      (job, next) => {
        context.job = job;
        let needMore = 1;
        function wantPayLoop() {
          let wantPay = money + job.remainMoney;
          let limit = Math.floor(wantPay / job) + needMore;
          let query = { userId: context.myJob.userId, jobId: context.myJob.jobId, status: 'Unpaid' };
          let options = { sort: 'field +seq', limit: limit };
          WorkRecord.find(query, null, options, (err, recs) => {
            if (err) {
              return next(err);
            }
            let paidRecs = [];
            _.each(recs, (rec) => {
              wantPay = wantPay - rec.salary;
              if (wantPay >= 0) {
                paidRecs.push(rec.recordId);
              }
            });
            if (wantPay > job.salary && paidRecs.length === recs.length && limit === recs) {
              needMore += 10;
              wantPayLoop();
            } else {
              context.remainMoney = wantPay;
              next(null, paidRecs);
            }
          });
        }
        wantPayLoop();
      },
      (paidRecs, next) => {
        context.paidRecs = paidRecs;
        WorkRecord.findAndUpdate({ recordId: { $in: paidRecs } },
                                 { status: 'PaidOffline' },
                                 (err, recs) => next(err, recs));
      },
      (recs, next) => {
        let recordNumber = recs.reduce((sum, rec) => sum + rec.recordNumber);
        context.recordNumber = recordNumber;
        MyJob.findOneAndUpdate({ id: id },
                               { $dec: { unpaid: money, recordNumber: recordNumber }, $inc: { paidOffline: money },
                                 remainMoney: context.remainMoney },
                               (err, myJob) => next(err, myJob));
      },
      (myJob, next) => {
        context.updatedMyJob = myJob;
        User.findOneAndUpdate({ userId: myJob.userId },
                              { $dec: { unpaid: money }, $inc: { paidOffline: money } },
                              (err, user) => next(err, user));
      },
      (user, next) => {
        context.user = user;
        next();
      }
    ], (err) => {
      if (err) {
        return errRecover();
      } else {
        callback(null, {
          paidRecords: context.paidRecs,
          remainMoney: context.remainMoney,
          worker: context.updatedMyJob });
      }
    });
  }

}
