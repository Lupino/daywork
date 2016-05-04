import React, { Component, PropTypes } from 'react';
import Search from './Search';

export default class Default extends Component {
  render() {
    return <Search {...this.props} />;
  }
}

Default.title = '首页';
Default.contextTypes = {
  router: PropTypes.object
}
