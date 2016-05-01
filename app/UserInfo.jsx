import React, { Component } from 'react';
import { List, ListItem, ListSubHeader, ListDivider, ListCheckbox, Avatar } from 'react-toolbox';
import ButtonInput from './modules/input/ButtonInput';
import SMSCodeInput from './modules/input/SMSCodeInput';
import style from './style';
import { getUser, imageRoot } from './api';

export default class UserInfo extends Component {
  state = {
    profile: {}
  };

  handleLoadProfile() {
    const { userId } = this.props.params;
    getUser({ userId }, (err, rsp) => {
      if (err) {
        return alert(err);
      }
      this.setState({ profile: rsp.user });
    });
  }

  componentDidMount() {
    this.handleLoadProfile();
  }
  render() {
    const profile = this.state.profile;
    let imgUrl = '/static/default-avatar.png';
    if (profile.avatar && profile.avatar.key) {
      imgUrl = `${imageRoot}${profile.avatar.key}`
    }

    return (
      <section>
        <List selectable ripple>
          <ListItem
            ripple={true}
            caption='头像'
          >
            <div className={style['avatar-outer']}>
              <div className={style['avatar-inner']}>
                <Avatar>
                  <img src={imgUrl} />
                </Avatar>
              </div>
            </div>
          </ListItem>
          <ListDivider />
          <ListItem
            ripple={true}
            caption='姓名'
          >
            <span className={style['legend-right']}> {profile.realName} </span>
          </ListItem>
          <ListDivider />
          <ListItem
            ripple={true}
            caption='性别'
            >
            <span className={style['legend-right']}> {profile.sex === 'M'?'男':'女'} </span>
          </ListItem>
          <ListDivider />
          <ListItem
            ripple={true}
            caption='手机'
          >
            <span className={style['legend-right']}> {profile.phoneNumber} </span>
          </ListItem>
          <ListDivider />
          <li className={style.intro}>
            <span className={style['intro-title']}> 简介 </span>
            <span className={style['intro-content']}> {profile.intro || '无'} </span>
          </li>
        </List>
      </section>
    );
  }
}
