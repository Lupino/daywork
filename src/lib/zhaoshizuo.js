import async from 'async';
import crypto from 'crypto';
import { parse as urlParse } from 'url';
import _ from 'lodash';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import {
  User,
  File,
  OauthToken,
  Job,
  MyJob,
  WorkRecord,
  Sequence,
  PaidRecord,
  Favorite,
  Message,
  Service,
  JobCategory,
  ServiceCategory,
  City,
  ServiceOrder
} from './models';
import { sendJsonResponse } from './util';
import { uploadPath } from '../config';
import {
  wrapperAddRecordCallback,
  wrapperCancelRecordCallback,
  wrapperPaidRecordCallback,
  wrapperRequestJobCallback,
  wrapperJoinJobCallback
} from './message_client';

import { wapperIndexJobCallback, wapperIndexServiceCallback } from './search';

const passwordSalt = 'IW~#$@Asfk%*(skaADfd3#f@13l!sa9';

export function hashedPassword(rawPassword) {
  return crypto.createHmac('sha1', passwordSalt).update(rawPassword).digest('hex');
}

function toMap(data) {
  let map = {};
  const len = data.length;
  for (let i = 0; i < len ; i ++) {
    map[data[i][0]] = data[i][1];
  }
  return map;
}

export default class {

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
          phoneVerified: user.phoneVerified || false,
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

  getUsers(query, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    options = options || {};

    if (!options.sort) {
      options.sort = 'field -createdAt';
    }
    User.find(query, null, options, (err, users) => callback(err, users));
  }

