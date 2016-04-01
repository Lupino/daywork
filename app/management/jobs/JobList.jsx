import React, { Component, PropTypes } from 'react';

import { Table, ProgressBar, Navigation, Dialog, Input } from 'react-toolbox';
import { getJobs, deleteJob, publishJob, finishJob } from '../../api';
import Pagenav from '../../modules/Pagenav';
import PasswordInput from '../../modules/input/PasswordInput';
import { prettyTime, getCityName, getUnit } from '../../modules/utils';
import async from 'async';

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
    loaded: false
  };

  handleSelect = (selected) => {
    this.setState({selected});
  };

  handlePagenavClick = (page) => {
    const { router } = this.context;
    router.push(`/jobs/p/${page}`);
  };

  handleShowEditJob = () => {
    const { selected, source } = this.state;
    if (selected.length === 0) {
      return;
    }
    const job = source[selected[0]];
    const { router } = this.context;
    router.push(`/jobs/edit/${job.jobId}`);
  }

  handleDeleteJob = () => {
    if (!this.checkAllDraft()) {
      alert('请只选择草稿的职位');
      return;
    }
    const self = this;
    const { selected, source } = this.state;
    const { confirm, notify } = this.props;
    confirm({ title: '确定删除？', message: '删除后将无法恢复' }, (del) => {
      if (!del) return;
      async.each(selected, (idx, done) => {
        const job = source[idx];
        const { jobId } = job;
        deleteJob({ jobId }, done);
      }, (err) => {
        if (err) {
          notify(err)
        }
        self.setState({ selected: [] });
        self.componentDidMount();
      });
    });
  };

  handlePublishJob = () => {
    if (!this.checkAllDraft()) {
      alert('请只选择草稿的职位');
      return;
    }
    const self = this;
    const { selected, source } = this.state;
    const { confirm, notify } = this.props;
    confirm({ title: '确定发布？', message: '发布后不能回退' }, (publish) => {
      if (!publish) return;
      async.each(selected, (idx, done) => {
        const job = source[idx];
        const { jobId } = job;
        publishJob({ jobId }, done);
      }, (err) => {
        if (err) {
          notify(err)
        }
        self.setState({ selected: [] });
        self.componentDidMount();
      });
    });
  };

  handleFinishJob = () => {
    if (!this.checkAllPublish()) {
      alert('请只选择发布后的职位');
      return;
    }
    const self = this;
    const { selected, source } = this.state;
    const { confirm, notify } = this.props;
    confirm({ title: '确定结束？', message: '结束后不能回退' }, (finish) => {
      if (!finish) return;
      async.each(selected, (idx, done) => {
        const job = source[idx];
        const { jobId } = job;
        finishJob({ jobId }, done);
      }, (err) => {
        if (err) {
          notify(err)
        }
        self.setState({ selected: [] });
        self.componentDidMount();
      });
    });
  };

  checkAllDraft() {
    const { selected, source } = this.state;
    const len = selected.length;
    if (len === 0) {
      return false;
    }
    for (let i=0; i<len;i++) {
      const job = source[selected[i]];
      if (job.status !== 'Draft') {
        return false;
      }
    }
    return true;
  }

  checkAllPublish() {
    const { selected, source } = this.state;
    const len = selected.length;
    if (len === 0) {
      return false;
    }
    for (let i=0; i<len;i++) {
      const job = source[selected[i]];
      if (job.status !== 'Publish') {
        return false;
      }
    }
    return true;
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
    const actions = [
      { label: '编辑', raised: true, disabled: selected.length !== 1, onClick: this.handleShowEditJob },
      { label: '发布', raised: true, disabled: !this.checkAllDraft(), onClick: this.handlePublishJob },
      { label: '删除', raised: true, accent: true, disabled: !this.checkAllDraft(), onClick: this.handleDeleteJob },
      { label: '结束', raised: true, accent: true, disabled: !this.checkAllPublish(), onClick: this.handleFinishJob },
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
