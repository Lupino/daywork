import React, { Component, PropTypes } from 'react';
import {
  Card, CardTitle, CardText, CardMedia, CardActions
} from 'react-toolbox';
import { prettyTime } from '../modules/utils';
import style from '../style';
import { imageRoot } from '../api';

export default class JobItem extends Component {
  handleShowUserInfo(userId) {
    const { router } = this.context;
    router.push(`/user_info/${userId}`);
  }
  render() {
    const { job, heading, children } = this.props;
    const { image, title, payMethod, salary, summary, jobId, createdAt, status,
      requiredPeople, workerCount, user, cityName, areaName, address } = job;
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
          subtitle={`${salary} RMB/${payMethod === 'Daily' ? '天' : '时' }`}
          >
          <div className={style.date}>
            {prettyTime(createdAt)}
          </div>
        </CardTitle>
        <CardText>{summary}</CardText>
        <CardText>{`城市：${cityName || '不限'}`}</CardText>
        <CardText>{`区域：${areaName || '不限'}`}</CardText>
        <CardText>{`地址：${address || '不限'}`}</CardText>
        <CardText>{`需要人数：${workerCount || 0} / ${requiredPeople > 0 ? requiredPeople + '个' : '不限'}`}</CardText>
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

JobItem.contextTypes = {
  router: PropTypes.object
}
