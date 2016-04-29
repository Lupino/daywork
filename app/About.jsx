import React, { Component } from 'react';
import Iframe from 'react-iframe';

export default class About extends Component {
  render() {
    return (
      <section>
        <Iframe url="/real-about" position="relative" />
      </section>
    );
  }
}

About.title = '关于';
