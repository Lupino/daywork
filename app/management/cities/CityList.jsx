import React, { Component, PropTypes } from 'react';

import { Table, ProgressBar, Navigation } from 'react-toolbox';
import { getCities } from '../../api';
import Pagenav from '../../modules/Pagenav';
import PasswordInput from '../../modules/input/PasswordInput';
import { prettyTime, getUnit } from '../../modules/utils';
import async from 'async';

const CityModel = {
  cityId: { type: String, title: '#' },
  cityName: { type: String, title: '城市' },
  createdAt: { type: String, title: '添加时间' }
};

export default class CityList extends Component {
  state = {
    selected: [],
    source: [],
    loaded: false
  };

  handleSelect = (selected) => {
    this.setState({selected});
  };

  handleShowEditCity = () => {
    const { selected, source } = this.state;
    if (selected.length === 0) {
      return;
    }
    const city = source[selected[0]];
    const { router } = this.context;
    router.push(`/management/cities/edit/${city.cityId}`);
  }

  handleShowArea = () => {
    const { selected, source } = this.state;
    if (selected.length === 0) {
      return;
    }
    const city = source[selected[0]];
    const { router } = this.context;
    router.push(`/management/cities/${city.cityId}/areas`);
  }

  handleShowAddArea = () => {
    const { selected, source } = this.state;
    if (selected.length === 0) {
      return;
    }
    const city = source[selected[0]];
    const { router } = this.context;
    router.push(`/management/cities/${city.cityId}/addArea`);
  }

  loadCityList(page) {
    const { notify } = this.props;

    this.setState({ loaded: false });
    getCities((err, rsp) => {
      if (err) {
        return notify(err);
      }

      const { cities } = rsp;

      const source = (cities || []).map((city) => {
        city.createdAt = prettyTime(city.createdAt);
        return city;
      });
      this.setState({ source, loaded: true });
    });
  }

  componentDidMount() {
    this.loadCityList();
  }

  render() {
    if (!this.state.loaded) {
      return <ProgressBar mode="indeterminate" />;
    }

    const { source, selected } = this.state;
    const actions = [
      { label: '查看区域', raised: true, disabled: selected.length !== 1, onClick: this.handleShowArea },
      { label: '添加区域', raised: true, disabled: selected.length !== 1, onClick: this.handleShowAddArea },
      { label: '编辑', raised: true, disabled: selected.length !== 1, onClick: this.handleShowEditCity }
    ]
    return (
      <section>
        <Navigation type='horizontal' actions={actions}>
        </Navigation>
        <Table
          model={CityModel}
          source={source}
          onSelect={this.handleSelect}
          selectable={true}
          selected={selected}
          />
        <Navigation type='horizontal' actions={actions} />
      </section>
    );
  }
}

CityList.contextTypes = {
  router: PropTypes.object
}
