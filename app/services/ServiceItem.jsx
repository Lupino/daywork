import React, { Component, PropTypes } from 'react';
import {
  Card, CardTitle, CardText, CardMedia, CardActions
} from 'react-toolbox';
import { prettyTime, getCityName } from '../modules/utils';
import style from '../style';
import { imageRoot } from '../api';
import { getUnit } from '../modules/utils';

export default class ServiceItem extends Component {
  render() {
    const { service, heading, children } = this.props;
    const { image, title, unit, price, summary, serviceId, createdAt, status, user, city, address } = service;
    return (
      <Card className={style.card}>
        { heading && user && <CardTitle
          avatar={user.avatar && user.avatar.key ? `${imageRoot}${user.avatar.key}` : '/static/default-avatar.png'}
          title={user.realName}
          subtitle={user.phoneNumber}
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
        <CardText>{summary}</CardText>
        <CardText>{`城市：${getCityName(city)}`}</CardText>
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
