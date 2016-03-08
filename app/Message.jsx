import React, { Component, PropTypes } from 'react';
import { getMessages, imageRoot } from './api';
import JobItem from './jobs/JobItem';
import lodash from 'lodash';
import { List, ListItem } from 'react-toolbox';
import style from './style';
import { prettyTime } from './modules/utils';

export default class Message extends Component {
  state = {
    messages: [],
    loadMoreButton: false,
    currentPage: 0,
    loaded: false,
    limit: 10
  }
  loadMessage(page) {
    const { limit } = this.state;
    this.setState({ loaded: false });
    const { notify } = this.props;
    getMessages({ page, limit }, (err, rsp) => {
      if (err) {
        notify(err);
      }
      let { messages } = this.state;
      messages = messages.concat(lodash.clone(rsp.messages));
      messages = lodash.uniq(messages, 'msgId');
      const loadMoreButton = rsp.messages.length > limit;
      this.setState({messages, loadMoreButton, currentPage: Number(page), loaded: true});
    });
  }

  handleShowWork(jobId) {
    const { router } = this.context;
    router.push(`/works/${jobId}`);
  }

  handleShowRequest(jobId, userId) {
    const { router } = this.context;
    router.push(`/jobs/${jobId}/workers/${userId}/request`);
  }

  componentDidMount(){
    this.loadMessage();
  }

  renderRecord(msgId, record, message) {
    const { jobId, job, createdAt } = record;

    const { title, user } = job;
    const avatar=user.avatar && user.avatar.key ? `${imageRoot}${user.avatar.key}` :
      '/static/default-avatar.png';

    return (
      <ListItem
        avatar={avatar}
        caption={title}
        legend={message}
        key={msgId}
        onClick={this.handleShowWork.bind(this, jobId)}>
        <div className={style['right']}>
          { prettyTime(createdAt) }
        </div>
      </ListItem>
    );
  }

  renderAddRecord(msgId, record) {
    const { recordNumber, job } = record;

    const { payMethod, user } = job;

    const unit = payMethod === 'Daily' ? '天' : '小时';
    const message = `${user.realName}给您添加 ${recordNumber} ${unit}记录`

    return this.renderRecord(msgId, record, message);
  }

  renderCancelRecord(msgId, record) {
    const { recordNumber, job } = record;

    const { payMethod, user } = job;

    const unit = payMethod === 'Daily' ? '天' : '小时';
    const message = `${user.realName}取消您 ${recordNumber} ${unit}记录`
    return this.renderRecord(msgId, record, message);
  }

  renderPaidRecord(msgId, record) {
    const { money, job, payMethod } = record;
    const { user } = job;


    const payWay = payMethod === 'PaidOffline' ? '线下': '在线';
    const message = `${user.realName}${payWay}支付您 ${money} 元工资`
    return this.renderRecord(msgId, record, message);
  }

  renderRequestJob(msgId, worker) {
    const { user, job, createdAt, jobId, userId } = worker;
    const { title } = job;

    const avatar=user.avatar && user.avatar.key ? `${imageRoot}${user.avatar.key}` :
      '/static/default-avatar.png';

    const message = `${user.realName}请求您的职位`
    return (
      <ListItem
        avatar={avatar}
        caption={title}
        legend={message}
        key={msgId}
        onClick={this.handleShowRequest.bind(this, jobId, userId)}>
        <div className={style['right']}>
          { prettyTime(createdAt) }
        </div>
      </ListItem>
    );
  }

  renderJoinJob(msgId, job) {
    const { user, title, createdAt, jobId } = job;

    const avatar=user.avatar && user.avatar.key ? `${imageRoot}${user.avatar.key}` :
      '/static/default-avatar.png';

    const message = `${user.realName}同意您的工作请求`
    return (
      <ListItem
        avatar={avatar}
        caption={title}
        legend={message}
        key={msgId}
        onClick={this.handleShowWork.bind(this, jobId)}>
        <div className={style['right']}>
          { prettyTime(createdAt) }
        </div>
      </ListItem>
    );
  }

  render() {
    const renders = {
      addRecord: this.renderAddRecord.bind(this),
      paidRecord: this.renderPaidRecord.bind(this),
      cancelRecord: this.renderCancelRecord.bind(this),
      requestJob: this.renderRequestJob.bind(this),
      joinJob: this.renderJoinJob.bind(this)
    }
    const messages = this.state.messages.map(({ message, msgId, createdAt }) => {
      const type = message.type;
      let msg = message[type];
      msg.createdAt = createdAt;
      for (var k in message.content) {
        msg[k] = message.content[k];
      }
      const render = renders[type];
      if (render) {
        return render(msgId, msg);
      } else {
        return <li key={msgId}> </li>;
      }
    });

    const { loadMoreButton, currentPage } = this.state;
    return (
      <section>
        <List selectable={false} ripple>
          {messages.length === 0? <li>没有消息</li> : messages}
        </List>
        { loadMoreButton &&
          <Button
            label='加载更多...'
            raised
            primary
            className={style['load-more']}
            onClick={this.loadMoreButton.bind(this, currentPage + 1)}
          />
        }
      </section>
    );
  }
}

Message.title = '消息盒子';
Message.contextTypes = {
  router: PropTypes.object
}
