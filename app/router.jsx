import React from 'react';
import { Router, Route, IndexRoute } from 'react-router';
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
import NewJob from './NewJob';

var router = module.exports = (
  <Router>
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
    </Route>
  </Router>
);
