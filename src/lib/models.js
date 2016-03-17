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
  unpaid: { type: Number, min: 0, default: 0 },
  paidOnline: { type: Number, min: 0, default: 0 },
  paidOffline: { type: Number, min: 0, default: 0 },
  totalSalary: { type: Number, min: 0, default: 0 },
  remainMoney: { type: Number, min: 0, default: 0 },
  freezeMoney: { type: Number, min: 0, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.plugin(autoIncrPlugin, { model: 'User', field: 'userId', startAt: 1 });

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
  city: String,
  address: String,
  salary: { type: Number, min: 0 },
  payMethod: { type: String, default: 'Daily' }, // Daily | Hourly
  requiredPeople: Number,
  status: { type: String, default: 'Draft' }, // Draft | Publish | Finish | Deleted
  image: Mixed,
  category: { type: String, index: true },
  createdAt: { type: Date, default: Date.now }
});

JobSchema.plugin(autoIncrPlugin, { model: 'Job', field: 'jobId', startAt: 1 });

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

WorkRecordSchema.plugin(autoIncrPlugin, { model: 'WorkRecord', field: 'recordId', startAt: 1 });

export var WorkRecord = mongoose.model('WorkRecord', WorkRecordSchema);

var PaidRecordSchema = new Schema({
  jobId: Number,
  userId: Number,
  seq: Number,
  payMethod: String, // PaidOnline | PaidOffline
  money: Number,
  createdAt: { type: Date, default: Date.now }
});

PaidRecordSchema.plugin(autoIncrPlugin, { model: 'PaidRecord', field: 'recordId', startAt: 1 });

export var PaidRecord = mongoose.model('PaidRecord', PaidRecordSchema);

var MyJobSchema = new Schema({
  jobId: { type: Number, index: true },
  userId: { type: Number, index: true },
  status: { type: String, default: 'Request' }, // Request | Join | Leave
  unpaid: { type: Number, min: 0, default: 0 },
  paidOnline: { type: Number, min: 0, default: 0 },
  paidOffline: { type: Number, min: 0, default: 0 },
  totalSalary: { type: Number, min: 0, default: 0 },
  remainMoney: { type: Number, min: 0, default: 0 },
  recordNumber: { type: Number, min: 0, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

MyJobSchema.plugin(autoIncrPlugin, { model: 'MyJob', field: 'id', startAt: 1 });

export var MyJob = mongoose.model('MyJob', MyJobSchema);

var FileSchema = new Schema({
  key: { type: String, index: { unique: true } },
  extra: Mixed,
  createdAt: { type: Date, default: Date.now }
});

FileSchema.plugin(autoIncrPlugin, { model: 'File', field: 'id', startAt: 1 });

export var File = mongoose.model('File', FileSchema);

var MessageSchema = new Schema({
  userId: Number,
  message: Mixed,
  createdAt: { type: Date, default: Date.now }
});

MessageSchema.plugin(autoIncrPlugin, { model: 'Message', field: 'msgId', startAt: 1 });

export var Message = mongoose.model('Message', MessageSchema);

var FavoriteSchema = new Schema({
  userId: Number,
  jobId: Number,
  createdAt: { type: Date, default: Date.now }
});

FavoriteSchema.plugin(autoIncrPlugin, { model: 'Favorite', field: 'id', startAt: 1 });

export var Favorite = mongoose.model('Favorite', FavoriteSchema);

var PaymentSchema = new Schema({
  userId: Number,
  subject: String,
  body: String,
  amount: { type: Number, min: 0 },
  order_no: { type: String, index: { unique: true } },
  channel: String,
  app: String,
  type: { type: String, index: true }, // charge, drawmoney
  rawId: { type: String, index: { unique: true } },
  raw: Mixed,
  status: { type: String, default: 'Unpaid', index: true }, // Unapid, Proc, Paid, Cancel
  createdAt: { type: Date, default: Date.now }
});

PaymentSchema.plugin(autoIncrPlugin, { model: 'Payment', field: 'id', startAt: 1 });

export var Payment = mongoose.model('Payment', PaymentSchema);

// service same like job
var ServiceSchema = new Schema({
  userId: { type: Number, index: true },
  title: String,
  summary: String,
  city: String,
  address: String,
  price: { type: Number, min: 0 },
  unit: { type: String },
  status: { type: String, default: 'Draft' }, // Draft | Publish | Finish | Deleted
  image: Mixed,
  category: { type: String, index: true },
  createdAt: { type: Date, default: Date.now }
});

ServiceSchema.plugin(autoIncrPlugin, { model: 'Service', field: 'serviceId', startAt: 1 });

export var Service = mongoose.model('Service', ServiceSchema);

var FavoriteServiceSchema = new Schema({
  userId: Number,
  serviceId: Number,
  createdAt: { type: Date, default: Date.now }
});

FavoriteServiceSchema.plugin(autoIncrPlugin, { model: 'FavoriteService', field: 'id', startAt: 1 });

export var FavoriteService = mongoose.model('FavoriteService', FavoriteServiceSchema);
