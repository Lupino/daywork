import React, { Component, PropTypes } from 'react';
import { Input, Button, List } from 'react-toolbox';

import { updateArea } from '../../api/management';
import { getArea } from '../../api';

export default class EditArea extends Component {
  constructor(props) {
    super(props);
    this.state = {
      areaName: '',
      cityName: ''
    }
  }

  handleInputChange = (name, value) => {
    this.setState({ [name]: value });
  };

  handleSave = () => {
    const { notify } = this.props;
    const { areaName } = this.state;
    const { router } = this.context;
    const { areaId } = this.props.params;

    if (!areaName) {
      return alert('请填写区域名称');
    }

    updateArea({ areaId, areaName }, (err, rsp) => {
      if (err) {
        return notify(err);
      }
      alert('更新城市成功')
      router.goBack();
    });
  };

  loadArea() {
    const { areaId } = this.props.params;
    getArea(areaId, (err, rsp) => {
      if (err) {
        return alert(err);
      }
      const { areaName, cityName } = rsp.area || {};
      this.setState({ areaName, cityName });
    })
  }

  componentDidMount() {
    this.loadArea();
  }

  render() {
    const { areaName, cityName } = this.state;
    const { areaId } = this.props.params;
    return (
      <div style={{width: 600}}>
        <List selectable ripple>
          <li>
            <Input label="城市" type='text' value={cityName} />
          </li>
          <li>
            <Input label="区域 ID" type='text' value={areaId} />
          </li>
          <li>
            <Input label="区域名称"
              type='text'
              value={areaName}
              onChange={this.handleInputChange.bind(this, 'areaName')} />
          </li>
        </List>
        <Button label='保存'
          raised
          primary
          floating
          onClick={this.handleSave} / >
      </div>
    );
  }
}

EditArea.contextTypes = {
  router: PropTypes.object
}
