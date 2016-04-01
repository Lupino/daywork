import React, { Component, PropTypes } from 'react';
import { Input, Button, List } from 'react-toolbox';

import { addCity } from '../../api/management';

export default class AddCity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cityId: '',
      cityName: ''
    }
  }
  handleInputChange = (name, value) => {
    this.setState({ [name]: value });
  };
  handleSave = () => {
    const { notify } = this.props;
    const { cityId, cityName } = this.state;
    const { router } = this.context;

    if (!cityId) {
      return alert('请填写城市 ID');
    }

    if (!cityName) {
      return alert('请填写城市名称');
    }

    addCity({ cityId, cityName }, (err, rsp) => {
      if (err) {
        return notify(err);
      }
      alert('添加城市成功')
      router.goBack();
    });
  };

  render() {
    const { cityName, cityId } = this.state;
    return (
      <div style={{width: 600}}>
        <List selectable ripple>
          <li>
            <Input label="城市 ID"
              type='text'
              value={cityId}
              onChange={this.handleInputChange.bind(this, 'cityId')} />
          </li>
          <li>
            <Input label="城市名称"
              type='text'
              value={cityName}
              onChange={this.handleInputChange.bind(this, 'cityName')} />
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

AddCity.contextTypes = {
  router: PropTypes.object
}
