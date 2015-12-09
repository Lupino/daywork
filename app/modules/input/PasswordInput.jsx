import React, { Component } from 'react';
import { Input, IconButton } from 'react-toolbox';
import style from './style';

export default class PasswordInput extends Component {
  constructor(props) {
    super(props);
    const value = props.value || '';
    this.state = {
      passwd: value || '',
      passwdShadow: value.replace(/./g, '*'),
      showPasswd: false
    };
  }

  handleTogglePassword = () => {
    this.setState({ showPasswd: !this.state.showPasswd });
  }

  handlePasswdChange = (value) => {
    let { passwdShadow, passwd, showPasswd } = this.state;
    if (showPasswd) {
      passwd = value;
    } else if (passwdShadow.length > value.length) {
      passwd = passwd.substr(0, value.length);
    } else {
      let changed = value.substr(passwdShadow.length, value.length);
      passwd = passwd + changed;
    }

    passwdShadow = passwd.replace(/./g, '*');
    this.setState({ passwd, passwdShadow });
    if (this.props.onChange) {
      this.props.onChange(passwd);
    }
  }

  render() {
    const { passwd, passwdShadow, showPasswd } = this.state;
    const { value, onChange, ...props } = this.props;
    return (
      <div className={style['button-input-group']}>
        <Input
          value={showPasswd ? passwd : passwdShadow}
          {...props}
          onChange={this.handlePasswdChange}
        />

        <IconButton
          ripple
          accent={showPasswd}
          className={style['input-button']}
          icon='remove_red_eye'
          onClick={this.handleTogglePassword}
          />
      </div>
    );
  }
}
