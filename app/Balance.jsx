import React, { Component, PropTypes } from 'react';
import {
  Card, CardActions, CardTitle, List, ListItem,
  Button
} from 'react-toolbox';

import style from './style';
import { getPayments, cancelPayment } from './api';
import lodash from 'lodash';

export default class Balance extends Component {
  constructor(props) {
    super(props);
  }
  state = {
    payments: [],
    limit: 10,
    loaded: false
  };

  handleShowWorks = () => {
    const { router } = this.context;
    router.push('/works');
  };

  handleShowPayment = () => {
    const { router } = this.context;
    router.push('/payment');
  };

  handleShowDrawMoney = () => {
    const { router } = this.context;
    router.push('/drawmoney');
  };

  handleCharge(idx) {
    const { notify } = this.props;
    const payment = this.state.payments[idx];
    console.log(payment);
    pingpp.createPayment(payment.raw, (result, err) => {
      if (result == 'success') {
        // 只有微信公众账号 wx_pub 支付成功的结果会在这里返回，
        // 其他的 wap 支付结果都是在 extra 中对应的 URL 跳转。
      } else if (result == 'fail') {
        // charge 不正确或者微信公众账号支付失败时会在此处返回
        console.log(err);
        notify('充值失败');
      } else if (result == 'cancel') {
        // 微信公众账号支付取消支付
        console.log(err);
        notify('充值失败');
      }
    });
  };

  handleCancelPayment(idx) {
    const { notify } = this.props;
    const payment = this.state.payments[idx];
    cancelPayment(payment.order_no, (err, rsp) => {
      if (err) {
        return notify(err);
      }
      notify('取消成功', () => {
        window.location.reload();
      })
    });
  }

  handleDialog(idx) {
    const { notify, dialog } = this.props;
    const payment = this.state.payments[idx];
    if (payment.status !== 'Unpaid') {
      return;
    }
    let actions = [
      {label: '关闭', raised: true},
      { label: '取消交易', raised: true, accent: true,
        onClick: this.handleCancelPayment.bind(this, idx) }
    ];
    if (payment.type === 'charge') {
      actions.push({ label: '支付', raised: true,
                   onClick: this.handleCharge.bind(this, idx) });
    }
    dialog({
      title: `${payment.subject} ${payment.amount / 100} 元`,
      children: <div> {payment.body} </div>,
      actions
    });
  }

  handleLoadPayments(page) {
    page = page || 0;
    const { limit } = this.state;
    getPayments({page, limit}, (err, rsp) => {
      console.log(err, rsp)
      if (err) return window.alert(err);
      let { payments } = this.state;
      payments = payments.concat(lodash.clone(rsp.payments));
      payments = lodash.uniq(payments, 'id');
      const loadMoreButton = rsp.payments.length >= limit;
      this.setState({payments, loadMoreButton, currentPage: Number(page), loaded: true});
    });
  }

  renderPayment(payment, idx) {
    const status = payment.status === 'Unpaid'? '未支付' :
                   payment.status === 'Proc'? '交易中' :
                   payment.status === 'Paid' ? '已支付' :
                   payment.status === 'Cancel' ? '已取消' : '未知状态';
    return (
      <ListItem
        caption={`${payment.subject} (${status})`}
        legend={payment.body}
        key={payment.id}
        onClick={this.handleDialog.bind(this, idx)}
        >
        <div className={style['right']}>
          {`${payment.amount / 100} 元`}
        </div>
      </ListItem>
    );
  }

  componentDidMount() {
    const { location } = this.props;
    if (location.query.reload) {
      window.location.reload();
      return;
    }
    this.handleLoadPayments();
  }

  render() {
    const profile = this.props.getProfile();
    const payments = this.state.payments.map((payment, idx) => this.renderPayment(payment, idx));
    const { loadMoreButton, currentPage } = this.state;
    return (
      <section>
        <Card className={style.card}>
          <CardTitle
            title='余额'
            subtitle={`冻结金额 ${profile.freezeMoney} 元`}
            className={style.cardTitle}
            >
            <div className={style.right}>
              {`${profile.remainMoney} 元`}
            </div>
          </CardTitle>
            <List selectable={false} ripple>
              <ListItem caption='总工资'>
                <div className={style['right']}>
                  {`${profile.totalSalary} 元`}
                </div>
              </ListItem>
              <ListItem caption='在线支付'>
                <div className={style['right']}>
                  {`${profile.paidOnline} 元`}
                </div>
              </ListItem>
              <ListItem caption='线下支付'>
                <div className={style['right']}>
                  {`${profile.paidOffline} 元`}
                </div>
              </ListItem>
              <ListItem caption='待支付'>
                <div className={style['right']}>
                  {`${profile.unpaid} 元`}
                </div>
              </ListItem>
            </List>
          <CardActions>
            <Button label='查看我的工作' raised onClick={this.handleShowWorks}/>
            <Button label='充值' raised onClick={this.handleShowPayment} />
            <Button label='提现' raised onClick={this.handleShowDrawMoney} />
          </CardActions>
        </Card>
        <List selectable={false} ripple>
          {payments}
        </List>
        { loadMoreButton &&
          <Button
            label='加载更多...'
            raised
            primary
            className={style['load-more']}
            onClick={this.handleLoadPayments.bind(this, currentPage + 1)}
          />
        }
      </section>
    );
  }
}

Balance.title = '帐户余额';
Balance.contextTypes = {
  router: PropTypes.object
}
