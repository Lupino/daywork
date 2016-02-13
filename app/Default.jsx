import React, { Component, PropTypes } from 'react';
import {
  CardActions,
  Button, IconButton
} from 'react-toolbox';

import JobItem from './jobs/JobItem';
import lodash from 'lodash';
import { getJobs, requestJob, favorite, unfavorite } from './api';
import style from './style';

export default class Default extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    loadMoreButton: true,
    currentPage: 0,
    jobs: []
  };

  handleLoadJobs(page) {
    page = page || 0;
    const limit = 10;
    const status = 'Publish';
    const { notify } = this.props;
    getJobs({ page, limit, status }, (err, rsp) => {
      if (err) return notify(err);
      let { jobs } = this.state;
      jobs = jobs.concat(lodash.clone(rsp.jobs));
      jobs = lodash.uniq(jobs, 'jobId');
      this.setState({ jobs, currentPage: page });
      if (rsp.jobs.length < limit) {
        this.setState( { loadMoreButton: false } );
      } else {
        this.setState( { loadMoreButton: true } );
      }
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
    let jobs = this.state.jobs.map(job => {
      if (job.jobId === jobId) {
        job.requested = requested;
      }
      return job;
    });
    this.setState({ jobs });
  }

  handleFavorite(jobId, fav) {
    const { notify } = this.props;
    let method = fav ? favorite : unfavorite;

    this.updateFavoriteButton(jobId, fav);
    method({ jobId }, (err) => {
      if (err) {
        this.updateFavoriteButton(jobId, !fav);
        return notify(err);
      }
    });
  }

  updateFavoriteButton(jobId, favorited) {
    let jobs = this.state.jobs.map(job => {
      if (job.jobId === jobId) {
        job.favorited = favorited;
      }
      return job;
    });
    this.setState({ jobs });
  }

  componentDidMount() {
    this.handleLoadJobs();
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

  render() {
    const jobs = this.state.jobs.map((job) => this.renderJob(job));
    const { loadMoreButton, currentPage } = this.state;

    return (
      <div>
        {jobs}
        { loadMoreButton &&
          <Button
            label='加载更多...'
            raised
            primary
            className={style['load-more']}
            onClick={this.handleLoadJobs.bind(this, currentPage + 1)}
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
