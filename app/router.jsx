import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
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

// service
import NewService from './services/NewService';
import EditService from './services/EditService';
import Services from './services/Services';
import Service from './services/Service';
import ServiceInfo from './services/ServiceInfo';
import Purchased from './orders/Purchased';
import Saled from './orders/Saled';
import Order from './orders/Order';

import Favorites from './Favorites';

var router = module.exports = (
  <Router history={browserHistory}>
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

      <Route path="/new_service" component={NewService} />
      <Route path="/edit_service/:serviceId" component={EditService} />
      <Route path="/services" component={Services} />
      <Route path="/services/:serviceId" component={Service} />
      <Route path="/service_info/:serviceId" component={ServiceInfo} />
      <Route path="/purchased" component={Purchased} />
      <Route path="/saled" component={Saled} />
      <Route path="/orders/:id" component={Order} />
      <Route path="favorites" component={Favorites} />
    </Route>
  </Router>
);
