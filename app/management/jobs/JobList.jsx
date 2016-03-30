import React, { Component, PropTypes } from 'react';

import { Table, ProgressBar, Navigation, Dialog, Input } from 'react-toolbox';
import { getJobs } from '../../api';
import Pagenav from '../../modules/Pagenav';
import PasswordInput from '../../modules/input/PasswordInput';
import { prettyTime, getCityName, getUnit } from '../../modules/utils';

const JobModel = {
  jobId: { type: String, title: '#' },
  userName: { type: String, title: '用户名' },
  realName: { type: String, title: '姓名' },
  title: { type: String, title: '标题' },
  salary: { type: String, title: '薪资' },
  city: { type: String, title: '城市' },
  requiredPeople: { type: String, title: '需要人数(个)' },
  status: { type: String, title: '状态' },
  createdAt: { type: String, title: '创建时间' }
};

export default class JobList extends Component {
  state = {
    selected: [],
    source: [],
    limit: 10,
    currentPage: 1,
    loaded: false,
    showPasswordForm: false,
    phoneNumber: ''
  };

  handleSelect = (selected) => {
    this.setState({selected});
  };

  handlePagenavClick = (page) => {
    const { router } = this.context;
    router.push(`/jobs/p/${page}`);
  };

  handleClose = () => {
    this.setState({showPasswordForm: false, selected: []});
  };

  handleShow(key) {
    const { selected, source } = this.state;
    if (selected.length === 0) {
      return;
    }
    const job = source[selected[0]];
    this.setState({[key]: true, phoneNumber: job.phoneNumber});
  }

  handleShowEditJob = () => {
    const { selected, source } = this.state;
    if (selected.length === 0) {
      return;
    }
    const job = source[selected[0]];
    const { router } = this.context;
    router.push(`/jobs/edit/${job.jobId}`);
  }

  handleShowAddJob = () => {
    const { selected, source } = this.state;
    if (selected.length === 0) {
      return;
    }
    const job = source[selected[0]];
    const { router } = this.context;
    router.push(`/jobs/${job.jobId}/addJob`);
  }

  handleShowAddService = () => {
    const { selected, source } = this.state;
    if (selected.length === 0) {
      return;
    }
    const job = source[selected[0]];
    const { router } = this.context;
    router.push(`/jobs/${job.jobId}/addService`);
  }

  loadJobList(page) {
    page = page || 1;
    const { notify } = this.props;
    const { limit } = this.state;

    this.setState({ loaded: false });
    getJobs({ page: page - 1, limit }, (err, rsp) => {
      if (err) {
        return notify(err);
      }

      const { jobs, total } = rsp;

      const source = (jobs || []).map((job) => {
        job.createdAt = prettyTime(job.createdAt);
        ['userName', 'realName'].forEach((key) => {
          job[key] = job.user[key];
        });
        job.city = getCityName(job.city)
        job.salary = job.salary + ' RMB/' + getUnit(job.payMethod)
        if (job.requiredPeople === 0) {
          job.requiredPeople = '不限';
        }
        return job;
      });
      this.setState({ source, loaded: true, currentPage: Number(page), total: Number(total) });
    });
  }

  componentDidMount() {
    const { page } = this.props.params;
    this.loadJobList(page);
  }

  componentWillReceiveProps(props) {
    const page = props.params.page;
    if (page !== this.props.params.page) {
      this.loadJobList(page);
    }
  }

  render() {
    if (!this.state.loaded) {
      return <ProgressBar mode="indeterminate" />;
    }

    const { source, selected } = this.state;
    const { currentPage, total, limit } = this.state;
    const { showPasswordForm, phoneNumber } = this.state;
    const actions = [
      { label: '编辑', raised: true, disabled: selected.length !== 1, onClick: this.handleShowEditJob },
    ]
    return (
      <section>
        <Navigation type='horizontal' actions={actions}>
        </Navigation>
        <Table
          model={JobModel}
          source={source}
          onSelect={this.handleSelect}
          selectable={true}
          selected={selected}
          />
        <Navigation type='horizontal' actions={actions} />
        <Pagenav
          currentPage={currentPage}
          total={total}
          limit={limit}
          onClick={this.handlePagenavClick}
        />
      </section>
    );
  }
}

JobList.contextTypes = {
  router: PropTypes.object
}
