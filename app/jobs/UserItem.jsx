import React, { Component, PropTypes } from 'react';
import {
  Card, CardTitle, CardText
} from 'react-toolbox';
import style from '../style';
import { imageRoot } from '../api';

export default class UserItem extends Component {
  render() {
    const { worker, children } = this.props;
    const { realName, avatar, phoneNumber, sex } = worker.user;
    return (
      <Card className={style.card}>
        <CardTitle
          avatar={avatar && avatar.key ? `${imageRoot}${avatar.key}` : '/static/default-avatar.png'}
          title={realName}
          subtitle={phoneNumber}
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
