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
import EditJob from '../jobs/EditJob';
import ServicePannel from './ServicePannel';
import ServiceList from './services/ServiceList';
import EditService from '../services/EditService';
import CityPannel from './CityPannel';
import CityList from './cities/CityList';
import AddCity from './cities/AddCity';
import EditCity from './cities/EditCity';
import AddArea from './cities/AddArea';
import EditArea from './cities/EditArea';
import AreaList from './cities/AreaList';

import CategoryList from './categories/CategoryList';
import AddCategory from './categories/AddCategory';
import EditCategory from './categories/EditCategory';

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
        <Route path="/jobs/categories/" component={CategoryList} />
        <Route path="/jobs/categories/add" component={AddCategory} />
        <Route path="/jobs/categories/edit/:categoryId" component={EditCategory} />
      </Route>
      <Route path="/services" component={ServicePannel}>
        <IndexRoute component={ServiceList} />
        <Route path="/services/p/:page" component={ServiceList} />
        <Route path="/services/edit/:serviceId" component={EditService} />
        <Route path="/services/categories/" component={CategoryList} />
        <Route path="/services/categories/add" component={AddCategory} />
        <Route path="/services/categories/edit/:categoryId" component={EditCategory} />
      </Route>
      <Route path="/cities" component={CityPannel}>
        <IndexRoute component={CityList} />
        <Route path="/cities/add" component={AddCity} />
        <Route path="/cities/edit/:cityId" component={EditCity} />
        <Route path="/cities/:cityId/addArea" component={AddArea} />
        <Route path="/areas/edit/:areaId" component={EditArea} />
        <Route path="/cities/:cityId/areas" component={AreaList} />
      </Route>
    </Route>
  </Router>
);
