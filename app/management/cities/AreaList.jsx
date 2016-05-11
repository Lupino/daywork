import React, { Component, PropTypes } from 'react';

import { Table, ProgressBar, Navigation } from 'react-toolbox';
import { getAreas } from '../../api';
import Pagenav from '../../modules/Pagenav';
import PasswordInput from '../../modules/input/PasswordInput';
import { prettyTime, getAreaName, getUnit } from '../../modules/utils';
import async from 'async';

const AreaModel = {
  areaId: { type: String, title: '#' },
  cityName: { type: String, title: '城市' },
  areaName: { type: String, title: '区域' },
  createdAt: { type: String, title: '添加时间' }
};

export default class AreaList extends Component {
  state = {
    selected: [],
    source: [],
    loaded: false
  };

  handleSelect = (selected) => {
    this.setState({selected});
  };

  handleShowAddArea = () => {
    const { router } = this.context;
    const { cityId } = this.props.params;
    router.push(`/cities/${cityId}/addArea`);
  }


  handleShowEditArea = () => {
    const { selected, source } = this.state;
    if (selected.length === 0) {
      return;
    }
    const area = source[selected[0]];
    const { router } = this.context;
    router.push(`/areas/edit/${area.areaId}`);
  }

  loadAreaList(page) {
    const { notify } = this.props;
    const { cityId } = this.props.params;

    this.setState({ loaded: false });
    getAreas(cityId, (err, rsp) => {
      if (err) {
        return notify(err);
      }

      const { areas } = rsp;

      const source = (areas || []).map((area) => {
        area.createdAt = prettyTime(area.createdAt);
        return area;
      });
      this.setState({ source, loaded: true });
    });
  }

  componentDidMount() {
    this.loadAreaList();
  }

  render() {
    if (!this.state.loaded) {
      return <ProgressBar mode="indeterminate" />;
    }

    const { source, selected } = this.state;
    const actions = [
      { label: '添加', raised: true, onClick: this.handleShowAddArea },
      { label: '编辑', raised: true, disabled: selected.length !== 1, onClick: this.handleShowEditArea }
    ]
    return (
      <section>
        <Navigation type='horizontal' actions={actions}>
        </Navigation>
        <Table
          model={AreaModel}
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

AreaList.contextTypes = {
  router: PropTypes.object
}
