import React, { Component, PropTypes } from 'react';
import { Input, Button, Switch,
  List, ListItem, ListSubHeader, ListCheckbox, ListDivider
} from 'react-toolbox';
import Dropzone from 'react-dropzone';

import style from '../../style';
import { upload, imageRoot } from '../../api';
import { getUnit } from '../../modules/utils';
import { addService } from '../../api/management';
import Categories from '../../modules/dropdown/Categories';
import Cities from '../../modules/dropdown/Cities';

export default class AddService extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      summary: '',
      price: 0,
      unit: 'Daily',
      status: 'Draft',
      image: {},
      category: '',
      city: '',
      address: '',
      errors: {}
    }
  }
  handleInputChange = (name, value) => {
    this.setState({ [name]: value });
  };
  handleSave = () => {
    const { notify } = this.props;
    const {title, summary, price} = this.state;
    const { router } = this.context;

    let hasError = false;
    let errors = {};
    if (!title) {
      errors.title = '请填写标题';
      hasError = true;
    }

    if (!price || Number(price) === 0) {
      errors.price = '请填写服务价格';
      hasError = true;
    }

    if (hasError) {
      this.setState({ errors });
      return notify('发现一些错误');
    }

    const { userId } = this.props.params;

    addService({...this.state, userId}, (err, rsp) => {
      if (err) {
        return notify(err);
      }
      alert('添加服务成功')
      router.goBack();
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
  render() {
    const { title, summary, price, unit, status, category, city, address, image, errors } = this.state;
    const categories = this.props.getCategories('service');
    return (
      <div style={{width: 600}}>
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
              categories={categories}
              onChange={this.handleInputChange.bind(this, 'category')}
              value={category} />
          </li>
          <li>
            <Cities
              label="城市"
              onChange={this.handleInputChange.bind(this, 'city')}
              value={city} />
          </li>
          <li>
            <Input label="地址"
              type='text'
              className={style.address}
              value={address}
              onChange={this.handleInputChange.bind(this, 'address')} />
          </li>
          <ListSubHeader caption='费用' />
          <ListCheckbox caption='按天计算'
            className={style.checkbox}
            checked={unit === 'Daily'}
            onChange={this.handleInputChange.bind(this, 'unit', 'Daily')} />
          <ListCheckbox caption='按小时计算'
            className={style.checkbox}
            checked={unit === 'Hourly'}
            onChange={this.handleInputChange.bind(this, 'unit', 'Hourly')} />
          <ListCheckbox caption='按次计算'
            className={style.checkbox}
            checked={unit === 'Timely'}
            onChange={this.handleInputChange.bind(this, 'unit', 'Timely')} />
          <ListCheckbox caption='按件计算'
            className={style.checkbox}
            checked={unit === 'Itemly'}
            onChange={this.handleInputChange.bind(this, 'unit', 'Itemly')} />
          <ListDivider />
          <li>
            <Input label={`每${getUnit(unit)}费用(元)`}
              type='number'
              value={price > 0 ? price : ''}
              error={errors.price}
              onChange={this.handleInputChange.bind(this, 'price')} />
          </li>
          <li>
            <Switch label='直接发布？'
              checked={ status === 'Publish'}
              onChange={this.handleInputChange.bind(this, 'status', status === 'Draft' ? 'Publish' : 'Draft')} />
          </li>
          <li>
            <Dropzone className={style.dropzone} onDrop={this.handleDrop}>
              { image && image.key ? <img src={`${imageRoot}${image.key}`} /> : <p>点击此处添加一张图片</p>}
            </Dropzone>
          </li>
        </List>
        <Button label={ status === 'Publish' ? '发布' : '保存草稿' }
          raised
          primary
          floating
          className={style.filled}
          onClick={this.handleSave} / >
      </div>
    );
  }
}

AddService.contextTypes = {
  router: PropTypes.object
}
