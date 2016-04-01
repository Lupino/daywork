import React, { Component, PropTypes } from 'react';
import { Input, Button, Dropdown } from 'react-toolbox';
import PasswordInput from '../../modules/input/PasswordInput';
import { generatePassword } from '../../modules/utils';
import style from './style';
import { updateUser } from '../../api/management';
import { upload, imageRoot, getUser } from '../../api';
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
    this.setState({[name]: value});
  };

  handleUpdateUser = () => {
    let checkError = {};
    let hasError = false;
    const { realName, avatar, sex, intro } = this.state;
    const { router } = this.context;
    const { notify } = this.props;
    const { userId } = this.props.params;
    updateUser({ userId, realName, avatar, sex, intro }, (err) => {
      if (err) {
          alert(err);
        return;
      }
      alert('修改成功');
      router.goBack();
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

  loadUser() {
    const { userId } = this.props.params;
    console.log(userId)
    getUser({ userId }, (err, rsp) => {
      if (err) {
        alert(err);
        return;
      }
      this.setState({ ...rsp.user });
    })
  }

  componentDidMount() {
    this.loadUser();
  }

  render() {
    const { phoneNumber, realName, passwd, sex, intro, avatar, checkError } = this.state;
    return (
      <section className={style.section}>
        <Input
          type='tel'
          label='手机号'
          value={phoneNumber}
          maxLength={11}
          />

        <Input
          type='text'
          label='姓名'
          value={realName}
          onChange={this.handleChange.bind(this, 'realName')}
          />

        <Dropdown
          source={sexes}
          label='性别'
          value={sex}
          onChange={this.handleChange.bind(this, 'sex')}
          />
        <Input
          multiline
          type='text'
          label='简介'
          className={style.intro}
          value={intro}
          onChange={this.handleChange.bind(this, 'intro')}
          />
        <Dropzone className={style.dropzone} onDrop={this.handleDrop}>
          { avatar && avatar.key ? <img src={`${imageRoot}${avatar.key}`} /> : '点击此处添加头像'}
        </Dropzone>
        <br />
        <Button label='修改' raised primary floating onClick={this.handleUpdateUser} / >
      </section>
    );
  }
}

AddUser.contextTypes = {
  router: PropTypes.object
}
