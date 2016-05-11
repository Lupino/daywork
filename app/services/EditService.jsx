import React, { Component, PropTypes } from 'react';
import { Input, Button, Switch,
  List, ListItem, ListSubHeader, ListCheckbox, ListDivider
} from 'react-toolbox';
import Dropzone from 'react-dropzone';

import style from '../style';
import { getService, updateService, upload, imageRoot } from '../api';
import Categories from '../modules/dropdown/Categories';
import Cities from '../modules/dropdown/Cities';

export default class EditService extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      summary: '',
      image: {},
      category: '',
      city: '',
      area: '',
      address: '',
      errors: {},
      loaded: false
    }
  }
  handleInputChange = (name, value) => {
    this.setState({ [name]: value });
  };
  handleSave = () => {
    const { params, notify } = this.props;
    const serviceId = params.serviceId;
    const { title, summary, image, category, city, area, address } = this.state;
    const { router } = this.context;

    let hasError = false;
    let errors = {};
    if (!title) {
      errors.title = '请填写标题';
      hasError = true;
    }

    if (hasError) {
      this.setState({ errors });
      return notify('发现一些错误');
    }

    updateService({ serviceId, title, summary, image, category, city, area, address }, (err, service) => {
      if (err) {
        return notify(err);
      }
      notify('成功更新服务', () => router.goBack());
    });
  };
  handleDrop = (files) => {
    const { notify } = this.props;
    upload(files, (err, files) => {
      if (err) {
        return notify(err);
      }
      this.setState({ image: files[0] });
    });
  };
  loadService = () => {
    const { params } = this.props;
    const serviceId = params.serviceId;
    getService({ serviceId }, (err, rsp) => {
      if (err) {
        return notify(err);
      }
      const { title, summary, image, category, city, area, address } = rsp.service;
      this.setState({ title, summary, image, category, city, area, address, loaded: true });
    })
  };
  componentDidMount() {
    this.loadService();
  }
  render() {
    const { title, summary, image, category, city, area, address, errors } = this.state;
    return (
      <div data-name='edit-service'>
        <List selectable ripple>
          <li>
            <Input label="服务的标题"
              type='text'
              value={title}
              error={errors.title}
              onChange={this.handleInputChange.bind(this, 'title')} />
          </li>
          <li>
            <Input label="简要描述"
              type='text'
              multiline
              className={style.summary}
              value={summary}
              onChange={this.handleInputChange.bind(this, 'summary')} />
          </li>
          <li>
            <Categories
              label="分类"
              type="service"
              onChange={this.handleInputChange.bind(this, 'category')}
              value={category} />
          </li>
          <li>
            <Cities
              onChange={this.handleInputChange.bind(this)}
              city={city}
              area={area}
            />
          </li>
          <li>
            <Input label="地址"
              type='text'
              className={style.address}
              value={address}
              onChange={this.handleInputChange.bind(this, 'address')} />
          </li>
          <li>
            <Dropzone className={style.dropzone} onDrop={this.handleDrop}>
              { image && image.key ? <img src={`${imageRoot}${image.key}`} /> : '点击此处添加一张图片'}
            </Dropzone>
          </li>
        </List>
        <Button label='保存'
          raised
          primary
          floating
          className={style.filled}
          onClick={this.handleSave} / >
      </div>
    );
  }
}

EditService.contextTypes = {
  router: PropTypes.object
}
