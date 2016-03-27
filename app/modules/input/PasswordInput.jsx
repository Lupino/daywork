import React, { Component } from 'react';
import { Input, IconButton } from 'react-toolbox';
import style from './style';

export default class PasswordInput extends Component {
  constructor(props) {
    super(props);
    const value = props.value || '';
    this.state = {
      passwd: value || '',
      showPasswd: false
    };
  }

  handleTogglePassword = () => {
    this.setState({ showPasswd: !this.state.showPasswd });
  };

  handlePasswdChange = (passwd) => {
    this.setState({ passwd });
    if (this.props.onChange) {
      this.props.onChange(passwd);
    }
  };

  render() {
    const { passwd, showPasswd } = this.state;
    const { value, type, onChange, ...props } = this.props;
    return (
      <div className={style['button-input-group']}>
        <Input
          value={ passwd }
          type={ showPasswd ? 'text' : 'password'}
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
