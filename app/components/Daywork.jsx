import { Reapp, React, NestedViewList, View, List, Router, Bar, Badge, Icon,
  store, action, Immutable } from 'reapp-kit';
import trendIcon from 'reapp-kit/icons/timer.svg';
import discoverIcon from 'reapp-kit/icons/paper-plane.svg';
import peopleIcon from '../../assets/silhouette121.svg';
import gearIcon from 'reapp-kit/icons/gear.svg';
import workingIcon from '../../assets/working9.svg';
import dollarsIcon from 'reapp-kit/icons/dollars.svg';
import addIcon from 'reapp-kit/icons/add.svg';
import squareIcon from 'reapp-kit/icons/square.svg';
import avatarIcon from '../../assets/profile5.png';
import { host } from '../config';

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

const Daywork = store.cursor(['profile', 'oauthToken'], class extends React.Component {
  constructor(props) {
    super(props);
    var pathname = window.location.pathname;
    var barIndex = 0;
    if (pathname.match(/profile|settings|salary/)) {
      barIndex = 2;
    }
    this.state = {
      barIndex: barIndex
    };
  }
  handleBarActive(index) {
    this.setState({barIndex: index});
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
        <List>
          <List.Item
            title="红旗山隧道"
            before={<img src={avatarIcon} style={styles.listIcon} />}
            titleAfter={<div><span>1 天</span><span>100 元</span></div>}
            wrapper={<Link to="sub" />}
            icon
            nopad
          />
          <List.Item
            title="红旗山隧道"
            before={<img src={avatarIcon} style={styles.listIcon} />}
            titleAfter={<div><span>0.5 天</span><span>50 元</span></div>}
            wrapper={<Link to="sub" />}
            icon
            nopad
          />
          <List.Item
            title="红旗山隧道"
            before={<img src={avatarIcon} style={styles.listIcon} />}
            titleAfter={<div><span>1 天</span><span>100 元</span></div>}
            wrapper={<Link to="sub" />}
            icon
            nopad
          />
        </List>
      </View>
    );
  }
  renderDiscoverView() {
    return (
      <View>
        <List>
          <List.Item
            title="红旗山隧道普通工人"
            before={<img src={avatarIcon} style={styles.listIcon} />}
            titleAfter={<span>100 元/天</span>}
            wrapper={<Link to="sub" />}
            icon
            nopad
          />
          <List.Item
            title="红旗山隧道技术工人"
            before={<img src={avatarIcon} style={styles.listIcon} />}
            titleAfter={<span>100 元/天</span>}
            wrapper={<Link to="sub" />}
            icon
            nopad
          />
        </List>
      </View>
    );
  }
  renderMeView() {
    var badge = <Badge> 5 </Badge>;
    let avatarImgUrl = avatarIcon;
    if (this.props.profile.get('avatar')) {
      avatarImgUrl = host + '/upload/' + this.props.profile.getIn(['avatar', 'key']);
    }
    return (
      <View>
        <List>
          <List.Item
            title={this.props.profile.get('realName')}
            titleSub={'手机号: ' + this.props.profile.get('phoneNumber')}
            before={<img src={avatarImgUrl} style={styles.avatar} />}
            wrapper={<Link to="profile" />}
            icon
            nopad
          />
        </List>
        <br />
        <List>
          <List.Item
            title="我的工资"
            before={<Icon file={dollarsIcon} size={20} />}
            titleAfter={<span>5000 元</span>}
            wrapper={<Link to="salary" />}
            icon
            nopad
          />
          <List.Item
            title="我的工作"
            before={<Icon file={workingIcon} size={20} />}
            titleAfter={badge}
            wrapper={<Link to="sub" />}
            icon
            nopad
          />
          <List.Item
            title="设置"
            before={<Icon file={gearIcon} size={20} />}
            titleAfter={badge}
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

        {this.props.child()}
      </NestedViewList>
    );
  }
});

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
