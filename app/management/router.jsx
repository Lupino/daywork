import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';
import App from './App';
import Dashboard from './Dashboard';
import UserPannel from './UserPannel';
import UserList from './users/UserList';
import AddUser from './users/AddUser';
import EditUser from './users/EditUser';
import AddJob from './users/AddJob';
import AddService from './users/AddService';
import JobPannel from './JobPannel';
import JobList from './jobs/JobList';
import EditJob from './jobs/EditJob';

var router = module.exports = (
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <IndexRoute component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/users" component={UserPannel}>
        <IndexRoute component={UserList} />
        <Route path="/users/p/:page" component={UserList} />
        <Route path="/users/add" component={AddUser} />
        <Route path="/users/edit/:userId" component={EditUser} />
        <Route path="/users/:userId/addJob" component={AddJob} />
        <Route path="/users/:userId/addService" component={AddService} />
      </Route>
      <Route path="/jobs" component={JobPannel}>
        <IndexRoute component={JobList} />
        <Route path="/jobs/p/:page" component={JobList} />
        <Route path="/jobs/edit/:jobId" component={EditJob} />
      </Route>
      <Route path="/services" component={Dashboard} />
    </Route>
  </Router>
);
