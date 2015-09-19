import { sendJsonResponse } from './util';

export default function(app, daywork) {

  app.param('jobId', (req, res, next, jobId) => {
    daywork.getJob(jobId, (err, job) => {
      if (err || !job) {
        return sendJsonResponse(res, 'Job: ' + jobId + ' is not found.');
      }
      req.job = job;
      req.isOwnerJob = req.isOwner = req.currentUser && req.currentUser.userId === job.userId;
      next();
    });
  });

  app.param('userId', (req, res, next, userId) => {
    daywork.getUser(userId, (err, user) => {
      if (err || !user) {
        return sendJsonResponse(res, 'User: ' + userId + ' is not found.');
      }
      req.user = user;
      req.isOwner = req.currentUser && req.currentUser.userId === user.userId;
      next();
    });
  });

}
