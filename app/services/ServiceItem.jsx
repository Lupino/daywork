import React, { Component, PropTypes } from 'react';
import {
  Card, CardTitle, CardText, CardMedia, CardActions
} from 'react-toolbox';
import { prettyTime } from '../modules/utils';
import style from '../style';
import { imageRoot } from '../api';
import { getUnit } from '../modules/utils';

const getStatusString = (status) => {
  switch (status) {
      case 'Publish':
          return '该服务正在热卖中';
      case 'Finish':
          return '该服务已下架';
      case 'Delete':
          return '该服务被已删除';
      default:
          return '该服务未知状态';
  }
}

export default class ServiceItem extends Component {
  handleShowUserInfo(userId) {
    const { router } = this.context;
    router.push(`/user_info/${userId}`);
  }
  render() {
    const { service, heading, children } = this.props;
    const { image, title, unit, price, saledCount, summary, serviceId, createdAt, status,
      user, cityName, areaName, address } = service;
    return (
      <Card className={style.card}>
        { heading && user && <CardTitle
          avatar={user.avatar && user.avatar.key ? `${imageRoot}${user.avatar.key}` : '/static/default-avatar.png'}
          title={user.realName}
          subtitle={user.phoneNumber}
          onClick={this.handleShowUserInfo.bind(this, user.userId)}
        />}
        { image && image.key && <CardMedia aspectRatio='wide' image={`${imageRoot}${image.key}`} /> }
        <CardTitle
          title={title}
          className={style.cardTitle}
          subtitle={`${price} RMB/${getUnit(unit)}`}
          >
          <div className={style.date}>
            {prettyTime(createdAt)}
          </div>
        </CardTitle>
        <CardText>状态：{getStatusString(status)}</CardText>
        <CardText>{`销量：${saledCount || 0} ${getUnit(unit)}`}</CardText>
        <CardText>{summary}</CardText>
        <CardText>{`城市：${cityName || '不限'}`}</CardText>
        <CardText>{`区域：${areaName || '不限'}`}</CardText>
        <CardText>{`地址：${address || '不限'}`}</CardText>
        {children}
      </Card>
    );
  }
}

ServiceItem.propTypes = {
  service: PropTypes.object,
  heading: PropTypes.bool,
  children: PropTypes.any
}

ServiceItem.defaultProps = {
  heading: true,
  service: {}
}

ServiceItem.contextTypes = {
  router: PropTypes.object
}
