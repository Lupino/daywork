import React, { Component, PropTypes } from 'react';
import {
  Card, CardActions, CardTitle, CardText, List, ListItem,
  Button, Dialog, Input, Dropdown
} from 'react-toolbox';

import style from '../style';
import { createPayment } from '../api';

const channels = [
  { value: 'alipay_wap', label: '支付宝' }
];

export default class Payment extends Component {
  state = {
    amount: 0,
    channel: 'alipay_wap'
  };

  handleShowBalance = () => {
    const { router } = this.context;
    router.push('/balance');
  };

  handleChange = (key, value) => {
    this.setState({ [key]: value });
  };

  handleCharge = () => {
    const { notify } = this.props;
    let { amount, channel } = this.state;
    const subject = '充值';
    const body = '每日工作余额充值';
    amount = Number(amount) * 100;

    createPayment({ subject, body, amount, channel }, (err, rsp) => {
      if (err) {
        return notify('充值失败');
      }
      pingpp.createPayment(rsp.payment.raw, (result, err) => {
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
    })
  };

  render() {
    const { amount, channel, active } = this.state;
    return (
      <section>
        <Card className={style.card}>
          <CardText>
            <Input type='number' label='金额(元)'
              onChange={this.handleChange.bind(this, 'amount')}
              value={amount || ''} />
            <Dropdown source={channels} value={channel}
              onChange={this.handleChange.bind(this, 'channel')} />
          </CardText>
          <CardActions>
            <Button label='关闭交易' accent raised onClick={this.handleShowBalance}/>
            <Button label='充值' raised primary onClick={this.handleCharge} />
          </CardActions>
        </Card>
      </section>
    );
  }
}

Payment.title = '余额充值';
Payment.contextTypes = {
  router: PropTypes.object
}
