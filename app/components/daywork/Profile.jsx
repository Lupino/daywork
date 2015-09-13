import { React, Page, NestedViewList, View, BackButton, List, Router, store } from 'reapp-kit';
import avatarIcon from '../../../assets/profile5.png';
import Dropzone from 'react-dropzone';
import request from 'superagent';
import { host } from '../../config';
import { alert } from '../lib/higherOrderComponent';

var {Link} = Router;

export default store.cursor(['profile', 'oauthToken'], alert(class extends Page {
  constructor(props) {
    super(props);
    let avatar = props.profile.get('avatar');
    if (avatar) {
      avatar = avatar.toJSON();
    }
    this.state = {
      realName: props.profile.get('realName'),
      sex: props.profile.get('sex'),
      phoneNumber: props.profile.get('phoneNumber'),
      avatar: avatar
    };
  }

  handleChange(key, value, cb) {
    if (this.state[key] === value) {
      return cb();
    }
    var state = {};
    state[key] = value;
    state.access_token = this.props.oauthToken.get('accessToken');
    request.post(host + '/api/updateProfile', state, (err, res) => {
      if (err) {
        return cb('网络错误');
      }
      let rsp = res.body;
      if (rsp.err) {
        return cb(rsp.msg || rsp.err);
      }
      this.action.updateProfile(state);
      this.setState(state);
      cb();
    });
  }

  onDrop(files) {
    /*eslint-disable no-console */
    let req = request.post(host + '/api/updateAvatar?access_token=' + this.props.oauthToken.get('accessToken'));
    files.forEach((file) => {
      req.attach('avatar', file);
    });
    req.end((err, res) => {
      if (err) {
        return this.props.alert('网络错误');
      }
      let rsp = res.body;
      if (rsp.err) {
        return this.props.alert(rsp.msg || rsp.err);
      }
      this.setState({ avatar: rsp });
      this.action.updateProfile({ avatar: rsp });
    });
    /*eslint-enable no-console */
  }

  render() {
    const backButton =
      <BackButton onTap={() => this.router().transitionTo('daywork')}> 我 </BackButton>;

    var child = this.hasChildRoute() && this.createChildRouteHandler({
      profileUpdate: this.handleChange,
      profile: this.state
    }) || null;

    var viewListProps = this.routedViewListProps();

    let avatarImgUrl = avatarIcon;
    if (this.state.avatar) {
      avatarImgUrl = host + '/upload/' + this.state.avatar.key;
    }

    return (
      <View {...this.props}>
        <NestedViewList {...viewListProps}>
          <View title={[
            backButton,
            '个人信息'
          ]}>
            <List>
              <List.Item
                title={<div style={styles.avatarText}>头像</div>}
                titleAfter={<div style={styles.avatar}><img src={avatarImgUrl} style={styles.avatarIcon}/> </div>}
                wrapper={<Dropzone onDrop={this.onDrop} />}
                icon
                nopad
              />
            <List>
            <br />
            </List>
              <List.Item
                title="性名"
                titleAfter={<span>{this.state.realName}</span>}
                wrapper={<Link to="name" />}
                icon
                nopad
              />
              <List.Item
                title="性别"
                titleAfter={<span>{this.state.sex}</span>}
                wrapper={<Link to="sex" />}
                icon
                nopad
              />
              <List.Item
                title="手机号"
                titleAfter={<span>{this.state.phoneNumber}</span>}
                nopad
              />
            </List>
          </View>
          {child}
        </NestedViewList>
      </View>
    );
  }
}));

var styles = {
  avatar: {
    width: 72,
    height: 72,
    border: '1px #000 solid',
    borderRadius: 8
  },
  avatarIcon: {
    width: '100%',
    height: '100%'
  },
  avatarText: {
    marginTop: 26
  }
};
