import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import App from './App';
import Dashboard from './Dashboard';

var router = module.exports = (
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/users" component={Dashboard} />
      <Route path="/jobs" component={Dashboard} />
      <Route path="/services" component={Dashboard} />
    </Route>
  </Router>
);
