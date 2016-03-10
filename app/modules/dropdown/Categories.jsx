import React, { Component } from 'react';
import { Dropdown } from 'react-toolbox';

export default class Categories extends Component {

  render() {
    const { categories, ...props } = this.props;

    const source = (categories || []).map(({ category, name }) => {
      return { value: category, label: name  };
    });

    return (
      <Dropdown
        source={source}
        {...props}
      />
    );
  }
}
