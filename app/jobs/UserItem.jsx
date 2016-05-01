import React, { Component, PropTypes } from 'react';
import {
  Card, CardTitle, CardText
} from 'react-toolbox';
import style from '../style';
import { imageRoot } from '../api';

export default class UserItem extends Component {
  handleShowUserInfo(userId) {
    const { router } = this.context;
    router.push(`/user_info/${userId}`);
  }
  render() {
    const { worker, children } = this.props;
    const { realName, avatar, phoneNumber, sex, userId } = worker.user;
    return (
      <Card className={style.card}>
        <CardTitle
          avatar={avatar && avatar.key ? `${imageRoot}${avatar.key}` : '/static/default-avatar.png'}
          title={realName}
          subtitle={phoneNumber}
          onClick={this.handleShowUserInfo.bind(this, userId)}
        />
        <CardText>{`性别 ${sex === 'M'? '男' : '女'}`}</CardText>
        {children}
      </Card>
    );
  }
}

UserItem.propTypes = {
  worker: PropTypes.object,
  children: PropTypes.any
}

UserItem.defaultProps = {
  worker: {}
}

UserItem.contextTypes = {
  router: PropTypes.object
}
