import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import App from './App';
import About from './About';
import Signin from './Signin';
import Signup from './Signup';
import Settings from './Settings';
import Message from './Message';
import Help from './Help';
import Default from './Default';
import Problem from './Problem';
import ResetPassword from './ResetPassword';
import Profile from './Profile';
import NewJob from './jobs/NewJob';
import EditJob from './jobs/EditJob';
import Jobs from './jobs/Jobs';
import Works from './jobs/Works';
import Job from './jobs/Job';
import JobInfo from './jobs/JobInfo';
import Work from './jobs/Work';
import Worker from './jobs/Worker';
import Request from './jobs/Request';
import Balance from './Balance';
import Payment from './payment/Payment';
import Result from './payment/Result';
import Cancel from './payment/Cancel';
import DrawMoney from './payment/DrawMoney';

var router = module.exports = (
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Default}/>
      <Route path="/about" component={About} />
      <Route path="/signin" component={Signin} />
      <Route path="/signup" component={Signup} />
      <Route path="/settings" component={Settings} />
      <Route path="/message" component={Message} />
      <Route path="/problem" component={Problem} />
      <Route path="/reset_password" component={ResetPassword} />
      <Route path="/help" component={Help} />
      <Route path="/profile" component={Profile} />
      <Route path="/new_job" component={NewJob} />
      <Route path="/edit_job/:jobId" component={EditJob} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/jobs/:jobId" component={Job} />
      <Route path="/job_info/:jobId" component={JobInfo} />
      <Route path="/jobs/:jobId/workers/:userId" component={Worker} />
      <Route path="/jobs/:jobId/workers/:userId/request" component={Request} />
      <Route path="/works" component={Works} />
      <Route path="/works/:jobId" component={Work} />
      <Route path="/balance" component={Balance} />
      <Route path="/payment" component={Payment} />
      <Route path="/drawmoney" component={DrawMoney} />
      <Route path="/pay_result" component={Result} />
      <Route path="/pay_cancel" component={Cancel} />
    </Route>
  </Router>
);
