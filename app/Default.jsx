import React, { Component, PropTypes } from 'react';
import {
  CardActions,
  Button, IconButton
} from 'react-toolbox';

import JobItem from './jobs/JobItem';
import ServiceItem from './services/ServiceItem';
import lodash from 'lodash';
import {
  search, requestJob, favorite, unfavorite,
  favoriteService, unfavoriteService
} from './api';
import style from './style';

export default class Default extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    loadMoreButton: true,
    docs: [],
    q: 'status:Publish status:Finish',
    total: 0,
    from: 0,
    size: 10
  };

  handleSearch(from) {
    from = from || 0;
    const { notify } = this.props;
    const { size, q } = this.state;
    search({ from, size, q }, (err, rsp) => {
      if (err) return notify(err);
      let { docs } = this.state;
      docs = docs.concat(lodash.clone(rsp.docs));
      const { total, size, from, q } = rsp;
      const loadMoreButton = total > from + size;
      this.setState({ docs, total, size, from, q, loadMoreButton } );
    });
  }

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
    const docs = this.state.docs.map(doc => {
      if (doc.jobId === jobId) {
        doc.requested = requested;
      }
      return doc;
    });
    this.setState({ docs });
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
    let docs = this.state.docs.map(doc => {
      if (doc.jobId === jobId || doc.serviceId === serviceId) {
        doc.favorited = favorited;
      }
      return doc;
    });
    this.setState({ docs });
  }

  componentDidMount() {
    this.handleSearch();
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
    const docs = this.state.docs.map((doc) => {
      if (doc.jobId) {
        return this.renderJob(doc);
      }
      return this.renderService(doc);
    });
    const { loadMoreButton, from, size } = this.state;

    return (
      <div>
        {docs}
        { loadMoreButton &&
          <Button
            label='加载更多...'
            raised
            primary
            className={style['load-more']}
            onClick={this.handleSearch.bind(this, from + size)}
          />
        }
      </div>
    );
  }
}

Default.title = '首页';
Default.contextTypes = {
  router: PropTypes.object
}
