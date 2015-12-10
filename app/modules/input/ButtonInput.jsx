import React, { Component } from 'react';
import { Input, Button } from 'react-toolbox';
import style from './style';

export default class ButtonInput extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { onClick, btnLabel, btnProps, ...props } = this.props;
    const { className, ..._btnProps } = btnProps ? btnProps : {};

    return (
      <div className={style['button-input-group']}>
        <Input {...props} />

        <Button
          label={btnLabel}
          className={`${style['input-button']} ${className}`}
          onClick={onClick}
          {..._btnProps}
          />

      </div>
    );
  }
}
