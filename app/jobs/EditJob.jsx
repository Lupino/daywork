import React, { Component } from 'react';
import { Input, Button, Switch,
  List, ListItem, ListSubHeader, ListCheckbox, ListDivider
} from 'react-toolbox';
import Dropzone from 'react-dropzone';

import style from '../style';
import { getJob, updateJob, upload, imageRoot } from '../api';

export default class NewJob extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      summary: '',
      image: {},
      errors: {},
      loaded: false
    }
  }
  handleInputChange = (name, value) => {
    this.setState({ [name]: value });
  };
  handleSave = () => {
    const { params, notify } = this.props;
    const jobId = params.jobId;
    const { title, summary, image } = this.state;

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

    updateJob({ jobId, title, summary, image }, (err, job) => {
      if (err) {
        return notify(err);
      }
      notify('成功更新职位');
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
  loadJob = () => {
    const { params } = this.props;
    const jobId = params.jobId;
    getJob({ jobId }, (err, rsp) => {
      if (err) {
        return notify(err);
      }
      const { title, summary, image } = rsp.job;
      this.setState({ title, summary, image, loaded: true });
    })
  };
  componentDidMount() {
    this.loadJob();
  }
  render() {
    const { title, summary, image, errors } = this.state;
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
              className={style.summary}
              value={summary}
              onChange={this.handleInputChange.bind(this, 'summary')} />
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

NewJob.title = '编辑职位';
