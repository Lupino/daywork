import React from 'react';

export default class extends React.Component {
  render() {
    return (
      <div style={styles.title}>
        <div style={styles.name}>{this.props.name}</div>
        &nbsp;
        <div style={styles.salary}>{this.props.salary}</div>
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
  }
};
