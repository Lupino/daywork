import React, { Component, PropTypes } from 'react';
import { Input, Button, List } from 'react-toolbox';

import { updateCity } from '../../api/management';
import { getCity } from '../../api';

export default class EditCity extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cityName: ''
    }
  }

  handleInputChange = (name, value) => {
    this.setState({ [name]: value });
  };

  handleSave = () => {
    const { notify } = this.props;
    const { cityName } = this.state;
    const { router } = this.context;
    const { cityId } = this.props.params;

    if (!cityName) {
      return alert('请填写城市名称');
    }

    updateCity({ cityId, cityName }, (err, rsp) => {
      if (err) {
        return notify(err);
      }
      alert('更新城市成功')
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
    })
  }

  componentDidMount() {
    this.loadCity();
  }

  render() {
    const { cityName } = this.state;
    const { cityId } = this.props.params;
    return (
      <div style={{width: 600}}>
        <List selectable ripple>
          <li>
            <Input label="城市 ID"
              type='text'
              value={cityId}
              />
          </li>
          <li>
            <Input label="城市名称"
              type='text'
              value={cityName}
              onChange={this.handleInputChange.bind(this, 'cityName')} />
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

EditCity.contextTypes = {
  router: PropTypes.object
}
