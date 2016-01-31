import React, { Component } from 'react';
import { Input, Button } from 'react-toolbox';
import style from './style';

export default class SMSCodeInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reClickTimeout: 0
    };
  }

  handleSendSMSCode = () => {
    let reClickTimeout = 120;
    this.setState({ reClickTimeout });

    if (this.props.onSendButtonClick) {
      if (this.props.onSendButtonClick() === false) {
        return;
      }
    }

    let countdown = () => {
      reClickTimeout --;
      this.setState({ reClickTimeout });
      if (reClickTimeout === 0) {
        return;
      }
      setTimeout(() => {
        countdown();
      }, 1000)
    }
    countdown();
  };

  render() {
    const { reClickTimeout } = this.state;
    const { onSendButtonClick, ...props } = this.props;
    return (
      <div className={style['button-input-group']}>
        <Input {...props} />

        <Button
          label={'发送验证码' + (reClickTimeout > 0 ? `(${reClickTimeout})` : '') }
          ripple
          disabled={ reClickTimeout > 0 }
          className={style['input-button']}
          onClick={this.handleSendSMSCode}
          />

      </div>
    );
  }
}
