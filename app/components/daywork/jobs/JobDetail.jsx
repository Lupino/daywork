import { React, View, BackButton, ButtonGroup, Button, Card, Container,
  Swiper, List, Title, store } from 'reapp-kit';
import { host } from '../../../config';
import request from 'superagent';
import { modal } from '../../lib/higherOrderComponent';
import { prettyTime } from '../../lib/util';
import JobTitle from './../JobTitle';
import RecordTitle from './../RecordTitle';
import avatarIcon from '../../../../assets/profile5.png';
import _ from 'lodash';

export default store.cursor(['profile', 'oauthToken'], modal(class extends React.Component {
  state = {
    job: {},
    workers: [],
    tab: 0,
    inActiveBtns: {},
    needUpdatedSalary: false,
    loadMoreButton: [true, true, true, false],
    currentPage: [0, 0, 0, 0],
    records: []
  }
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
  loadJob() {
    let jobId = Number(this.context.router.getCurrentParams().jobId);
    // let job = this.props.getJobFromParent(jobId);
    // if (job && job.jobId) {
    //   this.setState({ job: job });
    //   return;
    // }
    request.get(host + '/api/jobs/' + jobId, (err, res) => {
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
  loadWorkers(page) {
    let jobId = Number(this.context.router.getCurrentParams().jobId);
    page = page || 0;
    request.get(host + '/api/jobs/' + jobId + '/workers?page=' + page, (err, res) => {
      if (err) {
        return this.props.alert('网络错误');
      }
      let rsp = res.body;
      if (rsp.err) {
        return this.props.alert(rsp.msg || rsp.err);
      }
      let workers = this.state.workers.concat(_.clone(rsp.workers));
      workers = _.uniq(workers, 'id');
      this.setState({ workers });
      this.setState(rsp);
      this.setState({ needUpdatedSalary: false });
      if (rsp.workers.length < 10) {
        this.updateButtonState(0, false);
        this.updateButtonState(2, false);
      }
      this.updateTabPage(0, page);
      this.updateTabPage(2, page);
    });
  }
  loadRecords(page) {
    let jobId = Number(this.context.router.getCurrentParams().jobId);
    page = page || 0;
    request.get(host + '/api/jobs/' + jobId + '/records?page='+page, (err, res) => {
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
        this.updateButtonState(1, false);
      }
      this.updateTabPage(1, page);
    });
  }
  setInActiveButton(userId, type) {
    let btn = {};
    btn['worker-' + userId] = type;
    let inActiveBtns = _.defaults(this.state.inActiveBtns, btn);
    this.setState({ inActiveBtns });
  }
  handleAddRecord(userId) {
    let recordNumber = Number(this.refs['worker-' + userId].getDOMNode().value.trim());
    let accessToken = this.props.oauthToken.get('accessToken');

    this.setInActiveButton(userId, true);
    request.post(host + '/api/jobs/' + this.state.job.jobId + '/addRecord',
                 { recordNumber: recordNumber, userId: userId, access_token: accessToken }, (err, res) => {
                   if (err) {
                     this.setInActiveButton(userId, false);
                     return this.props.alert('网络错误');
                   }
                   let rsp = res.body;
                   if (rsp.err) {
                     this.setInActiveButton(userId, false);
                     return this.props.alert(rsp.msg || rsp.err);
                   }
                   let worker = _.filter(this.state.workers, (worker) => worker.userId === userId)[0];
                   let rec = rsp.record;
                   rec.user = worker.user;
                   let recs = [rec].concat(this.state.records);
                   this.setState({ records: recs, needUpdatedSalary: true });
                 });
  }
  handleCancelRecord(recordId) {
    let data = {
      recordId: recordId,
      access_token: this.props.oauthToken.get('accessToken')
    };
    let jobId = this.state.job.jobId;
    request.post(host + '/api/jobs/' + jobId + '/cancelRecord', data,
                 (err, res) => {
                   if (err) {
                     return this.props.alert('网络错误');
                   }
                   let rsp = res.body;
                   if (rsp.err) {
                     return this.props.alert(rsp.msg || rsp.err);
                   }
                   let recs = this.state.records.map((record) => {
                     if (record.recordId === recordId) {
                       record.status = 'Cancel';
                     }
                     return record;
                   });
                   this.setState({ records: recs });
                 });
  }
  handlePayment(userId) {
    this.router().transitionTo('payment', { jobId: this.state.job.jobId, userId: userId });
  }
  handleJoin(userId) {
    let accessToken = this.props.oauthToken.get('accessToken');

    this.setInActiveButton(userId, true);
    request.post(host + '/api/jobs/' + this.state.job.jobId + '/assignWorker',
                 { userId: userId, access_token: accessToken }, (err, res) => {
                   if (err) {
                     this.setInActiveButton(userId, false);
                     return this.props.alert('网络错误');
                   }
                   let rsp = res.body;
                   if (rsp.err) {
                     this.setInActiveButton(userId, false);
                     return this.props.alert(rsp.msg || rsp.err);
                   }
                   let workers = this.state.workers.map(worker => {
                     if (worker.userId === userId) {
                       worker.status = 'Join';
                     }
                     return worker;
                   });
                   this.setState({ workers });
                 });

  }
  componentDidMount() {
    this.loadJob();
    this.loadWorkers();
    this.loadRecords();
  }
  render() {
    const backButton =
      <BackButton onTap={() => this.router().transitionTo('jobs')} />;

    let job = this.state.job;
    let body;
    if (job.jobId) {
      body = this.renderJob();
    } else {
      body = this.renderLoading();
    }

    return (
      <View {...this.props} title={[
        backButton,
        '职位详情'
      ]}>
        {body}
      </View>
    );
  }
  renderJob() {
    let job = this.state.job;
    let salary = job.salary + ' RMB / ';
    if (job.payMethod === 'Daily') {
      salary += '天';
    } else {
      salary += '时';
    }

    let bColor = job.status === 'Draft' ? '#ddd' : '#fff';
    if (job.status === 'Draft') {
      bColor = '#ddd';
    }

    let requiredPeople = '人数不限';

    if (job.requiredPeople > 0) {
      requiredPeople = '需要 ' + job.requiredPeople + ' 人';
    }

    let card = (
      <Card key={'job-' + job.jobId}
        styles={ { self: { background: bColor } } }
        title={<JobTitle salary={salary} name={job.title} />}>
        <div key="summary">
          <p>
            {job.summary}
          </p>
        </div>
        <div key="requiredPeople">
          <p>
            {requiredPeople}
          </p>
        </div>
        <br />
        <ButtonGroup>
          <Button
            onTap={ () => this.setState({ tab: 0 }) }
            filled={this.state.tab === 0}> 工人 </Button>
          <Button
            onTap={ () => this.setState({ tab: 1 }) }
            filled={this.state.tab === 1}> 记录 </Button>
          <Button
            onTap={ () => { if (this.state.needUpdatedSalary) { this.loadWorkers(); } this.setState({ tab: 2 }); } }
            filled={this.state.tab === 2}> 工资 </Button>
          <Button
            onTap={ () => this.setState({ tab: 3 }) }
            filled={this.state.tab === 3}> 请求 </Button>
        </ButtonGroup>
      </Card>
    );

    let workers = this.state.workers.filter(worker => worker.status === 'Join')
      .map(worker => {
      let user = worker.user || {};
      let avatarImgUrl = avatarIcon;
      if (user.avatar) {
        avatarImgUrl = host + '/upload/' + user.avatar.key;
      }
      return (
        <List.Item key={'worker-' + worker.userId}
          title={user.realName}
          before={<img src={avatarImgUrl} style={styles.listIcon} />}
          after={
            <div style={styles.addrecord}>
              <input ref={'worker-' + worker.userId} type="text" defaultValue={1} style={ styles.recordNumber }/>
              <Button
                inactive={!!this.state.inActiveBtns['worker-' + worker.userId]}
                onTap={this.handleAddRecord.bind(this, worker.userId)}
                chromeless> 记工 </Button>
            </div>
            }
          >
        </List.Item>
      );
    });

    let records = this.state.records.map(record => {
      let user = record.user || {};
      let avatarImgUrl = avatarIcon;
      if (user.avatar) {
        avatarImgUrl = host + '/upload/' + user.avatar.key;
      }
      let info = this.state.job.payMethod === 'Daily' ? '天' : '小时';
      info = record.recordNumber + ' ' + info;
      let noswiping = true;
      if (record.status === 'Unpaid' && new Date() - new Date(record.createdAt) < 30 * 60 * 1000) {
        noswiping = false;
      }

      return (
        <Swiper noswiping={noswiping} key={'record-' + record.recordId} right below={
          <Button chromeless color="green" styles={styles.button}
            onTap={ () => this.handleCancelRecord(record.recordId) }
            >
            取消
          </Button>
          }>
          <List.Item key={'record-' + record.recordId}
            title={<RecordTitle name={user.realName} salary={record.salary + ' RMB'}/>}
            before={<img src={avatarImgUrl} style={styles.listIcon} />}
            after={prettyTime(record.createdAt)}
            >
            {info}
          </List.Item>
        </Swiper>
      );
    });

    let salarys = this.state.workers.filter(worker => worker.status !== 'Request')
      .map(worker => {
      let user = worker.user || {};
      let avatarImgUrl = avatarIcon;
      if (user.avatar) {
        avatarImgUrl = host + '/upload/' + user.avatar.key;
      }
      let totalSalary = worker.totalSalary + ' RMB';
      let unpaid = '待发工资: ' + worker.unpaid + ' RMB';
      let paid = '已发工资: ' + ( worker.paidOffline + worker.paidOnline ) + ' RMB';
      return (
        <List.Item key={'worker-' + worker.userId}
          title={<RecordTitle name={user.realName} salary={totalSalary}/>}
          before={<img src={avatarImgUrl} style={styles.listIcon} />}
          after={
            <Button chromeless
              onTap={ this.handlePayment.bind(this, worker.userId) }
              > 支付 </Button>
            }
          >
          {unpaid}
          {paid}
        </List.Item>
      );
    });

    let requests = this.state.workers.filter(worker => worker.status === 'Request')
      .map(worker => {
      let user = worker.user || {};
      let avatarImgUrl = avatarIcon;
      if (user.avatar) {
        avatarImgUrl = host + '/upload/' + user.avatar.key;
      }
      return (
        <List.Item key={'worker-' + worker.userId}
          title={user.realName}
          before={<img src={avatarImgUrl} style={styles.listIcon} />}
          after={
              <Button
                inactive={!!this.state.inActiveBtns['worker-' + worker.userId]}
                onTap={this.handleJoin.bind(this, worker.userId)}
                chromeless> 加入 </Button>
            }
          >
        </List.Item>
      );
    });


    let tabs = [workers, records, salarys, requests];
    let tab = tabs[this.state.tab];
    let tabTitles = ['工人', '记录', '工资', '请求'];
    let tabTitle = tabTitles[this.state.tab];

    let button = null;
    if (this.state.loadMoreButton[this.state.tab]) {
      let page = this.state.currentPage[this.state.tab] + 1;
      button = <Button
        onTap={this.handleLoadMore.bind(this, this.state.tab, page)}>
        加载更多... </Button>;
    }

    return (
      <div>
        {card}
        <Title> {tabTitle} </Title>
        <List>
          {tab}
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
