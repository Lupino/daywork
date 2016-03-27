import React, { Component, PropTypes } from 'react';
import { Input, Button, Switch,
  List, ListItem, ListSubHeader, ListCheckbox, ListDivider
} from 'react-toolbox';
import Dropzone from 'react-dropzone';

import style from '../../style';
import { upload, imageRoot } from '../../api';
import { addJob } from '../../api/management';
import Categories from '../../modules/dropdown/Categories';
import Cities from '../../modules/dropdown/Cities';

export default class AddJob extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      summary: '',
      salary: 0,
      payMethod: 'Daily',
      requiredPeople: 0,
      status: 'Draft',
      image: {},
      category: '',
      city: 'xiamen',
      address: '',
      errors: {}
    }
  }
  handleInputChange = (name, value) => {
    this.setState({ [name]: value });
  };
  handleSave = () => {
    const { notify } = this.props;
    const {title, summary, salary, requiredPeople} = this.state;
    const { router } = this.context;

    let hasError = false;
    let errors = {};
    if (!title) {
      errors.title = '请填写标题';
      hasError = true;
    }

    if (!salary || Number(salary) === 0) {
      errors.salary = '请填写单位工资';
      hasError = true;
    }

    if (hasError) {
      this.setState({ errors });
      return notify('发现一些错误');
    }

    const { userId } = this.props.params;

    addJob({...this.state, userId}, (err, rsp) => {
      if (err) {
        return notify(err);
      }
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
    const { title, summary, salary, payMethod, requiredPeople, status, category,
      city, address, image, errors } = this.state;
    const categories = this.props.getCategories('job');
    const { router } = this.context;
    return (
      <div style={{width: 600}}>
        <List selectable ripple>
          <li>
            <Input label="职位的标题"
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
          <ListSubHeader caption='工资' />
          <ListCheckbox caption='按天计算'
            className={style.checkbox}
            checked={payMethod === 'Daily'}
            onChange={this.handleInputChange.bind(this, 'payMethod', 'Daily')} />
          <ListCheckbox caption='按小时计算'
            className={style.checkbox}
            checked={payMethod === 'Hourly'}
            onChange={this.handleInputChange.bind(this, 'payMethod', 'Hourly')} />
          <ListDivider />
          <li>
            <Input label={payMethod === 'Daily' ? '每天工资(元)' : '每小时工资(元)'}
              type='number'
              value={salary > 0 ? salary : ''}
              error={errors.salary}
              onChange={this.handleInputChange.bind(this, 'salary')} />
          </li>
          <li>
            <Input label="需要人数，默认不做限制"
              type='number'
              value={requiredPeople > 0 ? requiredPeople : ''}
              onChange={this.handleInputChange.bind(this, 'requiredPeople')} />
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

AddJob.contextTypes = {
  router: PropTypes.object
}