  countUser(query, callback) {
    User.count(query, (err, counter) => callback(err, counter));
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
      fs.rename(file.path, uploadPath + '/' + file.hash, (err) => {
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
      if (url.pathname === authPath) {
        token = false;
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
              if (req.session) {
                req.session.currentUser = user;
              }
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
        if (req.currentUser.roles && ~req.currentUser.roles.indexOf('admin')) {
          req.isAdmin = true;
        }
        return next();
      }
      return res.json({ err: 401, msg: 'Unauthorized' });
    };
  }

  requireAdmin() {
    return (req, res, next) => {
      if (req.currentUser && req.currentUser.roles && ~req.currentUser.roles.indexOf('admin')) {
        return next();
      }
      return res.json({ err: 401, msg: 'Unauthorized' });
    };
  }

  createJob({ userId, title, summary, city, address, salary, payMethod, requiredPeople,
            category, image, status }, callback) {
    callback = wapperIndexJobCallback(callback);
    if (status !== 'Draft' && status !== 'Publish') {
      status = 'Draft';
    }
    let jobObj = new Job({
      userId, title, summary, city, address, salary, payMethod, requiredPeople,
      status, category, image
    });
    jobObj.save((err, jobObj) => callback(err, jobObj));
  }

  publishJob(jobId, callback) {
    callback = wapperIndexJobCallback(callback);
    let query = { jobId: jobId, status: 'Draft' };
    Job.findOneAndUpdate(query, {status: 'Publish'}, (err, job) => callback(err, job));
  }

  finishJob(jobId, callback) {
    callback = wapperIndexJobCallback(callback);
    let query = { jobId: jobId, status: 'Publish' };
    Job.findOneAndUpdate(query, {status: 'Finish'}, (err, job) => callback(err, job));
  }

  deleteJob(jobId, callback) { // you can set job deleted on Draft or Finish
    callback = wapperIndexJobCallback(callback);
    let query = { jobId: jobId, status: { $in: [ 'Draft', 'Finish' ] }};
    Job.findOneAndUpdate(query, {status: 'Deleted'}, (err, job) => callback(err, job));
  }

  updateJob(jobId, job, callback) {
    callback = wapperIndexJobCallback(callback);
    let updated = {};
    ['title', 'summary', 'status', 'image', 'category', 'city', 'address'].forEach(key => {
      if (job[key]) {
        updated[key] = job[key];
      }
    });
    if (updated.status && (updated.status !== 'Draft' || updated.status !== 'Publish')) {
      delete updated.status;
    }
    Job.findOneAndUpdate({ jobId }, updated, (err, job) => callback(err, job));
  }

  getJob(jobId, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    let query = { jobId: jobId, status: { $nin: [ 'Deleted' ] } };
    Job.findOne(query, (err, job) => {
      if (err) return callback(err);
      if (!job) {
        return callback(null, job);
      }
      let self = this;
      async.parallel({
        user(done) {
          if (!options.user) { return done(); }
          self.getUser(job.userId, done);
        },
        favorited(done) {
          if (!options.favorited) { return done(); }
          const userId = options.favorited;
          Favorite.findOne({ userId, jobId }, (err, fav) => done(err, fav? true : false));
        },
        requested(done) {
          if (!options.requested) return done();
          let userId = options.requested;
          MyJob.findOne({ userId, jobId }, (err, myJob) => done(err, myJob));
        }
      }, (err, result) => {
        if (err) return callback(err);
        job = job.toJSON();
        if (options.user) {
          job.user = result.user;
        }
        if (options.favorited) {
          job.favorited = result.favorited;
        }
        if (options.requested) {
          const userId = options.requested;
          if (job.userId === userId) {
            job.isOwner = true;
          } else {
            job.isOwner = false;
          }
          const req = result.requested;
          if (req) {
            job.requested = true;
            if (req.status === 'Join') {
              job.work = true;
            } else {
              job.work = false;
            }
          } else {
            job.requested = false;
            job.work = false;
          }
        }
        callback(null, job);
      });
    });
  }

  getJobs(query, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    if (!options.sort) {
      options.sort = 'field -createdAt';
    }
    let extra = options.extra || null;
    if (options.extra) {
      delete options.extra;
    }
    query = { $and: [ query, { status: { $nin: [ 'Deleted' ] } } ] };
    Job.find(query, null, options, (err, jobs) => {
      if (err) {
        return callback(err);
      }
      if (!extra) {
        return callback(null, jobs);
      }
      async.parallel({
        users(done) {
          if (!extra.user) return done();
          let userIds = _.uniq(jobs.map(job => job.userId));
          User.find({ userId: { $in: userIds } }, (err, users) => done(err, users));
        },
        favs(done) {
          if (!extra.favorited) return done();
          let userId = extra.favorited;
          let jobIds = _.uniq(_.compact(jobs.map(job => job.jobId)));
          Favorite.find({ userId: userId, jobId: { $in: jobIds } }, (err, favs) => done(err, favs));
        },
        reqs(done) {
          if (!extra.requested) return done();
          let userId = extra.requested;
          let jobIds = _.uniq(_.compact(jobs.map(job => job.jobId)));
          MyJob.find({ userId: userId, jobId: { $in: jobIds } }, (err, myJobs) => done(err, myJobs));
        }
      }, (err, result) => {
        if (err) {
          return callback(err);
        }
        result.users = result.users || [];
        result.favs = result.favs || [];
        result.reqs = result.reqs || [];
        let userMap = toMap(result.users.map(user => [user.userId, user]));
        let favMap = toMap(result.favs.map(fav => [fav.jobId, true]));
        let reqMap = toMap(result.reqs.map(req => [req.jobId, req]));
        jobs = jobs.map((job) => {
          job = job.toJSON();
          if (extra.user) {
            job.user = userMap[job.userId];
          }
          if (extra.favorited) {
            job.favorited = favMap[job.jobId];
          }
          if (extra.requested) {
            const userId = extra.requested;
            if (job.userId === userId) {
              job.isOwner = true;
            } else {
              job.isOwner = false;
            }
            const req = reqMap[job.jobId];
            if (req) {
              job.requested = true;
              if (req.status === 'Join') {
                job.work = true;
              } else {
                job.work = false;
              }
            } else {
              job.requested = false;
              job.work = false;
            }
          }
          return job;
        });
        callback(null, jobs);
      });
    });
  }

  countJob(query, callback) {
    query = { $and: [ query, { status: { $nin: [ 'Deleted' ] } } ] };
    Job.count(query, (err, counter) => callback(err, counter));
  }

  requestMyJob(jobId, userId, callback) {
    let query = { userId: userId, jobId: jobId };
    callback = wrapperRequestJobCallback(callback);
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

  assignMyJob(userId, jobId, callback) {
    let query = { userId: userId, jobId: jobId };
    callback = wrapperJoinJobCallback(callback);
    MyJob.findOne(query, (err, myJob) => {
      if (err) {
        return callback(err);
      }
      if (!myJob) {
        myJob = new MyJob(query);
        myJob.status = 'Join';
      }
      if (myJob.status === 'Request') {
        myJob.status = 'Join';
      }
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

        const userIds = _.uniq(jobs.map(({ userId }) => userId));
        User.find({ userId: { $in: userIds } }, (err, users) => {
          if (err) {
            return callback(err);
          }
          const jobMap = toMap(jobs.map(job => [job.jobId, job.toJSON()]));
          const userMap = toMap(users.map(user => [user.userId, user.toJSON()]));
          myJobs = myJobs.map((myJob) => {
            myJob = myJob.toJSON();
            myJob.job = jobMap[myJob.jobId];
            myJob.job.user = userMap[myJob.job.userId];
            return myJob;
          });
          callback(null, myJobs);
        });
      });
    });
  }

