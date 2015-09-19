import { React, View, Container, List, Input, Button, Router } from 'reapp-kit';
import request from 'superagent';
import { host } from '../../config';
import { modal } from '../lib/higherOrderComponent';

let { Link } = Router;

export default modal(class extends React.Component {
  state = {
    btnActive: true
  }
  handleSignin() {
    let phoneNumber = this.refs.phoneNumber.getDOMNode().value.trim();
    let passwd = this.refs.passwd.getDOMNode().value.trim();
    if (!phoneNumber.match(/\d{11}/)) {
      return this.props.alert('请填写正确的手机号码');
    }
    if (!passwd) {
      return this.props.alert('请填写密码');
    }
    this.setState({ btnActive: false });
    request.post(host + '/auth', {
      type: 'access_token',
      userName: phoneNumber,
      passwd: passwd
    }, (err, res) => {
      if (err) {
        this.setState({ btnActive: true });
        return this.props.alert('登录失败');
      }
      let rsp = res.body;
      if (rsp.err) {
        this.setState({ btnActive: true });
        return this.props.alert(rsp.msg || rsp.err);
      }
      this.action.setOauthToken(rsp);
      request.get(host + '/api/users/me?access_token=' + rsp.accessToken,
                  (err, res) => {
                    if (err) {
                      this.setState({ btnActive: true });
                      return this.props.alert('登录失败');
                    }
                    let rsp = res.body;
                    if (rsp.err) {
                      this.setState({ btnActive: true });
                      return this.props.alert(rsp.msg || rsp.err);
                    }
                    this.action.setProfile(rsp.user);
                    this.props.updateParentProfile(rsp.user);
                    this.router().transitionTo('daywork');
                  });
    });
  }
  render() {
    return (
      <View {...this.props} title="登录">
        <List>
          <List.Item before="账号">
            <Input ref="phoneNumber" type="text" placeholder="电话号码" />
          </List.Item>
        </List>
        <br />
        <List>
          <List.Item before="密码">
            <Input ref="passwd" type="password" placeholder="请填写密码" />
          </List.Item>
        </List>
        <br />
        <Button onTap={this.handleSignin} inactive={!this.state.btnActive}> 登录 </Button>
        <Container style={{
          marginTop: 10,
          textAlign: 'center'
        }} wrap>
          <Link to="signup"> 我是新用户？ </Link>
          <Link to="problem"> 登录遇到问题？ </Link>
        </Container>
      </View>
    );
  }
});
