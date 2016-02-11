import React, { Component, PropTypes } from 'react';
import {
  Card, CardActions, CardTitle, CardText, List, ListItem,
  Button, Dialog, Input, Dropdown
} from 'react-toolbox';

import SMSCodeInput from '../modules/input/SMSCodeInput';
import style from '../style';
import { drawMoney, sendSmsCode } from '../api';

const channels = [
  { value: 'alipay_wap', label: '支付宝' }
];

export default class DrawMoney extends Component {
  state = {
    amount: 0,
    channel: 'alipay_wap',
    account: '',
    smsCode: '',
    checkError: {}
  };

  handleShowBalance = () => {
    const { router } = this.context;
    router.push('/balance');
  };

  handleChange = (key, value) => {
    this.setState({ [key]: value });
  };

  handleSendSMSCode = () => {
    const profile = this.props.getProfile();
    sendSmsCode(profile.phoneNumber, (err) => {
      if (err) alert('验证码发送失败');
    });
  };

  handleDrawMoney = () => {
    const { router } = this.context;
    const { alert } = this.props;
    let { amount, channel, account, smsCode } = this.state;
    const subject = '提现';
    const body = '每日工作余额提现';
    const profile = this.props.getProfile();
    const avalableMoney = profile.remainMoney - profile.freezeMoney;
    amount = Number(amount) * 100;
    if (amount > avalableMoney * 100) {
      return alert({message: '提现金额不能大于可用余额！'});
    }

    drawMoney({ subject, body, amount, channel, smsCode, raw: { account } }, (err, rsp) => {
      if (err) {
        return alert({ title: '提现失败', message: err.message || err });
      }
      alert({ title: '提现申请成功', message: '我们将在 1~2 个工作日处理' }, () => {
        // router.push('/balance');
        window.location.href = '#/balance';
        window.location.reload();
      });
    });
  };

  render() {
    const { amount, channel, account, smsCode, checkError, active } = this.state;
    return (
      <section>
        <Card className={style.card}>
          <CardText>
            <Input type='number' label='金额(元)'
              onChange={this.handleChange.bind(this, 'amount')}
              value={amount || ''}
              error={checkError.amount}
            />
            <Dropdown source={channels} value={channel}
              onChange={this.handleChange.bind(this, 'channel')} />
            <Input type='text' label='帐号'
              onChange={this.handleChange.bind(this, 'account')}
              value={account || ''}
              error={checkError.account}
            />
            <SMSCodeInput
              type='number'
              label='短信验证码'
              name='smsCode'
              value={smsCode}
              onChange={this.handleChange.bind(this, 'smsCode')}
              onSendButtonClick={this.handleSendSMSCode}
              error={checkError.smsCode}
              />
          </CardText>
          <CardActions>
            <Button label='关闭交易' accent raised onClick={this.handleShowBalance}/>
            <Button label='提现' raised primary onClick={this.handleDrawMoney} />
          </CardActions>
        </Card>
      </section>
    );
  }
}

DrawMoney.title = '余额提现';
DrawMoney.contextTypes = {
  router: PropTypes.object
}
