import React, { Component } from 'react';
import { Dropdown } from 'react-toolbox';

export default class Cities extends Component {

  render() {
    const { ...props } = this.props;

    const source = [
      { value: 'xiamen', label: '厦门' }
    ];

    return (
      <Dropdown
        source={source}
        {...props}
      />
    );
  }
}
