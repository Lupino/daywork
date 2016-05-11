import React, { Component, PropTypes } from 'react';
import { Input, Button, List } from 'react-toolbox';

import { addArea } from '../../api/management';
import { getCity } from '../../api';

export default class AddArea extends Component {
  constructor(props) {
    super(props);
    this.state = {
      areaId: '',
      areaName: '',
      cityName: ''
    }
  }
  handleInputChange = (name, value) => {
    this.setState({ [name]: value });
  };
  handleSave = () => {
    const { notify } = this.props;
    const { areaId, areaName } = this.state;
    const { router } = this.context;
    const { cityId } = this.props.params;

    if (!areaId) {
      return alert('请填写区域 ID');
    }

    if (!areaName) {
      return alert('请填写区域名称');
    }

    addArea({ areaId, areaName, cityId }, (err, rsp) => {
      if (err) {
        return notify(err);
      }
      alert('添加区域成功')
      router.goBack();
    });
  };

  loadCity() {
    const { cityId } = this.props.params;
    getCity(cityId, (err, rsp) => {
      if (err) {
        return alert(err);
      }
      const { cityName } = rsp.city || {};
      this.setState({ cityName });
    });
  }

  componentDidMount() {
    this.loadCity();
  }

  render() {
    const { areaName, areaId, cityName } = this.state;
    return (
      <div style={{width: 600}}>
        <List selectable ripple>
          <li>
            <Input label="城市" type='text' value={cityName} />
          </li>
          <li>
            <Input label="区域 ID"
              type='text'
              value={areaId}
              onChange={this.handleInputChange.bind(this, 'areaId')} />
          </li>
          <li>
            <Input label="区域名称"
              type='text'
              value={areaName}
              onChange={this.handleInputChange.bind(this, 'areaName')} />
          </li>
        </List>
        <Button label='添加'
          raised
          primary
          floating
          onClick={this.handleSave} / >
      </div>
    );
  }
}

AddArea.contextTypes = {
  router: PropTypes.object
}
