import React, { Component, PropTypes } from 'react';
import { CardActions, Button } from 'react-toolbox';
import { getUserJobs, deleteJob, publishJob } from '../api';
import JobItem from './JobItem';
import style from '../style';

export default class Jobs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      jobs: [],
      currentPage: 0,
      limit: 10,
      status: '',
      loaded: false
    }
  }

  handleLoadJobs = (page) => {
    page = page || 0;
    const { limit, status } = this.state;
    this.setState({ loaded: false });
    getUserJobs({page, limit, status}, (err, rsp) => {
      if (err) return window.alert(err);
      this.setState({jobs: rsp.jobs, currentPage: Number(page), loaded: true});
    });
  };

  handleDeleteJob = (jobId) => {
    const { confirm, notify } = this.props;
    confirm({ title: '确定删除？', message: '删除后将无法恢复' }, (del) => {
      if (!del) return;
      deleteJob({ jobId: '100' }, (err, rsp) => {
        if (err) {
          return notify(err);
        }
        const jobs = this.state.jobs.filter((job) => {
          return jobId !== job.jobId;
        });
        this.setState({ jobs });
        notify('职位已删除');
      });
    });
  };

  handlePublish = (jobId) => {
    const { notify } = this.props;
    publishJob({ jobId }, (err, job) => {
        if (err) {
          return notify(err);
        }
        const jobs = this.state.jobs.map((job) => {
          if ( jobId === job.jobId ) {
            job.status = 'Publish';
          }
          return job;
        });
        this.setState({ jobs });
        notify('职位已发布');
    });
  };

  handleEditJob = (jobId) => {
    const { router } = this.context;
    router.push(`/edit_job/${jobId}`);
  };

  handleShowJob = (jobId) => {
    const { router } = this.context;
    router.push(`/jobs/${jobId}`);
  };

  componentDidMount() {
    this.handleLoadJobs();
  }

  renderJob(job) {
    const { jobId, status } = job;
    return (
      <JobItem job={job} key={`job-${jobId}`}>
        <CardActions>
          <Button label="查看详情" raised onClick={this.handleShowJob.bind(this, jobId)} />
          { status === 'Draft' ? <Button label="发布" raised onClick={this.handlePublish.bind(this, jobId)} /> : null }
          <Button label="编辑" raised onClick={this.handleEditJob.bind(this, jobId)} />
          { status === 'Draft' ? <Button label="删除" accent raised onClick={this.handleDeleteJob.bind(this, jobId)} /> : null }
        </CardActions>
      </JobItem>
    );
  }

  render() {
    const jobs = this.state.jobs.map((job) => this.renderJob(job));

    return (
      <div>
        {jobs}
      </div>
    );
  }
}

Jobs.title = '我发布的职位';
Jobs.contextTypes = {
  router: PropTypes.object
}
