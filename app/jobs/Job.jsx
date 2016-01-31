import React, { Component, PropTypes } from 'react';
import {
  Tabs, Tab,
  List, ListItem, ListSubHeader,
  ProgressBar
} from 'react-toolbox';
import {
  getJob, getJobWorkers, getJobRecords,
  addRecord, cancelRecord, assignWorker
} from '../api';
import JobItem from './JobItem';
import style from '../style';
import lodash from 'lodash';

export default class Job extends Component {
  constructor(props) {
    super(props);
    this.state = {
      job: {},
      workers: [],
      requrests: [],
      loadMoreButton: {
        request: false,
        worker: false
      },
      currentPage: {
        request: 0,
        worker: 0
      },
      tab: 0,
      loaded: false
    }
  }

  handleTabChange = (tab) => {
    this.setState({tab});
  };

  updateButtonState(idx, state) {
    let loadMoreButton = this.state.loadMoreButton;
    loadMoreButton[idx] = state;
    this.setState({ loadMoreButton });
  }

  updateTabPage(idx, page) {
    let currentPage = this.state.currentPage;
    currentPage[idx] = page;
    this.setState({ currentPage });
  }

  handleLoadMore(tab, page) {
    if (tab === 0 || tab === 2) {
      this.loadWorkers(page);
    }
    if (tab === 1) {
      this.loadRecords(page);
    }
  }

  loadWorkers(page) {
    const { params, notify } = this.props;
    const jobId = Number(params.jobId);
    const limit = 10;
    const status = 'Join';
    page = page || 0;
    getJobWorkers({ jobId, page, limit, status }, (err, rsp) => {
      if ( err ) {
        return notify(err);
      }
      let { workers } = this.state;
      workers = workers.concat(lodash.clone(rsp.workers));
      workers = lodash.uniq(workers, 'id');
      this.setState( { workers } );
      if ( rsp.workers.length < limit ) {
        this.updateButtonState('worker', false);
      } else {
        this.updateButtonState('worker', true);
      }

      this.updateTabPage('worker', page);
    });
  }

  loadRequests(page) {
    const { params, notify } = this.props;
    const jobId = Number(params.jobId);
    const limit = 10;
    const status = 'Request';
    page = page || 0;
    getJobWorkers({ jobId, page, limit, status }, (err, rsp) => {
      if ( err ) {
        return notify(err);
      }
      let { requrests } = this.state;
      requrests = requrests.concat(lodash.clone(rsp.workers));
      requrests = lodash.uniq(requrests, 'id');
      this.setState( { requrests } );
      if ( rsp.workers.length < limit ) {
        this.updateButtonState('request', false);
      } else {
        this.updateButtonState('request', true);
      }

      this.updateTabPage('request', page);
    });
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

  handleShowWorker(userId) {
    const { router } = this.context;
    const { params } = this.props;
    router.push(`/jobs/${params.jobId}/workers/${userId}`);
  }

  handleShowRequest(userId) {
    const { params } = this.props;
    const { router } = this.context;
    router.push(`/jobs/${params.jobId}/workers/${userId}/request`);
  }

  componentDidMount() {
    this.loadJob();
    this.loadWorkers();
    this.loadRequests();
  }

  render() {
    const { job, tab, loaded } = this.state;
    if (!loaded) {
      return <ProgressBar mode='indeterminate' />;
    }

    const workers = this.state.workers.map((worker) => {
      const { realName, phoneNumber, userId, avatar } = worker.user;
      let imgUrl = '/static/default-avatar.png';
      if (avatar && avatar.key) {
        imgUrl = `/upload/${avatar.key}`
      }
      return (
        <ListItem
         avatar={imgUrl}
         caption={realName}
         legend={phoneNumber}
         onClick={this.handleShowWorker.bind(this, userId)}
         key={`worker-${userId}`}
         >
          <div className={style.date}> {`${worker.unpaid} RMB`} </div>
        </ListItem>);
    });

    const requrests = this.state.requrests.map((requrest) => {
      const { realName, phoneNumber, userId, avatar } = requrest.user;
      let imgUrl = '/static/default-avatar.png';
      if (avatar && avatar.key) {
        imgUrl = `/upload/${avatar.key}`
      }
      return (<ListItem
         avatar={imgUrl}
         caption={realName}
         legend={phoneNumber}
         rightIcon='star'
         onClick={this.handleShowRequest.bind(this, userId)}
         key={`requrest-${userId}`}
       />);
    });
    return (
      <div>
        <JobItem job={job} />
        <Tabs index={tab} onChange={this.handleTabChange}>
          <Tab label='工人'>
            <List selectable ripple>
              {workers}
            </List>
          </Tab>
          <Tab label='请求'>
            <List selectable ripple>
              {requrests}
            </List>
          </Tab>
        </Tabs>
      </div>
    )
  }
}

Job.title = '职位详情';
Job.contextTypes = {
  router: PropTypes.object
}
