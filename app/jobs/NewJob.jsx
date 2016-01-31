import React, { Component } from 'react';
import { Input, Button, Switch,
  List, ListItem, ListSubHeader, ListCheckbox, ListDivider
} from 'react-toolbox';
import Dropzone from 'react-dropzone';

import style from '../style';
import { createJob, upload } from '../api';

export default class NewJob extends Component {
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
      errors: {}
    }
  }
  handleInputChange = (name, value) => {
    this.setState({ [name]: value });
  };
  handleSave = () => {
    const { notify } = this.props;
    const {title, summary, salary, requiredPeople} = this.state;

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

    createJob(this.state, (err, job) => {
      if (err) {
        return notify(err);
      }
      notify('成功添加新职位');
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
    const { title, summary, salary, payMethod, requiredPeople, status, image, errors } = this.state;
    return (
      <div>
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
              value={summary}
              onChange={this.handleInputChange.bind(this, 'summary')} />
          </li>
          <ListSubHeader caption='工资' />
          <ListCheckbox caption='按天计算'
            checked={payMethod === 'Daily'}
            onChange={this.handleInputChange.bind(this, 'payMethod', 'Daily')} />
          <ListCheckbox caption='按小时计算'
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
              { image && image.key ? <img src={`/upload/${image.key}`} /> : <p>点击此处添加一张图片</p>}
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

NewJob.title = '发布新职位';
