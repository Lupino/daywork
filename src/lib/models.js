import mongoose, { Schema } from 'mongoose';
import { mongod } from '../config';
import { initialize, plugin as autoIncrPlugin } from './plugins';

let { Mixed } = Schema.Types;

mongoose.connect(mongod);
initialize(mongoose.connection);

var UserSchema = new Schema({
  userName: { type: String, index: { unique: true } },
  realName: String,
  sex: String,
  intro: String,
  phoneNumber: { type: String, index: { unique: true } },
  phoneVerified: { type: Boolean, default: false },
  passwd: String,
  avatar: Mixed,
  unpaid: { type: Number, default: 0 },
  paidOnline: { type: Number, default: 0 },
  paidOffline: { type: Number, default: 0 },
  totalSalary: { type: Number, default: 0 },
  remainMoney: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.plugin(autoIncrPlugin, { model: 'User', field: 'userId' });

export var User = mongoose.model('User', UserSchema);

export var OauthToken = mongoose.model('OauthToken', new Schema({
  userId: Number,
  accessToken: { type: String, index: { unique: true } },
  refreshToken: { type: String, index: { unique: true } },
  createdAt: { type: Date, default: Date.now },
  expireIn: { type: Number, default: 3600 * 24 * 7 }
}));

export var Sequence = mongoose.model('Sequence', new Schema({
  name: { type: String, index: { unique: true } },
  id: { type: Number, default: 0 }
}));

Sequence.next = function(name, callback) {
  Sequence.findOneAndUpdate({ name: name }, { $inc: { id: 1 } }, { new: true },
                            (err, seq) => {
                              if (seq && seq.id) {
                                return callback(err, seq.id);
                              }
                              seq = new Sequence({ name: name });
                              seq.save((err, seq) => callback(err, seq.id));
                            });
};

var JobSchema = new Schema({
  userId: { type: Number, index: true },
  title: String,
  summary: String,
  salary: Number,
  payMethod: { type: String, default: 'Daily' }, // Daily | Hourly
  requiredPeople: Number,
  status: { type: String, default: 'Draft' }, // Draft | Publish | Finish | Deleted
  createdAt: { type: Date, default: Date.now }
});

JobSchema.plugin(autoIncrPlugin, { model: 'Job', field: 'jobId' });

export var Job = mongoose.model('Job', JobSchema);

var WorkRecordSchema = new Schema({
  jobId: Number,
  userId: Number,
  seq: Number,
  salary: Number,
  recordNumber: { type: Number, default: 1 }, // salary = Job.salary * recordNumber
  status: { type: String, default: 'Unpaid' }, // PaidOnline | PaidOffline | Unpaid | Cancel
  createdAt: { type: Date, default: Date.now }
});

WorkRecordSchema.plugin(autoIncrPlugin, { model: 'WorkRecord', field: 'recordId' });

export var WorkRecord = mongoose.model('WorkRecord', WorkRecordSchema);

var PaidRecordSchema = new Schema({
  jobId: Number,
  userId: Number,
  seq: Number,
  payMethod: String, // PaidOnline | PaidOffline
  money: Number,
  createdAt: { type: Date, default: Date.now }
});

PaidRecordSchema.plugin(autoIncrPlugin, { model: 'PaidRecord', field: 'recordId' });

export var PaidRecord = mongoose.model('PaidRecord', PaidRecordSchema);

var MyJobSchema = new Schema({
  jobId: { type: Number, index: true },
  userId: { type: Number, index: true },
  status: { type: String, default: 'Join' }, // Join | Leave | Finish
  unpaid: { type: Number, default: 0 },
  paidOnline: { type: Number, default: 0 },
  paidOffline: { type: Number, default: 0 },
  totalSalary: { type: Number, default: 0 },
  remainMoney: { type: Number, default: 0 },
  recordNumber: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

MyJobSchema.plugin(autoIncrPlugin, { model: 'MyJob', field: 'id' });

export var MyJob = mongoose.model('MyJob', MyJobSchema);

var FileSchema = new Schema({
  key: { type: String, index: { unique: true } },
  extra: Mixed,
  createdAt: { type: Date, default: Date.now }
});

FileSchema.plugin(autoIncrPlugin, { model: 'File', field: 'id' });

export var File = mongoose.model('File', FileSchema);

var MessageSchema = new Schema({
  userId: Number,
  who: Number,
  message: Mixed,
  createdAt: { type: Date, default: Date.now }
});

MessageSchema.plugin(autoIncrPlugin, { model: 'Message', field: 'msgId' });

export var Message = mongoose.model('Message', MessageSchema);
