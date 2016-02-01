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
import Work from './jobs/Work';
import Worker from './jobs/Worker';
import Request from './jobs/Request';

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
      <Route path="/jobs/:jobId/workers/:userId" component={Worker} />
      <Route path="/jobs/:jobId/workers/:userId/request" component={Worker} />
      <Route path="/works" component={Works} />
      <Route path="/works/:jobId" component={Work} />
    </Route>
  </Router>
);
