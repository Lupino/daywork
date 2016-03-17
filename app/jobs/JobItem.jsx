import React, { Component, PropTypes } from 'react';
import {
  Card, CardTitle, CardText, CardMedia, CardActions
} from 'react-toolbox';
import { prettyTime, getCityName } from '../modules/utils';
import style from '../style';
import { imageRoot } from '../api';

export default class JobItem extends Component {
  render() {
    const { job, heading, children } = this.props;
    const { image, title, payMethod, salary, summary, jobId, createdAt, status,
      requiredPeople, user, city, address } = job;
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
          subtitle={`${salary} RMB/${payMethod === 'Daily' ? '天' : '时' }`}
          >
          <div className={style.date}>
            {prettyTime(createdAt)}
          </div>
        </CardTitle>
        <CardText>{summary}</CardText>
        <CardText>{`城市：${getCityName(city)}`}</CardText>
        <CardText>{`地址：${address || '不限'}`}</CardText>
        <CardText>{`需要人数：${requiredPeople > 0 ? requiredPeople + '个' : '不做限制'}`}</CardText>
        {children}
      </Card>
    );
  }
}

JobItem.propTypes = {
  job: PropTypes.object,
  heading: PropTypes.bool,
  children: PropTypes.any
}

JobItem.defaultProps = {
  heading: true,
  job: {}
}
