import React, { Component } from 'react';
import { List, ListItem, ListSubHeader, ListDivider, ListCheckbox, Button } from 'react-toolbox';
import Avatar from './modules/list/Avatar';
import ButtonInput from './modules/input/ButtonInput';
import SMSCodeInput from './modules/input/SMSCodeInput';
import style from './style';
import { updateProfile, updateAvatar, logOut, imageRoot } from './api';

class ListInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value
    }
  }

  handleChange = (value) => {
    this.setState({value});
  };

  handleClick = () => {
    if (this.props.onClick) {
      this.props.onClick(this.state.value);
    }
  };

  renderConent() {
    const { show, caption } = this.props;
    const { value } = this.state;

    if (show) {
      return (
        <div>
          <ButtonInput
            label={caption}
            value={value}
            btnLabel='保存'
            btnProps={{accent: true}}
            onClick={this.handleClick}
            onChange={this.handleChange}
          />
        </div>
      );
    }
    return null;
  }

  componentWillReceiveProps(props) {
    if (this.state.value !== props.value) {
      this.setState({value: props.value});
    }
  }

  render() {
    return (
      <li className={style['list-input']}>
        {this.renderConent()}
      </li>
    )
  }
}

class ListSex extends Component {
  handleCheckboxChange = (sex) => {
    if (this.props.onChange) {
      this.props.onChange(sex);
    }
  };

  renderConent() {
    const { value, show } = this.props;

    const getIcon = (v) => {
      if (value === v) {
        return 'check_box';
      }
      return 'check_box_outline_blank';
    };

    if (show) {
      return (
        <List selectable ripple>
          <ListItem
            ripple={true}
            caption='男'
            onClick={this.handleCheckboxChange.bind(this, 'M')}
            leftIcon={getIcon('M')} />
          <ListItem
            ripple={true}
            caption='女'
            onClick={this.handleCheckboxChange.bind(this, 'F')}
            leftIcon={getIcon('F')} />
        </List>
      );
    }
    return null;
  }

  componentWillReceiveProps(props) {
  }

  render() {
    return (
      <li className={style['list-input']}>
        {this.renderConent()}
      </li>
    )
  }
}

export default class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showInput: ''
    }
  }

  handleShowInput = (showInput) => {
    if (showInput === this.state.showInput) {
      showInput = '';
    }
    this.setState({ showInput })
  };

  handleUpdate = (name, value) => {
    const { notify } = this.props;
    this.props.onProfileUpdated(name, value);
    this.setState({showInput: ''});
    updateProfile({[name]: value}, (err) => {
      if (err) {
        notify('更新失败');
      }
    })
  };

  handleDrop = (files) => {
    const { notify } = this.props;
    updateAvatar(files[0], (err, file) => {
      if (err) {
        notify(err);
        return;
      }
      this.props.onProfileUpdated('avatar', file);
    });
  };

  handleLogOut = () => {
    const { confirm } = this.props;
    confirm({ title: '确定退出当前帐号？' }, (out) => {
      if (out) {
        logOut((err) => {
          window.location.reload();
        });
      }
    });
  };

  render() {
    const profile = this.props.getProfile();
    let imgUrl = '/static/default-avatar.png';
    if (profile.avatar && profile.avatar.key) {
      imgUrl = `${imageRoot}${profile.avatar.key}`
    }

    const { showInput } = this.state;
    const getArrow = (name) => {
      if (showInput === name) {
        return 'keyboard_arrow_down';
      }
      return 'chevron_right';
    }
    const show = (name) => {
      if (showInput === name) {
        return true;
      }
      return false;
    }
    return (
      <section>
        <List selectable ripple>
          <Avatar
            ripple={true}
            avatar={imgUrl}
            caption='头像'
            rightIcon='chevron_right'
            onDrop={this.handleDrop}
          />
          <ListDivider />
          <ListItem
            ripple={true}
            caption='姓名'
            rightIcon={getArrow('realName')}
            onClick={this.handleShowInput.bind(this, 'realName')}>
            <span className={style['legend-right']}> {profile.realName} </span>
          </ListItem>
          <ListInput
            caption='姓名'
            value={profile.realName}
            show={show('realName')}
            onClick={this.handleUpdate.bind(this, 'realName')}
          />
          <ListDivider />
          <ListItem
            ripple={true}
            caption='性别'
            rightIcon={getArrow('sex')}
            onClick={this.handleShowInput.bind(this, 'sex')}>
            <span className={style['legend-right']}> {profile.sex === 'M'?'男':'女'} </span>
          </ListItem>
          <ListSex
            value={profile.sex}
            show={show('sex')}
            onChange={this.handleUpdate.bind(this, 'sex')}
          />
          <ListDivider />
          <ListItem
            ripple={true}
            caption='手机'
          >
            <span className={style['legend-right']}> {profile.phoneNumber} </span>
          </ListItem>
        </List>
        <Button
          label='退出当前帐号'
          accent raised
          className={style['load-more']}
          onClick={this.handleLogOut} />
      </section>
    );
  }
}

Profile.title = '账户信息';
