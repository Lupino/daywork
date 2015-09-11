import async from 'async';
import crypto from 'crypto';
import { parse as urlParse } from 'url';
import _ from 'lodash';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { User, File, OauthToken, Job, MyJob, WorkRecord, Sequence } from './models';

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
          { userName: user.userName },
          { phoneNumber: user.phoneNumber }
        ]}, (_, u) => next(u && 'userName or phoneNumber is already exists.' || null));
      },
      (next) => {
        var u = new User({
          userName: user.userName,
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
      user = user.toJSON();
      if (user.avatar) {
        user.avatar = JSON.parse(user.avatar);
      }
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

  upload(file, callback) {
    File.findOne({ key: file.hash }, (err, fileObj) => {
      if (fileObj) {
        return callback(null, fileObj.toJSON());
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
        token = req.param('access_token');
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
        let type = req.param('type');
        let body = req.body || {};
        res.header('P3P', 'CP="CURa ADMa DEVa PSAo PSDoOUR BUS UNI PUR INT DEM STA PRE COM NAV OTC NOI DSP  COR"');
        if (type === 'refresh_token') {
          OauthToken.findOne({ refreshToken: body.refreshToken }, (err, token) => {
            if (err || !token) {
              return res.json({ err: 403, msg: 'Token not found' });
            }
            if (token.createdAt + 60 * 24 * 3600 * 1000 < now) {
              token.remove(() => res.json({ err: 403, msg: 'refreshToken expires' }));
            } else {
              token.accessToken = uuid();
              token.save((err, token) => res.json(token.toJSON()));
            }
          });
        } else {
          this.doAuth(body.userName, body.passwd, (err, user) => {
            if (err || !user) {
              return res.json({ err: 403, msg: '账号或密码错误' });
            }
            if (type === 'access_token') {
              token = new OauthToken({
                userId: user.userId,
                accessToken: uuid(),
                refreshToken: uuid(),
                expireIn: 7 * 24 * 3600
              });
              token.save((err, token) => {
                if (err) {
                  return res.json({ err: 403, msg: '账号或密码错误' });
                }
                return res.json(token.toJSON());
              });
            } else {
              req.session.user = user;
              return res.json({ user: user });
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
      {phoneNumber: userName, passwd: hash}
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
    let jobObj = new Job({
      title: job.title,
      summary: job.summary,
      salary: job.salary,
      payMethod: job.payMethod,
      requiredPeople: job.requiredPeople,
      status: 'Draft'
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
    let query = { jobId: jobId, status: { $neq: 'Deleted' } };
    Job.findOne(query, (err, job) => callback(err, job));
  }

  getJobs(query, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    query = { $and: [ query, { status: { $neq: 'Deleted' } } ] };
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
      }
    ], callback);
  }

  updateRecord(record, callback) {
    let query = {
      jobId: record.jobId,
      userId: record.userId,
      status: 'Unpaid'
    };
    WorkRecord.findOneAndUpdate(query, {status: record.status},
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
    WorkRecord.find(query, null, options, (err, records) => {
      if (err) {
        callback(err);
      }
      let jobIds = records.map((record) => record.jobId);
      Job.find({ jobId: { $in: jobIds } }, (err, jobs) => {
        if (err) {
          return callback(err);
        }

        records = _.zipWith(records, jobs, (record, job) => {
          record = record.toJSON();
          record.job = job.toJSON();
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
    WorkRecord.find(query, null, options, (err, records) => {
      if (err) {
        callback(err);
      }
      let userIds = records.map((record) => record.userId);
      User.find({ userId: { $in: userIds } }, (err, users) => {
        if (err) {
          return callback(err);
        }

        records = _.zipWith(records, users, (record, user) => {
          record = record.toJSON();
          record.user = user.toJSON();
          return record;
        });

        callback(null, records);
      });
    });
  }

}
