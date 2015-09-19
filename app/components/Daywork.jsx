import { Reapp, React, NestedViewList, View, List, Router, Bar, Badge, Icon,
  store, action, Immutable, Button, ButtonGroup, Card } from 'reapp-kit';
import trendIcon from 'reapp-kit/icons/timer.svg';
import discoverIcon from 'reapp-kit/icons/paper-plane.svg';
import peopleIcon from '../../assets/silhouette121.svg';
import gearIcon from 'reapp-kit/icons/gear.svg';
import workingIcon from '../../assets/working9.svg';
import dollarsIcon from 'reapp-kit/icons/dollars.svg';
import addIcon from 'reapp-kit/icons/add.svg';
import eyeIcon from 'reapp-kit/icons/eye.svg';
import heartIcon from 'reapp-kit/icons/heart.svg';
import phoneIcon from 'reapp-kit/icons/phone.svg';
import squareIcon from 'reapp-kit/icons/square.svg';
import avatarIcon from '../../assets/profile5.png';
import { host } from '../config';
import request from 'superagent';
import _ from 'lodash';
import JobTitle from './daywork/JobTitle';
import { modal } from './lib/higherOrderComponent';

var {Link} = Router;

let oauthToken = localStorage.getItem('oauthToken');
if (oauthToken) {
  try {
    oauthToken = JSON.parse(oauthToken);
  } catch (e) {
    oauthToken = {};
  }
} else {
  oauthToken = {};
}

let profile = localStorage.getItem('profile');
if (profile) {
  try {
    profile = JSON.parse(profile);
  } catch (e) {
    profile = {};
  }
} else {
  profile = {};
}

let settings = localStorage.getItem('settings');
if (settings) {
  try {
    settings = JSON.parse(settings);
  } catch (e) {
    settings = {};
  }
} else {
  settings = {};
}

store({ profile: profile, oauthToken: oauthToken, settings: settings });
action('setOauthToken', (oauthToken) => {
  store().withMutations(store => {
    localStorage.setItem('oauthToken', JSON.stringify(oauthToken));
    store.set('oauthToken', Immutable.fromJS(oauthToken));
  });
});
action('delOauthToken', () => {
  store().withMutations(store => {
    localStorage.removeItem('oauthToken');
    store.set('oauthToken', Immutable.fromJS({}));
  });
});
action('setProfile', (profile) => {
  store().withMutations(store => {
    localStorage.setItem('profile', JSON.stringify(profile));
    store.set('profile', Immutable.fromJS(profile));
  });
});
action('updateProfile', (data) => {
  store().withMutations(store => {
    let key;
    for (key in data) {
      let value = data[key];
      if (typeof value === 'object') {
        value = Immutable.fromJS(value);
      }
      store.setIn(['profile', key], value);
    }
    localStorage.setItem('profile', JSON.stringify(store.get('profile').toJSON()));
  });
});
action('updateSettings', (data) => {
  store().withMutations(store => {
    let key;
    for (key in data) {
      let value = data[key];
      if (typeof value === 'object') {
        value = Immutable.fromJS(value);
      }
      store.setIn(['settings', key], value);
    }
    localStorage.setItem('settings', JSON.stringify(store.get('settings').toJSON()));
  });
});

