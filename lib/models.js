import {Schema, model, connect, connection} from 'mongoose';
import {mongod} from '../config';
import autoIncrement from 'mongoose-auto-increment';

connect(mongod);
autoIncrement.initialize(connection);

var UserSchema = new Schema({
  userName: { type: String, index: { unique: true } },
  realName: String,
  sex: String,
  intro: String,
  phoneNumber: { type: String, index: { unique: true } },
  phoneVerified: { type: Boolean, default: false },
  passwd: String,
  avatar: String,
  createdAt: { type: Date, default: Date.now }
});

UserSchema.plugin(autoIncrement.plugin, { model: 'User', field: 'userId' });

export var User = model('User', UserSchema);

export var OauthToken = model('OauthToken', new Schema({
  userId: Number,
  accessToken: { type: String, index: { unique: true } },
  refreshToken: { type: String, index: { unique: true } },
  createdAt: { type: Date, default: Date.now },
  expiresIn: { type: Number, default: 3600 * 24 * 7 }
}));

export var Sequence = model('Sequence', new Schema({
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
  payMethod: String, // daily | hourly
  requiredPeople: Number,
  createdAt: { type: Date, default: Date.now }
});

JobSchema.plugin(autoIncrement.plugin, { model: 'Job', field: 'jobId' });

export var Job = model('Job', JobSchema);

var WorkRecordSchema = new Schema({
  jobId: Number,
  userId: Number,
  seq: Number,
  salary: Number,
  recordNumber: { type: Number, default: 1 }, // salary = Job.salary * recordNumber
  payStatus: { type: String, default: 'Unpaid' }, // PaidOnline | PaidOffline | Unpaid | Cancel
  createdAt: { type: Date, default: Date.now }
});

WorkRecordSchema.plugin(autoIncrement.plugin, { model: 'WorkRecord', field: 'recordId' });

export var WorkRecord = model('WorkRecord', WorkRecordSchema);

var MyJobSchema = new Schema({
  jobId: { type: Number, index: true },
  userId: { type: Number, index: true },
  status: { type: String, default: 'Join' }, // Join | Finish
  createdAt: { type: Date, default: Date.now }
});

MyJobSchema.plugin(autoIncrement.plugin, { model: 'MyJob', field: 'id' });

export var MyJob = model('MyJob', MyJobSchema);
