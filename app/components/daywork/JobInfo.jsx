import { React, View, BackButton, ButtonGroup, Button, Card, Container,
  Swiper, List, Title, store } from 'reapp-kit';
import { host } from '../../config';
import request from 'superagent';
import { modal } from '../lib/higherOrderComponent';
import { prettyTime } from '../lib/util';
import JobTitle from './JobTitle';
import RecordTitle from './RecordTitle';
import avatarIcon from '../../../assets/profile5.png';
import _ from 'lodash';

export default store.cursor(['profile', 'oauthToken'], modal(class extends React.Component {
  state = {
    job: {}
  }
  loadJob() {
    let jobId = Number(this.context.router.getCurrentParams().jobId);
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
  componentDidMount() {
    this.loadJob();
  }
  render() {
    const backButton =
      <BackButton onTap={() => this.router().transitionTo('daywork')}> 发现 </BackButton>;

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
      </Card>
    );

    return (
      <div>
        {card}
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
