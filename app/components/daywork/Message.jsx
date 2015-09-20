import { React, Card, Router } from 'reapp-kit';
import Title from './JobTitle';
let { Link } = Router;

export default class extends React.Component {
  renderAddRecord({ job, recordNumber, jobId, userId, createdAt }) {
    let { payMethod, user, title, salary } = job;
    let unit;
    if (payMethod === 'Daily') {
      unit = '天';
    } else {
      unit = '时';
    }

    let msg = '@' + user.realName + '给您记了 ' + recordNumber + ' ' + unit;
    return (
      <Card title={<Title name={title} salary={salary + ' RMB / ' + unit} time={createdAt} />}
        onClick={() => this.router().transitionTo('workDetail1', { userId, jobId })}>
        {msg}
      </Card>
    );
  }
  renderCancelRecord({ job, recordNumber, jobId, userId, createdAt }) {
    let { payMethod, user, title, salary } = job;
    let unit;
    if (payMethod === 'Daily') {
      unit = '天';
    } else {
      unit = '时';
    }

    let msg = '@' + user.realName + '给您取消了 ' + recordNumber + ' ' + unit;
    return (
      <Card title={<Title name={title} salary={salary + ' RMB / ' + unit} time={createdAt} />}
        onClick={() => this.router().transitionTo('workDetail1', { userId, jobId })}>
        {msg}
      </Card>
    );
  }
  renderPaidRecord({ job, money, createdAt }) {
    let { user } = job;
    let msg = '@' + user.realName + '支付 ' + money + ' RMB 的工资给你';
    return (
      <Card title={<Title name={'支付'} time={createdAt} />}>
        {msg}
      </Card>
    );
  }
  renderRequestJob({ job, user, createdAt }) {
    let { jobId } = job;
    return (
      <Card title={<Title name={'工作请求'} time={createdAt} />}>
        <Link to="sub"> { user.realName } </Link>
        请求
        <Link to="jobDetail" params={{ jobId }}> {job.title} </Link>
      </Card>
    );
  }
  renderJoinJob({ jobId, user, title, createdAt }) {
    let msg = '@' + user.realName + ' 把您加入' + title + '工作';
    let userId = this.props.data.userId;
    return (
      <Card title={<Title name={'消息'} time={createdAt} />}
        onClick={() => this.router().transitionTo('workDetail1', { userId, jobId })}>
        {msg}
      </Card>
    );
  }
  render() {
    let { message, msgId, createdAt } = this.props.data;
    let actions = {
      addRecord: this.renderAddRecord,
      cancelRecord: this.renderCancelRecord,
      paidRecord: this.renderPaidRecord,
      requestJob: this.renderRequestJob,
      joinJob: this.renderJoinJob
    };
    let obj = message[message.type] || {};
    return actions[message.type]({ ...obj, msgId, createdAt });
  }
}
