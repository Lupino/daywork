import React, { Component } from 'react';
import { Input, Button, Navigation } from 'react-toolbox';
import PasswordInput from './modules/input/PasswordInput';
import SMSCodeInput from './modules/input/SMSCodeInput';
import style from './style';
import { sendSmsCode, signup, signinForToken, getProfile } from './api';
import store from './modules/store';
const { object } = React.PropTypes;

export default class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phoneNumber: '',
      smsCode: '',
      realName: '',
      passwd: '',
      sendTimeout: 0,
      checkError: {}
    };
  }

  handleChange = (name, value) => {
    this.setState({...this.state, [name]: value});
  }

  handleSendSMSCode = () => {
    const { phoneNumber } = this.state;
    if (!/\d{11}/.exec(phoneNumber)) {
      checkError.phoneNumber = '请输入正确的手机号码';
      this.setState({ checkError })
      return false;
    }
    sendSmsCode(phoneNumber, (err) => {
      if (err) alert('验证码发送失败');
    });
  }

  handleSignup = () => {
    let checkError = {};
    let hasError = false;
    const { phoneNumber, smsCode, realName, passwd } = this.state;
    const { history } = this.context;
    const { notify } = this.props;
    if (!/\d{11}/.exec(phoneNumber)) {
      checkError.phoneNumber = '请填写正确的手机号码';
      hasError = true;
    }

    if (!smsCode || smsCode.length != 6) {
      checkError.smsCode = '请输入正确短信验证码';
      hasError = true;
    }

    if (!realName) {
      checkError.realName = '请填写您的姓名';
      hasError = true;
    }

    if (!passwd) {
      checkError.passwd = '请填写密码';
      hasError = true;
    }

    if (hasError) {
      this.setState({ checkError });
      return;
    }

    signup({ phoneNumber, smsCode, realName, passwd }, (err) => {
      if (err) {
        if (/phoneNumber/.exec(err)) {
          checkError.phoneNumber = `手机号码: ${phoneNumber} 已经被注册了`;
        }
        return;
      }
      signinForToken({ userName: phoneNumber, passwd }, (err, token) => {
        if (err) {
          history.push('signin');
          return;
        }
        store.set('token', token);
        getProfile((err, { user }) => {
          if (err) {
            history.push('signin');
            return;
          }
          this.props.onLogin(true);
          this.props.onProfileLoaded(user);
          store.set('profile', user);
          notify('注册并登录成功');
          history.push('/');
        });
      });
    });
  }

  render() {
    const { sendTimeout, phoneNumber, smsCode, realName, passwd, checkError } = this.state;
    const links = [
      { href: '#/signin', label: '我是老用户?' }
    ];
    return (
      <section>
        <Input
          type='tel'
          label='手机号'
          name='phoneNumber'
          value={phoneNumber}
          onChange={this.handleChange.bind(this, 'phoneNumber')}
          maxLength={11}
          error={checkError.phoneNumber}
          />

        <SMSCodeInput
          type='number'
          label='短信验证码'
          name='smsCode'
          value={smsCode}
          onChange={this.handleChange.bind(this, 'smsCode')}
          onSendButtonClick={this.handleSendSMSCode}
          error={checkError.smsCode}
          />

        <Input
          type='text'
          label='姓名'
          name='realName'
          value={realName}
          onChange={this.handleChange.bind(this, 'realName')}
          error={checkError.realName}
          />

        <PasswordInput
          label='密码'
          name='passwd'
          value={passwd}
          onChange={this.handleChange.bind(this, 'passwd')}
          error={checkError.passwd}
          />
        <Button label='注册' raised primary floating className={style.filled} onClick={this.handleSignup} / >
        <Navigation type='horizontal' routes={links} />
      </section>
    );
  }
}

Signup.title = '注册';

Signup.contextTypes = {
  history: object
}