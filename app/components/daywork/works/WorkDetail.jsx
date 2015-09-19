import { React, View, BackButton, Button, Card, Container, List, Title, store } from 'reapp-kit';
import { host } from '../../../config';
import request from 'superagent';
import { modal } from '../../lib/higherOrderComponent';
import { prettyTime } from '../../lib/util';
import JobTitle from './../JobTitle';
import RecordTitle from './../RecordTitle';
import _ from 'lodash';

export default store.cursor(['profile', 'oauthToken'], modal(class extends React.Component {
  state = {
    work: {},
    inActiveBtns: {},
    needUpdatedSalary: false,
    loadMoreButton: true,
    currentPage: 0,
    records: []
  }
  updateButtonState(state) {
    let loadMoreButton = state;
    this.setState({ loadMoreButton });
  }
  updateCurrentPage(page) {
    let currentPage = page;
    this.setState({ currentPage });
  }
  handleLoadMore(page) {
    this.loadRecords(page);
  }
  loadWork() {
    let jobId = Number(this.context.router.getCurrentParams().jobId);
    let userId = Number(this.context.router.getCurrentParams().userId);
    request.get(host + '/api/users/' + userId + '/works/' + jobId, (err, res) => {
      if (err) {
        return this.props.alert('网络错误');
      }
      let rsp = res.body;
      if (rsp.err) {
        return this.props.alert(rsp.msg || rsp.err);
      }
      this.setState(rsp);
    });
  }
  loadRecords(page) {
    let jobId = Number(this.context.router.getCurrentParams().jobId);
    let userId = Number(this.context.router.getCurrentParams().userId);
    page = page || 0;
    request.get(host + '/api/users/' + userId + '/records?page='+page+'&jobId=' + jobId, (err, res) => {
      if (err) {
        return this.props.alert('网络错误');
      }
      let rsp = res.body;
      if (rsp.err) {
        return this.props.alert(rsp.msg || rsp.err);
      }
      let records = this.state.records.concat(_.clone(rsp.records));
      records = _.uniq(records, 'recordId');
      this.setState({ records });
      if (rsp.records.length < 10) {
        this.updateButtonState(false);
      }
      this.updateCurrentPage(page);
    });
  }
  setInActiveButton(userId, type) {
    let btn = {};
    btn['worker-' + userId] = type;
    let inActiveBtns = _.defaults(this.state.inActiveBtns, btn);
    this.setState({ inActiveBtns });
  }
  componentDidMount() {
    this.loadWork();
    this.loadRecords();
  }
  render() {
    const backButton =
      <BackButton onTap={() => this.router().transitionTo('works')} />;

    let work = this.state.work;
    let body;
    if (work.jobId) {
      body = this.renderJob();
    } else {
      body = this.renderLoading();
    }

    return (
      <View {...this.props} title={[
        backButton,
        '工作详情'
      ]}>
        {body}
      </View>
    );
  }
  renderJob() {
    let work = this.state.work;
    let job = this.state.work.job;
    let salary = job.salary + ' RMB / ';
    if (job.payMethod === 'Daily') {
      salary += '天';
    } else {
      salary += '时';
    }

    let card = (
      <Card key={'job-' + job.jobId}
        title={<JobTitle salary={salary} name={job.title} />}>
        <div key="summary">
          <p>
            {job.summary}
          </p>
        </div>
      </Card>
    );

    let records = this.state.records.map(record => {
      let info = job.payMethod === 'Daily' ? '天' : '小时';
      info = record.recordNumber + ' ' + info;

      return (
        <List.Item key={'record-' + record.recordId}
          title={<RecordTitle name={info} salary={record.salary + ' RMB'}/>}
          after={prettyTime(record.createdAt)}
          >
        </List.Item>
      );
    });

    let button = null;
    if (this.state.loadMoreButton) {
      let page = this.state.currentPage + 1;
      button = <Button
        onTap={this.handleLoadMore.bind(this, page)}>
        加载更多... </Button>;
    }

    let info = job.payMethod === 'Daily' ? '天' : '小时';

    return (
      <div>
        {card}
        <Title> 统计 </Title>
        <List>
          <List.Item title="总计" after={work.recordNumber + ' ' + info} />
          <List.Item title="总工资" after={work.totalSalary + ' RMB'} />
          <List.Item title="待支付" after={work.unpaid + ' RMB'} />
          <List.Item title="已支付" after={(work.paidOnline + work.paidOffline) + ' RMB'} />
        </List>
        <Title> 记录 </Title>
        <List>
          {records}
        </List>
        <br />
        {button}
      </div>
    );
  }
  renderLoading() {
    return (
      <Container style={{
        marginTop: 10,
        textAlign: 'center'
      }} wrap>
        正在努力加载中...
      </Container>
    );
  }
}));

const styles = {
  listIcon: {
    width: 24,
    borderRadius: 8,
    height:24
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 8
  },
  addrecord: {
    flexFlow: 'row',
    WebkitFlexFlow: 'row'
  },
  recordNumber: {
    width: 40,
    border: 0,
    color: '#444',
    fontSize: '16px',
    padding: 2
  },
  button: {
    self: { width: 90, height: 66 }
  }
};
