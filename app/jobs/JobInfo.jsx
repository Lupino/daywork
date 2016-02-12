import React, { Component, PropTypes } from 'react';
import { ProgressBar, CardActions, IconButton } from 'react-toolbox';
import { getJob, favorite, unfavorite, requestJob } from '../api';
import JobItem from './JobItem';
import style from '../style';
import lodash from 'lodash';

export default class JobInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      job: {},
      loaded: false
    }
  }

  loadJob = () => {
    const { params, notify } = this.props;
    const jobId = params.jobId;
    getJob({ jobId }, (err, rsp) => {
      if (err) {
        return notify(err);
      }
      this.setState({ job: rsp.job, loaded: true });
    });
  };

  handleFavorite(fav) {
    const { notify } = this.props;
    const { jobId } = this.state.job;
    let method = fav ? favorite : unfavorite;
    this.updateFavorite(fav);
    method({ jobId }, (err) => {
      if (err) {
        this.updateFavorite(!fav);
        return notify(err);
      }
    });
  }

  updateFavorite(fav) {
    let { job } = this.state;
    job.favorited = fav;
    this.setState({ job });
  }

  handleShowPhoneNumber(phoneNumber) {
    const { alert } = this.props;
    alert({ message: phoneNumber, title: '电话号码' });
  }

  handleRequestJob() {
    const { notify } = this.props;
    const { jobId } = this.state.job;
    this.updateRequest(true);
    requestJob({ jobId }, (err) => {
      if (err) {
        this.updateRequest(false);
        return notify(err);
      }
    });
  }

  updateRequest(req) {
    let { job } = this.state;
    job.requested = req;
    this.setState({ job });
  }

  componentDidMount() {
    this.loadJob();
  }

  render() {
    const { job, loaded } = this.state;
    if (!loaded) {
      return <ProgressBar mode='indeterminate' />;
    }

    const profile = this.props.getProfile();
    const { jobId, status, favorited, requested, user, userId } = job;
    const phoneNumber = user && user.phoneNumber || '';

    return (
      <div>
        <JobItem job={job}>
          <CardActions>
            <IconButton icon='favorite'
              accent={favorited}
              onClick={this.handleFavorite.bind(this, !favorited)} />
            <IconButton icon='call' onClick={this.handleShowPhoneNumber.bind(this, phoneNumber)} />
            <IconButton icon='add'
              disabled={requested || profile.userId === userId}
              onClick={this.handleRequestJob.bind(this)} />
            </CardActions>
        </JobItem>
      </div>
    )
  }
}

JobInfo.title = '职位详情';
JobInfo.contextTypes = {
  router: PropTypes.object
}
