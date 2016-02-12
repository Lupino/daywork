import React, { Component, PropTypes } from 'react';
import { ProgressBar } from 'react-toolbox';
import { getJob } from '../api';
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

  componentDidMount() {
    this.loadJob();
  }

  render() {
    const { job, loaded } = this.state;
    if (!loaded) {
      return <ProgressBar mode='indeterminate' />;
    }

    return (
      <div>
        <JobItem job={job} />
      </div>
    )
  }
}

JobInfo.title = '职位详情';
JobInfo.contextTypes = {
  router: PropTypes.object
}
