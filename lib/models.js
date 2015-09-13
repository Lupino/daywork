import mongoose, { Schema } from 'mongoose';
import { mongod } from '../config';
import autoIncrement from 'mongoose-auto-increment';

let { Mixed } = Schema.Types;

mongoose.connect(mongod);
autoIncrement.initialize(mongoose.connection);

var UserSchema = new Schema({
  userName: { type: String, index: { unique: true } },
  realName: String,
  sex: String,
  intro: String,
  phoneNumber: { type: String, index: { unique: true } },
  phoneVerified: { type: Boolean, default: false },
  passwd: String,
  avatar: Mixed,
  createdAt: { type: Date, default: Date.now }
});

UserSchema.plugin(autoIncrement.plugin, { model: 'User', field: 'userId' });

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
                            (err, seq) => callback(err, seq && seq.id));// {
  //   if (seq && seq.id) {
  //     return callback(seq.id);
  //   }
  //   seq = new Sequence({ name: name });
  //   seq.save((err, seq) => callback(seq.id));
  // });
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

JobSchema.plugin(autoIncrement.plugin, { model: 'Job', field: 'jobId' });

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

WorkRecordSchema.plugin(autoIncrement.plugin, { model: 'WorkRecord', field: 'recordId' });

export var WorkRecord = mongoose.model('WorkRecord', WorkRecordSchema);

var MyJobSchema = new Schema({
  jobId: { type: Number, index: true },
  userId: { type: Number, index: true },
  status: { type: String, default: 'Join' }, // Join | Leave | Finish
  createdAt: { type: Date, default: Date.now }
});

MyJobSchema.plugin(autoIncrement.plugin, { model: 'MyJob', field: 'id' });

export var MyJob = mongoose.model('MyJob', MyJobSchema);

var FileSchema = new Schema({
  key: { type: String, index: { unique: true } },
  extra: Mixed
});

FileSchema.plugin(autoIncrement.plugin, { model: 'File', field: 'id' });

export var File = mongoose.model('File', FileSchema);