  getWork({userId, jobId}, callback) {
    MyJob.findOne({ userId, jobId }, (err, work) => {
      if (err) return callback(err);
      work = work.toJSON();
      this.getJob(jobId, { user: true }, (err, job) => {
        if (err) return callback(err);
        work.job = job;
        callback(null, work);
      });
    });
  }

  getWorker({userId, jobId}, callback) {
    MyJob.findOne({ userId, jobId }, (err, worker) => {
      if (err) return callback(err);
      worker = worker.toJSON();
      this.getUser(userId, (err, user) => {
        if (err) return callback(err);
        worker.user = user;
        callback(null, worker);
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

        let userMap = toMap(users.map(user => [user.userId, user]));

        myJobs = myJobs.map(myJob => {
          myJob = myJob.toJSON();
          myJob.user = userMap[myJob.userId];
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
    callback = wrapperAddRecordCallback(callback);
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
                                  { $inc: { unpaid: rec.salary, totalSalary: rec.salary,
                                    recordNumber: rec.recordNumber } },
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
    callback = wrapperCancelRecordCallback(callback);
    async.waterfall([
      (next) => WorkRecord.findOne(query, (err, rec) => next(err, rec)),
      (rec, next) => {
        if (rec.status !== 'Unpaid') {
          return next('该记录以被支付了');
        }
        if (new Date() - rec.createdAt > 30 * 60 * 1000) {
          return next('无法取消超过 30 分钟的记录');
        }
        async.parallel([
          (done) => {
            User.findOneAndUpdate({ userId: rec.userId },
                                  { $inc: { unpaid: -rec.salary, totalSalary: -rec.salary } },
                                  (err) => done(err));
          },
          (done) => {
            MyJob.findOneAndUpdate({ userId: rec.userId, jobId: rec.jobId },
                                  { $inc: { unpaid: -rec.salary, totalSalary: -rec.salary,
                                    recordNumber: - rec.recordNumber } },
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

  getRecord(recordId, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    let self = this;
    WorkRecord.findOne({ recordId: recordId },
                       (err, record) => {
                         if (err) return callback(err);
                         let { userId, jobId } = record;
                         async.parallel({
                           user(done) {
                             if (!options.user) return done();
                             self.getUser(userId, done);
                           },
                           job(done) {
                             if (!options.job) return done();
                             self.getJob(jobId, { user: true }, done);
                           }
                         }, (err, result) => {
                           if (err) return callback(err);
                           record = record.toJSON();
                           record.user = result.user;
                           record.job = result.job;
                           callback(null, record);
                         });
                       });
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
    } else {
      query.status = { $nin: [ 'Cancel' ] };
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
    } else {
      query.status = { $nin: [ 'Cancel' ] };
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
    callback = wrapperPaidRecordCallback(callback);
    function errRecover() {
      let myJob = context.myJob;
      async.waterfall([
        (next) => {
          if (context.user) {
            User.findOneAndUpdate({ userId: myJob.userId },
                                  { $inc: { unpaid: money, paidOffline: - money } },
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
                                 { $inc: { unpaid: money, recordNumber: context.recordNumber,  paidOffline: - money },
                                   remainMoney: myJob.remainMoney },
                                 (err) => next(err));

        },
        (next) => {
          async.eachLimit(context.paidRecs, 4,
                          (recordId, done) => WorkRecord.findOneAndUpdate({ recordId },
                                                                          { status: 'Unpaid' },
                                                                          (err) => done(err)),
                          (err) => next(err));
        }
      ], (err) => {
        if (!err) {
          err = 'success';
        }
        callback('paidOffline and recover: ' + err);
      });
    }
    async.waterfall([
      (next) => MyJob.findOne({ id: id }, (err, myJob) => next(err, myJob)),
      (myJob, next) => {
        if (myJob.unpaid < money) {
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
          let wantPay = money + context.myJob.remainMoney;
          let limit = Math.floor(wantPay / job.salary) + needMore;
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
        async.eachLimit(paidRecs, 4,
                        (recordId, done) => WorkRecord.findOneAndUpdate({ recordId },
                                                                        { status: 'PaidOffline' },
                                                                        (err) => done(err)),
                        (err) => next(err, paidRecs));
      },
      (paidRecs, next) => {
        WorkRecord.find({ recordId: { $in: paidRecs } }, (err, recs) => next(err, recs));
      },
      (recs, next) => {
        let recordNumber = _.sum(recs, 'recordNumber');
        context.recordNumber = recordNumber;
        MyJob.findOneAndUpdate({ id: id },
                               { $inc: { unpaid: - money, recordNumber: - recordNumber, paidOffline: money },
                                 remainMoney: context.remainMoney },
                               (err, myJob) => next(err, myJob));
      },
      (myJob, next) => {
        context.updatedMyJob = myJob;
        User.findOneAndUpdate({ userId: myJob.userId },
                              { $inc: { unpaid: - money, paidOffline: money } },
                              (err, user) => next(err, user));
      },
      (user, next) => {
        context.user = user;
        let myJob = context.myJob;
        let prec = new PaidRecord({
          jobId: myJob.jobId,
          userId: myJob.userId,
          money: money,
          payMethod: 'PaidOffline'
        });
        Sequence.next('paid-record-'+myJob.id, (_, seq) => {
          prec.seq = seq;
          prec.save((err, prec) => next(err, prec));
        });
      }
    ], (err, prec) => {
      if (err) {
        if (context.paidRecs) {
          return errRecover();
        }
        return callback(err);
      } else {
        callback(null, {
          workRecords: context.paidRecs,
          paidRecord: prec,
          remainMoney: context.remainMoney,
          worker: context.updatedMyJob });
      }
    });
  }

  payOnline(id, money, callback) {
    let context = {};
    callback = wrapperPaidRecordCallback(callback);
    function errRecover() {
      let myJob = context.myJob;
      async.waterfall([
        (next) => {
          if (context.jobUser) {
            User.findOneAndUpdate({ userId: context.jobUser.userId },
                                  { $inc: { remainMoney: money } },
                                  (err) => next(err));

          } else {
            next();
          }
        },
        (next) => {
          if (context.user) {
            User.findOneAndUpdate({ userId: myJob.userId },
                                  { $inc: { unpaid: money, paidOnline: - money, remainMoney: - money } },
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
                                 { $inc: { unpaid: money, recordNumber: context.recordNumber,  paidOnline: - money },
                                   remainMoney: myJob.remainMoney },
                                 (err) => next(err));

        },
        (next) => {
          async.eachLimit(context.paidRecs, 4,
                          (recordId, done) => WorkRecord.findOneAndUpdate({ recordId },
                                                                          { status: 'Unpaid' },
                                                                          (err) => done(err)),
                          (err) => next(err));
        }
      ], (err) => {
        if (!err) {
          err = 'success';
        }
        callback('paidOnline and recover: ' + err);
      });
    }
    async.waterfall([
      (next) => MyJob.findOne({ id: id }, (err, myJob) => next(err, myJob)),
      (myJob, next) => {
        if (myJob.unpaid < money) {
          next('Too more money to pay, pleace check.');
        } else {
          context.myJob = myJob;
          this.getJob(myJob.jobId, { user: true }, next);
        }
      },
      (job, next) => {
        if (job.user.remainMoney < money) {
          return next('Not enought remainMoney.');
        }
        context.job = job;
        let needMore = 1;
        function wantPayLoop() {
          let wantPay = money + context.myJob.remainMoney;
          let limit = Math.floor(wantPay / job.salary) + needMore;
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
        async.eachLimit(paidRecs, 4,
                        (recordId, done) => WorkRecord.findOneAndUpdate({ recordId },
                                                                        { status: 'PaidOnline' },
                                                                        (err) => done(err)),
                        (err) => next(err, paidRecs));
      },
      (paidRecs, next) => {
        WorkRecord.find({ recordId: { $in: paidRecs } }, (err, recs) => next(err, recs));
      },
      (recs, next) => {
        let recordNumber = _.sum(recs, 'recordNumber');
        context.recordNumber = recordNumber;
        MyJob.findOneAndUpdate({ id: id },
                               { $inc: { unpaid: - money, recordNumber: - recordNumber, paidOnline: money },
                                 remainMoney: context.remainMoney },
                               (err, myJob) => next(err, myJob));
      },
      (myJob, next) => {
        context.updatedMyJob = myJob;
        User.findOneAndUpdate({ userId: myJob.userId },
                              { $inc: { unpaid: - money, paidOnline: money, remainMoney: money } },
                              (err, user) => next(err, user));
      },
      (user, next) => {
        context.user = user;
        User.findOneAndUpdate({ userId: context.job.userId },
                              { $inc: { remainMoney: - money } },
                              (err, user) => next(err, user));
      },
      (user, next) => {
        context.jobUser = user;
        let myJob = context.myJob;
        let prec = new PaidRecord({
          jobId: myJob.jobId,
          userId: myJob.userId,
          money: money,
          payMethod: 'PaidOnline'
        });
        Sequence.next('paid-record-'+myJob.id, (_, seq) => {
          prec.seq = seq;
          prec.save((err, prec) => next(err, prec));
        });
      }
    ], (err, prec) => {
      if (err) {
        if (context.paidRecs) {
          return errRecover();
        }
        return callback(err);
      } else {
        callback(null, {
          workRecords: context.paidRecs,
          paidRecord: prec,
          remainMoney: context.remainMoney,
          worker: context.updatedMyJob });
      }
    });
  }

  favorite({ userId, jobId, serviceId }, callback) {
    let query = { userId, jobId, serviceId };
    console.log(query);
    Favorite.findOne(query, (err, favorte) => {
      if (err) {
        return callback(err);
      }
      if (favorte) {
        return callback(null, favorte);
      }
      favorte = new Favorite(query);
      favorte.save((err, favorte) => callback(err, favorte));
    });
  }

  unfavorite({ userId, jobId, serviceId }, callback) {
    let query = { userId, jobId, serviceId };
    console.log(query);
    Favorite.findOneAndRemove(query, (err, favorte) => callback(err, favorte));
  }

  addMessage({ userId, message, createdAt }, callback) {
    let msg = new Message({ userId, message, createdAt });
    msg.save((err, msg) => callback(err, msg));
  }
  getMessages(userId, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    if (!options.sort) {
      options.sort = 'field -createdAt';
    }

    let self = this;

    Message.find({ userId }, null, options, (err, messages) => {
      async.map(messages, (msg, done) => {
        let { message } = msg;
        let { content, type } = message;
        async.parallel({
          addRecord(done) {
            if (type !== 'addRecord') return done();
            let { recordId } = content;
            self.getRecord(recordId, { job: true }, done);
          },
          cancelRecord(done) {
            if (type !== 'cancelRecord') return done();
            let { recordId } = content;
            self.getRecord(recordId, { job: true }, done);
          },
          paidRecord(done) {
            if (type !== 'paidRecord') return done();
            let { recordId } = content;
            PaidRecord.findOne({ recordId }, (err, prec) => {
              if (err) return done(err);
              self.getJob(prec.jobId, { user: true }, (err, job) => {
                if (err) return done(err);
                prec = prec.toJSON();
                prec.job = job;
                done(null, prec);
              });
            });
          },
          requestJob(done) {
            if (type !== 'requestJob') return done();
            let { jobId, userId } = content;
            async.parallel({
              job(done) {
                self.getJob(jobId, done);
              },
              user(done) {
                self.getUser(userId, done);
              }
            }, done);
          },
          joinJob(done) {
            if (type !== 'joinJob') return done();
            let { jobId } = content;
            self.getJob(jobId, { user: true }, done);
          }
        }, (err, result) => {
          if (err) {
            return done(err);
          }
          msg.message[type] = result[type];
          done(null, msg);
        });
      }, callback);
    });
  }

  // service
  createService({ userId, title, summary, price, unit, status, category, image, city, address }, callback) {
    callback = wapperIndexServiceCallback(callback);
    if (status !== 'Draft' && status !== 'Publish') {
      status = 'Draft';
    }
    let serviceObj = new Service({
      userId, title, summary, price, unit, status, category, image, city, address
    });
    serviceObj.save((err, serviceObj) => callback(err, serviceObj));
  }

  publishService(serviceId, callback) {
    callback = wapperIndexServiceCallback(callback);
    let query = { serviceId: serviceId, status: 'Draft' };
    Service.findOneAndUpdate(query, {status: 'Publish'}, (err, service) => callback(err, service));
  }

  finishService(serviceId, callback) {
    callback = wapperIndexServiceCallback(callback);
    let query = { serviceId: serviceId, status: 'Publish' };
    Service.findOneAndUpdate(query, {status: 'Finish'}, (err, service) => callback(err, service));
  }

  deleteService(serviceId, callback) { // you can set service deleted on Draft or Finish
    callback = wapperIndexServiceCallback(callback);
    let query = { serviceId: serviceId, status: { $in: [ 'Draft', 'Finish' ] }};
    Service.findOneAndUpdate(query, {status: 'Deleted'}, (err, service) => callback(err, service));
  }

  updateService(serviceId, service, callback) {
    callback = wapperIndexServiceCallback(callback);
    let updated = {};
    ['title', 'summary', 'status', 'image', 'category', 'city', 'address'].forEach(key => {
      if (service[key]) {
        updated[key] = service[key];
      }
    });
    if (updated.status && (updated.status !== 'Draft' || updated.status !== 'Publish')) {
      delete updated.status;
    }
    Service.findOneAndUpdate({ serviceId }, updated, (err, service) => callback(err, service));
  }

  getService(serviceId, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    let query = { serviceId: serviceId, status: { $nin: [ 'Deleted' ] } };
    Service.findOne(query, (err, service) => {
      if (err) return callback(err);
      if (!service) {
        return callback(null, service);
      }
      let self = this;
      async.parallel({
        user(done) {
          if (!options.user) { return done(); }
          self.getUser(service.userId, done);
        },
        favorited(done) {
          if (!options.favorited) { return done(); }
          const userId = options.favorited;
          Favorite.findOne({ userId, serviceId }, (err, fav) => done(err, fav? true : false));
        }
      }, (err, result) => {
        if (err) return callback(err);
        service = service.toJSON();
        if (options.user) {
          service.user = result.user;
        }
        if (options.favorited) {
          service.favorited = result.favorited;
        }
        callback(null, service);
      });
    });
  }

  getServices(query, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    if (!options.sort) {
      options.sort = 'field -createdAt';
    }
    let extra = options.extra || null;
    if (options.extra) {
      delete options.extra;
    }
    query = { $and: [ query, { status: { $nin: [ 'Deleted' ] } } ] };
    Service.find(query, null, options, (err, services) => {
      if (err) {
        return callback(err);
      }
      if (!extra) {
        return callback(null, services);
      }
      async.parallel({
        users(done) {
          if (!extra.user) return done();
          let userIds = _.uniq(services.map(service => service.userId));
          User.find({ userId: { $in: userIds } }, (err, users) => done(err, users));
        },
        favs(done) {
          if (!extra.favorited) return done();
          let userId = extra.favorited;
          let serviceIds = _.uniq(_.compact(services.map(service => service.serviceId)));
          Favorite.find({ userId: userId, serviceId: { $in: serviceIds } }, (err, favs) => done(err, favs));
        }
      }, (err, result) => {
        if (err) {
          return callback(err);
        }
        result.users = result.users || [];
        result.favs = result.favs || [];
        let userMap = toMap(result.users.map(user => [user.userId, user]));
        let favMap = toMap(result.favs.map(fav => [fav.serviceId, true]));
        services = services.map((service) => {
          service = service.toJSON();
          if (extra.user) {
            service.user = userMap[service.userId];
          }
          if (extra.favorited) {
            service.favorited = favMap[service.serviceId];
          }
          return service;
        });
        callback(null, services);
      });
    });
  }

  countService(query, callback) {
    query = { $and: [ query, { status: { $nin: [ 'Deleted' ] } } ] };
    Service.count(query, (err, counter) => callback(err, counter));
  }

  addCity({ cityName, cityId }, callback) {
    let cityObj = new City({ cityName, cityId });
    cityObj.save((err, cityObj) => callback(err, cityObj));
  }

  updateCity({ cityId, cityName }, callback) {
    City.findOneAndUpdate({ cityId }, { cityName }, callback);
  }

  getCities(callback) {
    City.find({}, (err, cities) => callback(err, cities));
  }

  getCity(cityId, callback) {
    City.findOne({ cityId }, (err, city) => callback(err, city));
  }

  addCategory({ categoryId, categoryName, categoryType, icon }, callback) {
    const Category = categoryType === 'job' ? JobCategory : ServiceCategory;
    let categoryObj = new Category({ categoryName, categoryId, icon });
    categoryObj.save((err, categoryObj) => callback(err, categoryObj));
  }

  updateCategory({ categoryId, categoryName, categoryType, icon }, callback) {
    const Category = categoryType === 'job' ? JobCategory : ServiceCategory;
    Category.findOneAndUpdate({ categoryId }, { categoryName, icon }, callback);
  }

  getCategories(categoryType, callback) {
    const Category = categoryType === 'job' ? JobCategory : ServiceCategory;
    Category.find({}, (err, categories) => callback(err, categories));
  }

  getCategory({ categoryType, categoryId }, callback) {
    const Category = categoryType === 'job' ? JobCategory : ServiceCategory;
    Category.findOne({ categoryId }, (err, category) => callback(err, category));
  }

  createServiceOrder({ userId, serviceId, amount, summary }, callback) {
    const self = this;
    async.waterfall([
      (next) => {
        self.getService(serviceId, next);
      },
      (service, next) => {
        if (!service) {
          return next('service not exists.');
        }

        if (service.status !== 'Publish') {
          return next('service is not on publish');
        }
        const serviceUserId = service.userId;
        const price = service.price * amount;
        const order = new ServiceOrder( {
          userId,
          serviceId,
          serviceUserId,
          amount,
          price,
          summary,
          status: 'Unpaid'
        } );

        order.save((err, o) => next(err, o));
      }
    ], callback);

  }

  payServiceOrder(id, callback) {
    const self = this;
    const ctx = {};
    function errRecover(err) {
      const order = ctx.order;
      async.parallel([
        (done) => {
          if (!ctx.step0) return done();
          User.findOneAndUpdate({ userId: order.userId },
                                { $inc: { remainMoney: order.price } },
                                (err, u) => done());
        },
        (done) => {
          if (!ctx.step1) return done();
          User.findOneAndUpdate({ userId: order.service.userId },
                                { $inc: { remainMoney: - order.price } },
                                (err, u) => next(err, order));

        }
      ], () => {
        callback(err);
      })
    }
    async.waterfall([
      (next) => {
        self.getServiceOrder(id, { user: true, service: true }, next);
      },
      (order, next) => {
        ctx.order = order;
        if (order.price > order.user.remainMoney) {
          return next('余额不足');
        }
        User.findOneAndUpdate({ userId: order.userId },
                              { $inc: { remainMoney: - order.price } },
                              (err, u) => next(err, order));
      },
      (order, next) => {
        ctx.step0 = true;
        User.findOneAndUpdate({ userId: order.service.userId },
                              { $inc: { remainMoney: order.price } },
                              (err, u) => next(err, order));
      },
      (order, next) => {
        ctx.step1 = true;
        ServiceOrder.findOneAndUpdate({ id }, { status: 'Paid' }, ( err, o ) => next(err, order));
      }
    ], (err, order) => {
      if (err) {
        return errRecover(err);
      }
      callback(null, order);
    });
  }

  cancelServiceOrder({ id, reason }, callback) {
    const self = this;
    async.waterfall([
      (next) => {
        self.getServiceOrder(id, { user: true, service: true }, next);
      },
      (order, next) => {
        if (order.status === 'Unpaid') {
          return next(null, order);
        }
        if (order.status === 'Paid') {
          async.parallel([
            (done) => {
              User.findOneAndUpdate({ userId: order.userId },
                                    { $inc: { remainMoney: order.price } },
                                    (err, u) => done());
            },
            (done) => {
              User.findOneAndUpdate({ userId: order.service.userId },
                                    { $inc: { remainMoney: - order.price } },
                                    (err, u) => next(err, order));

            }
          ], () => {
            next(null, order);
          })
          return;
        }
        next(null, order);
      },
      (order, next) => {
        ServiceOrder.findOneAndUpdate({ id }, { status: 'Cancel', reason }, ( err, o ) => next(err, order));
      }

    ], callback);
  }

  finishServiceOrder(id, callback) {
    ServiceOrder.findOneAndUpdate({ id }, { status: 'Finish' }, ( err, o ) => callback(err, o));
  }

  dealingServiceOrder(id, callback) {
    ServiceOrder.findOneAndUpdate({ id }, { status: 'Dealing' }, ( err, o ) => callback(err, o));
  }

  dealtServiceOrder(id, callback) {
    ServiceOrder.findOneAndUpdate({ id }, { status: 'Dealt' }, ( err, o ) => callback(err, o));
  }

  getServiceOrder(id, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    const self = this;
    options = options || {};
    ServiceOrder.findOne({ id }, (err, order) => {
      if (!order) return callback('Order not found.');
      async.parallel({
        user(done) {
          if (!options.user) { return done(); }
          self.getUser(order.userId, done);
        },
        service(done) {
          if (!options.service) return done();
          self.getService(order.serviceId, { user: true }, done)
        }
      }, (err, result) => {
        if (err) {
          return err;
        }
        order = order.toJSON();
        if (options.user) {
          order.user = result.user;
        }
        if (options.service) {
          order.service = result.service;
        }
        callback(null, order);
      });
    });
  }

  getServiceOrders(query, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    options = options || {};

    if (!options.sort) {
      options.sort = 'field -createdAt';
    }
    ServiceOrder.find(query, null, options, (err, orders) => {
      if (err) {
        return callback(err);
      }
      async.map(orders, (order, done) => {
        this.getServiceOrder(order.id, { user: true, service: true }, done)
      }, callback);
    });
  }

  getFavorites(query, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    options = options || {};

    if (!options.sort) {
      options.sort = 'field -createdAt';
    }

    Favorite.find(query, null, options, (err, favs) => callback(err, favs));
  }

  countFavorite(query, callback) {
    Favorite.count(query, (err, counter) => callback(err, counter));
  }
}
