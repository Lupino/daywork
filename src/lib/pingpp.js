import PingPP from 'pingpp';
import { Payment, User } from './models';
import { pingpp as conf } from '../config';
import shortid from 'shortid';
import async from 'async';

shortid.characters('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$@');

const { appId, appKey } = conf;
const pingpp = PingPP(appKey);

export function createPayment({subject, body, amount, channel, client_ip, userId}, callback) {
  const order_no = shortid.generate().replace(/[$@]/g, 'A');

  const extra = getExtra(channel);

  async.waterfall([
    (next) => {
      let payment = new Payment({
        userId,
        subject,
        body,
        amount,
        order_no,
        channel,
        app: appId,
        type: 'charge'
      });

      payment.save((err, payment) => next(err, payment));
    },
    (payment, next) => {
      pingpp.charges.create({
          subject,
          body,
          amount,
          order_no,
          channel,
          currency: 'cny',
          client_ip,
          app: {id: appId},
          extra
      }, function(err, charge) {
        if (err) {
          return payment.remove(() => next(err));
        }
        payment.rawId = charge.id;
        payment.raw = charge;
        payment.save((err, payment) => next(err, payment));
      });
    },
    (payment, next) => {
      User.findOneAndUpdate({ userId: userId },
                            { $inc: { remainMoney: amount / 100, freezeMoney: amount / 100 } },
                            (err, user) => next(err, payment));
    }
  ], callback);
}

function getExtra(channel) {
  const extras = {
    alipay_wap: {
      success_url: 'http://127.0.0.1:3000/api/pay_result',
      cancel_url: 'http://127.0.0.1:3000/api/pay_cancel'
    }
  }
  return extras[channel] || {};
}

export function checkPayment(payment, callback) {
  if (payment.status != 'Unpaid' && payment.status != 'Proc') {
    return callback(null, payment);
  }
  async.waterfall([
    (next) => {
      pingpp.charges.retrieve(payment.raw.id, (err, charge) => next(err, charge));
    },
    (charge, next) => {
      if (!charge.paid) {
        Payment.findOneAndUpdate({ id: payment.id, status: 'Unpaid' },
                                 { status: 'Proc' },
                                 { new: true },
                                 (err, payment) => callback(err, payment));
        return;
      }
      Payment.findOneAndUpdate({ id: payment.id, status: { $in: ['Unpaid', 'Proc'] } },
                               { raw: charge, status: 'Paid' },
                               { new: true },
                               (err, payment) => next(err, payment));
    },
    (newPayment, next) => {
      if (!newPayment) {
        getPayment(payment.order_no, (err, payment) => next(err, payment));
        return;
      }
      User.findOneAndUpdate({ userId: newPayment.userId },
                            { $inc: { freezeMoney: - newPayment.amount / 100 } },
                            (err, user) => next(err, newPayment));
    }
  ], callback);
}

export function cancelPayment(payment, callback){
  if (payment.status !== 'Unpaid') {
    return callback(null, payment);
  }
  async.waterfall([
    (next) => {
      Payment.findOneAndUpdate({ id: payment.id, status: 'Unpaid' },
                               { status: 'Cancel' },
                               { new: true },
                               (err, payment) => next(err, payment));
    },
    (newPayment, next) => {
      if (!newPayment) {
        getPayment(payment.order_no, (err, payment) => next(err, payment));
        return;
      }

      const { userId, amount, type } = newPayment;
      if (type === 'charge') {
        User.findOneAndUpdate({ userId: userId },
                              { $inc: { remainMoney: - amount / 100, freezeMoney: - amount / 100 } },
                              (err, user) => next(err, newPayment));
      } else if (type === 'drawmoney') {
        User.findOneAndUpdate({ userId: userId },
                              { $inc: { freezeMoney: - amount / 100 } },
                              (err, user) => next(err, newPayment));
      } else {
        next(null, payment);
      }

    }
  ], callback);
}

export function getPayment(order_no, callback) {
  Payment.findOne({ order_no }, (err, payment) => callback(err, payment));
}

export function getPayments(query, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  if (!options.sort) {
    options.sort = 'field -id';
  }
  console.log(query, options);
  Payment.find(query, null, options, (err, payments) => callback(err, payments));
}

export function drawMoney({subject, body, amount, channel, client_ip, userId, raw}, callback) {
  const order_no = shortid.generate().replace(/[$@]/g, 'A');

  raw = raw || {};
  raw.client_ip = client_ip;

  async.waterfall([
    (next) => {
      let payment = new Payment({
        userId,
        subject,
        body,
        amount,
        order_no,
        channel,
        type: 'drawmoney',
        rawId: order_no,
        raw // account
      });

      payment.save((err, payment) => next(err, payment));
    },
    (payment, next) => {
      User.findOneAndUpdate({ userId: userId },
                            { $inc: { freezeMoney: amount / 100 } },
                            (err, user) => next(err, payment));
    }
  ], callback);
}
