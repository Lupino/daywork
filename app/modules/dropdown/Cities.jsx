import React, { Component } from 'react';
import { Dropdown } from 'react-toolbox';
import { getCities, getAreas } from '../../api';
import style from './style';

export default class Cities extends Component {

  state = {
    source: [],
    source2: []
  };

  handleChange(name, value) {
    this.props.onChange(name, value);
  }

  loadCities() {
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

  loadAreas(cityId) {
    getAreas(cityId, (err, rsp) => {
      if (err) {
        return alert(err);
      }
      const { areas } = rsp;
      const source2 = areas.map(({ areaId, areaName }) => {
        return { value: areaId, label: areaName }
      });
      this.setState({ source2 });
    });
  }

  componentDidMount() {
    this.loadCities();
    if (this.props.city) {
      this.loadAreas(this.props.city);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.city !== nextProps.city) {
      this.loadAreas(nextProps.city);
    }
  }

  render() {
    const { city, area } = this.props;
    const { source, source2 } = this.state;
    return (
      <div className={style['city-group']}>
        <Dropdown
          source={source}
          onChange={this.handleChange.bind(this, 'city')}
          value={city}
          className={`${style['city-item']} ${style['city-item-first']}`}
          label="城市" />
        <Dropdown
          source={source2}
          onChange={this.handleChange.bind(this, 'area')}
          value={area}
          className={style['city-item']}
          label="区域" />
      </div>
    );
  }
}