const Daywork = store.cursor(['profile', 'oauthToken'], modal(class extends React.Component {
  constructor(props) {
    super(props);
    var pathname = window.location.pathname;
    var barIndex = 0;
    if (pathname.match(/profile|settings|salary|newJob|jobs/)) {
      barIndex = 2;
    }
    if (pathname.match(/info/)) {
      barIndex = 1;
    }
    this.state = {
      barIndex: barIndex,
      loadMoreButton: true,
      currentPage: 0,
      profile: props.profile.toJSON(),
      jobs: []
    };
  }
  handleLoadMore(page) {
    this.loadJobs(page);
  }
  loadJobs(page) {
    page = page || 0;
    let accessToken = this.props.oauthToken.get('accessToken');
    request.get(host + '/api/jobs?page=' + page + '&status=Publish&access_token=' + accessToken,
                (err, res) => {
                  if (err) {
                    return this.props.alert('网络错误');
                  }
                  let rsp = res.body;
                  if (rsp.err) {
                    return this.props.alert(rsp.msg || rsp.err);
                  }
                  let jobs = this.state.jobs.concat(_.clone(rsp.jobs));
                  jobs = _.uniq(jobs, 'jobId');
                  this.setState({ jobs });
                  if (rsp.jobs.length < 10) {
                    this.setState({ loadMoreButton: false });
                  }
                  this.setState({ currentPage: page });
                });
  }
  loadProfile() {
    let accessToken = this.props.oauthToken.get('accessToken');
    request.get(host + '/api/users/me?access_token=' + accessToken,
                (err, res) => {
                  if (err) {
                    return this.props.alert('网络错误');
                  }
                  let rsp = res.body;
                  if (rsp.err) {
                    return this.props.alert(rsp.msg || rsp.err, () => {
                      this.router().transitionTo('signin');
                    });
                  }
                  this.action.setProfile(rsp.user);
                  this.setState({ profile: rsp.user });
                });
  }
  handleBarActive(index) {
    this.setState({barIndex: index});
  }
  handleInfo(jobId) {
    this.router().transitionTo('jobInfo', { jobId: jobId });
  }
  handleShowPhoneNumber(phoneNumber) {
    this.props.alert('电话：' + phoneNumber);
  }
  handleRequestJob(jobId) {
    let accessToken = this.props.oauthToken.get('accessToken');
    let userId = this.state.profile.userId;
    let data = {
      access_token: accessToken,
      jobId
    };

    this.updateRequestButton(jobId, true);
    request.post(host + '/api/users/' + userId + '/requestJob', data,
                (err, res) => {
                  if (err) {
                    this.updateRequestButton(jobId, false);
                    return this.props.alert('网络错误');
                  }
                  let rsp = res.body;
                  if (rsp.err) {
                    this.updateRequestButton(jobId, false);
                    return this.props.alert(rsp.msg || rsp.err);
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

  handleFavorite(jobId, favorite) {
    let accessToken = this.props.oauthToken.get('accessToken');
    let data = {
      access_token: accessToken
    };

    let uri = favorite ? 'favorite' : 'unfavorite';

    this.updateFavoriteButton(jobId, favorite);
    request.post(host + '/api/jobs/' + jobId + '/' + uri, data,
                (err, res) => {
                  if (err) {
                    this.updateFavoriteButton(jobId, !favorite);
                    return this.props.alert('网络错误');
                  }
                  let rsp = res.body;
                  if (rsp.err) {
                    this.updateFavoriteButton(jobId, !favorite);
                    return this.props.alert(rsp.msg || rsp.err);
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
  updateProfile(profile) {
    this.setState({ profile });
  }
  componentDidMount() {
    this.loadProfile();
    this.loadJobs();
  }
  renderBar() {
    var bar = (
      <Bar display="icon-text" activeIndex={this.state.barIndex}>
        <Bar.Item
          icon={trendIcon}
          onTap={this.handleBarActive.bind(null, 0)}>
          动态
        </Bar.Item>
        <Bar.Item icon={discoverIcon} onTap={this.handleBarActive.bind(null, 1)}>
          发现
        </Bar.Item>
        <Bar.Item icon={peopleIcon} onTap={this.handleBarActive.bind(null, 2)}>
          我
        </Bar.Item>
      </Bar>
    );
    return bar;
  }
  renderTrendingView() {
    return (
      <View>
      </View>
    );
  }
  renderJobItem(job) {
    let salary = job.salary + ' RMB / ';
    if (job.payMethod === 'Daily') {
      salary += '天';
    } else {
      salary += '时';
    }

    let requiredPeople = '人数不限';

    if (job.requiredPeople > 0) {
      requiredPeople = '需要 ' + job.requiredPeople + ' 人';
    }

    let user = job.user || {};

    return (
      <Card key={'job-' + job.jobId}
        title={<JobTitle salary={salary} name={job.title} time={job.createdAt} />}>
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
        <hr />
        <ButtonGroup>
          <Button chromeless onTap={this.handleFavorite.bind(this, job.jobId, !job.favorited)}>
            <Icon file={heartIcon} color={job.favorited ? 'red' : 'gray'} />
          </Button>
          <Button chromeless onTap={this.handleInfo.bind(this, job.jobId)}>
            <Icon file={eyeIcon} />
          </Button>
          <Button chromeless onTap={this.handleShowPhoneNumber.bind(this, user.phoneNumber)}>
            <Icon file={phoneIcon} />
          </Button>
          <Button chromeless onTap={this.handleRequestJob.bind(this, job.jobId)} inactive={job.userId === this.state.profile.userId || job.requested ? true : false}>
            <Icon file={addIcon} />
          </Button>
        </ButtonGroup>
      </Card>
    );

  }
  renderDiscoverView() {
    let button = null;
    if (this.state.loadMoreButton) {
      let page = this.state.currentPage + 1;
      button = <Button
        onTap={this.handleLoadMore.bind(this, page)}>
        加载更多... </Button>;
    }

    let jobs = this.state.jobs.map(this.renderJobItem);


    return (
      <View>
        {jobs}
        {button}
      </View>
    );
  }
  renderMeView() {
    let profile = this.state.profile;
    let avatarImgUrl = avatarIcon;
    if (profile.avatar) {
      avatarImgUrl = host + '/upload/' + profile.avatar.key;
    }
    return (
      <View>
        <List>
          <List.Item
            title={profile.realName}
            titleSub={'手机号: ' + profile.phoneNumber}
            before={<img src={avatarImgUrl} style={styles.avatar} />}
            wrapper={<Link to="profile" />}
            icon
            nopad
          />
        </List>
        <br />
        <List>
          <List.Item
            title="余额"
            before={<Icon file={dollarsIcon} size={20} />}
            titleAfter={profile.remainMoney + ' 元'}
            wrapper={<Link to="salary" />}
            icon
            nopad
          />
          <List.Item
            title="我的工作"
            before={<Icon file={workingIcon} size={20} />}
            wrapper={<Link to="works" />}
            icon
            nopad
          />
          <List.Item
            title="发布新职位"
            before={<Icon file={addIcon} size={20} />}
            wrapper={<Link to="newJob" />}
            icon
            nopad
          />
          <List.Item
            title="我发布的职位"
            before={<Icon file={squareIcon} size={20} />}
            wrapper={<Link to="jobs" />}
            icon
            nopad
          />
          <List.Item
            title="设置"
            before={<Icon file={gearIcon} size={20} />}
            wrapper={<Link to="settings" />}
            icon
            nopad
          />
        </List>
      </View>
    );
  }
  renderTitle() {
    var titles = [
      '工作流',
      '发现',
      '我'
    ];
    return titles[this.state.barIndex];
  }
  render() {
    return (
      <NestedViewList {...this.props.viewListProps}>
        <View
          title={this.renderTitle()}
          after={this.renderBar()}
          >
            <NestedViewList scrollToStep={this.state.barIndex}>
              {this.renderTrendingView()}
              {this.renderDiscoverView()}
              {this.renderMeView()}
            </NestedViewList>
        </View>

        {this.props.child({ updateParentProfile: this.updateProfile })}
      </NestedViewList>
    );
  }
}));

var styles = {
  listIcon: {
    width: 24,
    borderRadius: 8,
    height:24
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 8
  }
};

export default Reapp(Daywork);
