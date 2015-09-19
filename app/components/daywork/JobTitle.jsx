import React from 'react';
import { prettyTime } from '../lib/util';

export default class extends React.Component {
  render() {
    return (
      <div style={styles.title}>
        <div style={styles.name}>{this.props.name}</div>
        &nbsp;
        <div style={styles.salary}>{this.props.salary}</div>
        &nbsp;
        <div style={styles.time}>
          {this.props.time && prettyTime(this.props.time)}
        </div>
      </div>
    );
  }
}

const styles = {
  title: {
    flexFlow: 'row',
    WebkitFlexFlow: 'row'
  },

  name: {
    fontWeight: 'bold'
  },

  salary: {
    color: '#999',
    fontWeight: 300,
    fontSize: '14px'
  },

  time: {
    color: '#999',
    fontWeight: 300,
    fontSize: '14px',
    right: 18,
    position: 'absolute'
  }
};
