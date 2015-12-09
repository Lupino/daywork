import React, { Component } from 'react';
import { Input, Button, Link, Navigation } from 'react-toolbox';
import PasswordInput from './modules/input/PasswordInput';
import style from './style';
import { signinForToken, getProfile } from './api';
import store from './modules/store';
const { object } = React.PropTypes;

export default class Signin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      phoneNumber: '',
      passwd: '',
      checkError: {}
    };
  }

  handleChange = (name, value) => {
    this.setState({...this.state, [name]: value});
  }

  handleSignin = () => {
    let checkError = {};
    let hasError = false;
    const { phoneNumber, passwd } = this.state;
    const { history } = this.context;
    const { notify } = this.props;
    if (!/\d{11}/.exec(phoneNumber)) {
      checkError.phoneNumber = '请填写正确的手机号码';
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

    signinForToken({ userName: phoneNumber, passwd }, (err, token) => {
      if (err) {
        notify('登录失败');
        return;
      }
      getProfile(token.accessToken, (err, { user }) => {
        if (err) {
          notify('拉取用户数据失败');
          return;
        }
        this.props.onLogin(true);
        this.props.onLoadedProfile(user);
        store.set('token', token);
        store.set('profile', user);
        notify('登录成功');
        history.push('/');
      });
    });
  }

  render() {
    const { phoneNumber, passwd, checkError } = this.state;
    const links = [
      { href: '#/signup', label: '我是新用户?' },
      { href: '#/problem', label: '登录遇到问题?'}
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

        <PasswordInput
          label='密码'
          name='passwd'
          value={passwd}
          onChange={this.handleChange.bind(this, 'passwd')}
          error={checkError.passwd}
          />
        <Button label='登录' raised primary floating className={style.filled} onClick={this.handleSignin} / >
        <Navigation type='horizontal' routes={links} />
      </section>
    );
  }
}

Signin.title = '登录';
Signin.contextTypes = {
  history: object
}
