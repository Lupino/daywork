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

var router = module.exports = (
  <Router>
    <Route path="/" component={App}>
      <IndexRoute component={Default}/>
      <Route path="/about" component={About} />
      <Route path="/signin" component={Signin} />
      <Route path="/signup" component={Signup} />
      <Route path="/settings" component={Settings} />
      <Route path="/message" component={Message} />
      <Route path="/help" component={Help} />
    </Route>
  </Router>
);
