import React, { Component, PropTypes } from 'react';
import {
  CardActions,
  Button, IconButton
} from 'react-toolbox';

import JobItem from './jobs/JobItem';
import ServiceItem from './services/ServiceItem';

import {
  requestJob, favorite, unfavorite,
  favoriteService, unfavoriteService
} from './api';

import style from './style';

export default class Documents extends Component {

  handleShowJob(jobId, { isOwner, work }) {
    const { router } = this.context;
    if (isOwner) {
      router.push(`/jobs/${jobId}`);
    } else if ( work ) {
      router.push(`/works/${jobId}`);
    } else {
      router.push(`/job_info/${jobId}`);
    }
  }

  handleShowService(serviceId, { isOwner }) {
    const { router } = this.context;
    if (isOwner) {
      router.push(`/services/${serviceId}`);
    } else {
      router.push(`/service_info/${serviceId}`);
    }
  }

  handleShowPhoneNumber(phoneNumber) {
    const { alert } = this.props;
    alert({ message: phoneNumber, title: '电话号码' });
  }

  handleRequestJob(jobId) {
    const { notify } = this.props;
    this.updateRequestButton(jobId, true);
    requestJob({ jobId }, (err) => {
      if (err) {
        this.updateRequestButton(jobId, false);
        return notify(err);
      }
    });
  }

  updateRequestButton(jobId, requested) {
    const docs = this.props.docs.map(doc => {
      if (doc.jobId === jobId) {
        doc.requested = requested;
      }
      return doc;
    });
    this.props.onUpdate(docs);
  }

  handleFavorite(jobId, fav) {
    const { notify } = this.props;
    let method = fav ? favorite : unfavorite;

    this.updateFavoriteButton({ jobId }, fav);
    method({ jobId }, (err) => {
      if (err) {
        this.updateFavoriteButton({ jobId }, !fav);
        return notify(err);
      }
    });
  }

  handleFavoriteService(serviceId, fav) {
    const { notify } = this.props;
    let method = fav ? favoriteService : unfavoriteService;

    this.updateFavoriteButton({ serviceId }, fav);
    method({ serviceId }, (err) => {
      if (err) {
        this.updateFavoriteButton({ serviceId }, !fav);
        return notify(err);
      }
    });
  }


  updateFavoriteButton({ jobId, serviceId }, favorited) {
    let docs = this.props.docs.map(doc => {
      if (doc.jobId === jobId || doc.serviceId === serviceId) {
        doc.favorited = favorited;
      }
      return doc;
    });
    this.props.onUpdate(docs);
  }

  renderJob(job) {
    const { jobId, status, favorited, requested, user, userId, isOwner, work } = job;
    const phoneNumber = user && user.phoneNumber || '';
    return (
      <JobItem job={job} key={`job-${jobId}`}>
        <CardActions>
          <IconButton icon='favorite'
            accent={favorited}
            onClick={this.handleFavorite.bind(this, jobId, !favorited)} />
          <IconButton icon='remove_red_eye' raised onClick={this.handleShowJob.bind(this, jobId, { isOwner, work })} />
          <IconButton icon='call' onClick={this.handleShowPhoneNumber.bind(this, phoneNumber)} />
          <IconButton icon='add'
            disabled={requested || isOwner || work}
            onClick={this.handleRequestJob.bind(this, jobId)} />
        </CardActions>
      </JobItem>
    );
  }

  renderService(service) {
    const { serviceId, status, favorited, user, userId, isOwner } = service;
    const phoneNumber = user && user.phoneNumber || '';
    return (
      <ServiceItem service={service} key={`service-${serviceId}`}>
        <CardActions>
          <IconButton icon='favorite'
            accent={favorited}
            onClick={this.handleFavoriteService.bind(this, serviceId, !favorited)} />
          <IconButton icon='remove_red_eye' raised onClick={this.handleShowService.bind(this, serviceId, { isOwner })} />
          <IconButton icon='call' onClick={this.handleShowPhoneNumber.bind(this, phoneNumber)} />
        </CardActions>
      </ServiceItem>
    );
  }

  render() {
    const docs = this.props.docs.map((doc) => {
      if (doc.jobId) {
        return this.renderJob(doc);
      }
      return this.renderService(doc);
    });

    return (
      <div>
        {docs}
      </div>
    );
  }
}

Documents.contextTypes = {
  router: PropTypes.object
}
