import React, { Component, PropTypes } from 'react';
import { Input, Button, Link, Navigation } from 'react-toolbox';
import PasswordInput from './modules/input/PasswordInput';
import SMSCodeInput from './modules/input/SMSCodeInput';
import style from './style';
import { sendSmsCode, resetPassword } from './api';
import store from './modules/store';

export default class ResetPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phoneNumber: '',
      smsCode: '',
      passwd: '',
      checkError: {}
    };
  }

  handleChange = (name, value) => {
    this.setState({...this.state, [name]: value});
  };

  handleSendSMSCode = () => {
    const { phoneNumber } = this.state;
    let checkError = {};
    if (!/\d{11}/.exec(phoneNumber)) {
      checkError.phoneNumber = '请输入正确的手机号码';
      this.setState({ checkError })
      return false;
    }
    sendSmsCode(phoneNumber, (err) => {
      if (err) alert('验证码发送失败');
    });
  };

  handleResetPassword = () => {
    let checkError = {};
    let hasError = false;
    const { phoneNumber, smsCode, passwd } = this.state;
    const { router } = this.context;
    if (!/\d{11}/.exec(phoneNumber)) {
      checkError.phoneNumber = '请填写正确的手机号码';
      hasError = true;
    }

    if (!smsCode || smsCode.length != 6) {
      checkError.smsCode = '请输入正确短信验证码';
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
    resetPassword({ phoneNumber, smsCode, passwd }, (err) => {
      if (err) {
        alert(err);
        return;
      }
      this.props.onLogin(false);
      this.props.onProfileLoaded({});
      store.remove('token');
      store.remove('profile');
      router.push('signin');
    });
  };

  render() {
    const { phoneNumber, passwd, smsCode, checkError } = this.state;
    const links = [
      { href: '#/signin', label: '我想起密码了?' },
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

        <PasswordInput
          label='密码'
          name='passwd'
          value={passwd}
          onChange={this.handleChange.bind(this, 'passwd')}
          error={checkError.passwd}
          />
        <Button label='重置密码' raised primary floating className={style.filled} onClick={this.handleResetPassword} / >
        <Navigation type='horizontal' routes={links} />
      </section>
    );
  }
}

ResetPassword.title = '重置密码';
ResetPassword.contextTypes = {
  router: PropTypes.object
}
