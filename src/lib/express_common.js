import { sendJsonResponse } from './util';
import { getPayment } from './payment';

export default function(app, zhaoshizuo) {

  app.param('jobId', (req, res, next, jobId) => {
    zhaoshizuo.getJob(jobId, (err, job) => {
      if (err || !job) {
        return sendJsonResponse(res, 'Job: ' + jobId + ' is not found.');
      }
      req.job = job;
      req.isOwnerJob = req.isOwner = req.currentUser && req.currentUser.userId === job.userId;
      next();
    });
  });

  app.param('userId', (req, res, next, userId) => {
    zhaoshizuo.getUser(userId, (err, user) => {
      if (err || !user) {
        return sendJsonResponse(res, 'User: ' + userId + ' is not found.');
      }
      req.user = user;
      req.isOwner = req.currentUser && req.currentUser.userId === user.userId;
      next();
    });
  });

  app.param('order_no', (req, res, next, order_no) => {
    getPayment(order_no, (err, payment) => {
      if (err || !payment) {
        return sendJsonResponse(res, 'Payment: ' + order_no + ' is not found.');
      }
      req.payment = payment;
      req.isOwnerPayment = req.isOwner = req.currentUser && req.currentUser.userId === payment.userId;
      next();
    });
  });

  app.param('serviceId', (req, res, next, serviceId) => {
    zhaoshizuo.getService(serviceId, (err, service) => {
      if (err || !service) {
        return sendJsonResponse(res, 'Service: ' + serviceId + ' is not found.');
      }
      req.service = service;
      req.isOwnerService = req.isOwner = req.currentUser && req.currentUser.userId === service.userId;
      next();
    });
  });

  app.param('orderId', (req, res, next, orderId) => {
    zhaoshizuo.getServiceOrder(orderId, { service: true }, (err, order) => {
      if (err || !order) {
        return sendJsonResponse(res, 'Order: ' + orderId + ' is not found.');
      }
      req.order = order;
      req.isOwnerServiceOrder = req.isOwner = req.currentUser && req.currentUser.userId === order.userId;
      next();
    });
  });

  app.param('cityId', (req, res, next, cityId) => {
    zhaoshizuo.getCity(cityId, (err, city) => {
      if (err || !city) {
        return sendJsonResponse(res, 'City: ' + cityId + ' is not found.');
      }
      req.city = city;
      next();
    });
  });

  app.param('areaId', (req, res, next, areaId) => {
    zhaoshizuo.getArea(areaId, (err, area) => {
      if (err || !area) {
        return sendJsonResponse(res, 'Area: ' + areaId + ' is not found.');
      }
      req.area = area;
      next();
    });
  });

}
