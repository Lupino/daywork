import React, { Component } from 'react';
import { Dropdown } from 'react-toolbox';
import { getCities } from '../../api';

export default class Cities extends Component {

  state = {
    source: []
  };

  loadCities() {
    const { type } = this.props;
    getCities((err, rsp) => {
      if (err) {
        alert(err);
        return;
      }
      const { cities } = rsp;
      const source = cities.map(({ cityId, cityName }) => {
        return { value: cityId, label: cityName }
      });
      this.setState({ source });
    });
  }

  componentDidMount() {
    this.loadCities();
  }

  render() {
    const { ...props } = this.props;
    const { source } = this.state;
    return (
      <Dropdown
        source={source}
        {...props}
      />
    );
  }
}
