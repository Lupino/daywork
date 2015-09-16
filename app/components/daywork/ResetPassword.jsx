import { React, View, List, Input, Button, Container, Router } from 'reapp-kit';
import request from 'superagent';
import { host } from '../../config';
import { modal } from '../lib/higherOrderComponent';
let { Link } = Router;

export default modal(class extends React.Component {
  state = {
    btnActive: true,
    btnCutDown: ''
  }
  cutdown(timeout) {
    timeout = timeout - 1;
    if (timeout > 0) {
      this.setState({ btnActive: false, btnCutDown: '(' + timeout + ')' });
      setTimeout(() => this.cutdown(timeout), 1000);
    } else {
      this.setState({ btnActive: true, btnCutDown: '' });
    }
  }
  handleSendSmsCode() {
    let phoneNumber = this.refs.phoneNumber.getDOMNode().value.trim();
    if (!phoneNumber.match(/\d{11}/)) {
      return this.props.alert('请填写正确的手机号码');
    }
    this.cutdown(120);
    request.post(host + '/api/sendSmsCode', { phoneNumber: phoneNumber }, (err, res) => {
      if (err) {
        return this.props.alert('验证码发送失败');
      }
      let rsp = res.body;
      if (rsp.err) {
        return this.props.alert(rsp.msg || rsp.err);
      }
    });
  }
  handleResetPassword() {
    let phoneNumber = this.refs.phoneNumber.getDOMNode().value.trim();
    let passwd = this.refs.passwd.getDOMNode().value.trim();
    let smsCode = this.refs.smsCode.getDOMNode().value.trim();

    if (!phoneNumber.match(/\d{11}/)) {
      return this.props.alert('请填写正确的手机号码');
    }

    if (!smsCode) {
      return this.props.alert('请填写手机验证码');
    }

    if (!passwd) {
      return this.props.alert('请填写密码');
    }

    request.post(host + '/api/resetPasswd', {
      phoneNumber: phoneNumber,
      smsCode: smsCode,
      passwd: passwd
    }, (err, res) => {
      if (err) {
        return this.props.alert('重置密码失败');
      }
      let rsp = res.body;
      if (rsp.err) {
        return this.props.alert(rsp.msg || rsp.err);
      }
      this.router().transitionTo('signin');
    });
  }
  render() {

    return (
      <View {...this.props} title="重置密码">
        <List>
          <List.Item before="账号">
            <Input ref="phoneNumber" type="text" placeholder="电话号码" />
          </List.Item>
        </List>
        <br />
        <List>
          <List.Item before="验证码" after={<Button inactive={!this.state.btnActive} chromeless onTap={this.handleSendSmsCode}> 发送验证码<span>{this.state.btnCutDown}</span> </Button>}>
            <Input ref="smsCode" type="text" placeholder="手机验证码" />
          </List.Item>
        </List>
        <br />
        <List>
          <List.Item before="密码">
            <Input ref="passwd" type="password" placeholder="请填写密码" />
          </List.Item>
        </List>
        <br />
        <Button onTap={this.handleResetPassword}> 重置密码 </Button>
        <Container style={{
          marginTop: 10,
          textAlign: 'center'
        }} wrap>
          <Link to="signin"> 我想起密码了? </Link>
        </Container>
      </View>
    );
  }
});
