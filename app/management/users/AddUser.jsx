import React, { Component, PropTypes } from 'react';
import { Input, Button, Dropdown } from 'react-toolbox';
import PasswordInput from '../../modules/input/PasswordInput';
import { generatePassword } from '../../modules/utils';
import style from './style';
import { addUser } from '../../api/management';
import { upload, imageRoot } from '../../api';
import Dropzone from 'react-dropzone';

const sexes = [
  { value: 'O', label: '保密' },
  { value: 'F', label: '女' },
  { value: 'M', label: '男' }
];

export default class AddUser extends Component {
  constructor(props) {
    super(props)
    this.state = {
      phoneNumber: '',
      realName: '',
      passwd: generatePassword(8),
      sex: 'O',
      intro: '',
      avatar: {},
      checkError: {}
    };
  }

  handleChange = (name, value) => {
    this.setState({...this.state, [name]: value});
  };

  handleAddUser = () => {
    let checkError = {};
    let hasError = false;
    const { phoneNumber, realName, passwd } = this.state;
    const { router } = this.context;
    const { notify } = this.props;
    const next = this.props.location.query.next;
    if (!/\d{11}/.exec(phoneNumber)) {
      checkError.phoneNumber = '请填写正确的手机号码';
      hasError = true;
    }

    if (!realName) {
      checkError.realName = '请填写您的姓名';
      hasError = true;
    }

    if (!passwd) {
      checkError.passwd = '请填写密码';
      hasError = true;
    }

    if (hasError) {
      this.setState({ checkError });
      return;
    }

    addUser({ phoneNumber, realName, passwd }, (err) => {
      if (err) {
        if (/phoneNumber/.exec(err)) {
          checkError.phoneNumber = `手机号码已经被注册了`;
          this.setState({ checkError });
        } else {
          alert(err);
        }
        return;
      }
      if (confirm('添加成功，继续添加？')) {
        this.setState({
          passwd: generatePassword(8),
          phoneNumber: '',
          realName: '',
          intro: '',
          sex: 'O',
          avatar: {},
          checkError: {}
        });
      } else {
        router.push('/users');
      }
    });
  };

  handleDrop = (files) => {
    const { notify } = this.props;
    upload(files, (err, files) => {
      if (err) {
        return notify(err);
      }
      this.setState({ avatar: files[0] });
    });
  };

  render() {
    const { phoneNumber, realName, passwd, sex, intro, avatar, checkError } = this.state;
    return (
      <section className={style.section}>
        <Input
          type='tel'
          label='手机号'
          value={phoneNumber}
          onChange={this.handleChange.bind(this, 'phoneNumber')}
          maxLength={11}
          error={checkError.phoneNumber}
          />

        <Input
          type='text'
          label='姓名'
          value={realName}
          autoComplete="off"
          onChange={this.handleChange.bind(this, 'realName')}
          error={checkError.realName}
          />

        <PasswordInput
          label='密码'
          value={passwd}
          onChange={this.handleChange.bind(this, 'passwd')}
          autoComplete="off"
          error={checkError.passwd}
          />

        <Dropdown
          source={sexes}
          label='性别'
          value={sex}
          onChange={this.handleChange.bind(this, 'sex')}
          error={checkError.sex}
          />
        <Input
          multiline
          type='text'
          label='简介'
          className={style.intro}
          value={intro}
          onChange={this.handleChange.bind(this, 'intro')}
          error={checkError.intro}
          />
        <Dropzone className={style.dropzone} onDrop={this.handleDrop}>
          { avatar && avatar.key ? <img src={`${imageRoot}${avatar.key}`} /> : '点击此处添加头像'}
        </Dropzone>
        <br />
        <Button label='添加' raised primary floating onClick={this.handleAddUser} / >
      </section>
    );
  }
}

AddUser.contextTypes = {
  router: PropTypes.object
}
