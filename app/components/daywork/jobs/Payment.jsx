import { React, View, BackButton, Button, Container, Input,
  List, Title, Icon, store } from 'reapp-kit';
import { host } from '../../../config';
import request from 'superagent';
import { modal } from '../../lib/higherOrderComponent';
import RecordTitle from './../RecordTitle';

export default store.cursor(['profile', 'oauthToken'], modal(class extends React.Component {
  state = {
    step: 0,
    payment: {},
    byOnline: false
  }
  getConstant(name) {
    return this.context.theme.constants[name];
  }
  handleMethod(byOnline) {
    if (byOnline) {
      this.props.alert('暂时不支持在线支付');
    }
    // this.setState({ byOnline: byOnline });
  }
  handlePayOffline() {
    this.props.confirm('确定支付？', () => {
      let money = Number(this.refs.money.getDOMNode().value.trim());
      let payment = this.state.payment;
      let data = {
        id: payment.id,
        money: money,
        access_token: this.props.oauthToken.get('accessToken')
      };
      request.post(host + '/api/jobs/' + payment.jobId + '/payOffline', data,
                   (err, res) => {
                     if (err) {
                       return this.props.alert('网络错误');
                     }
                     let rsp = res.body;
                     if (rsp.err) {
                       return this.props.alert(rsp.msg || rsp.err);
                     }
                     this.props.alert('支付成功', () => {
                       this.router().transitionTo('jobDetail',
                                                  { jobId: payment.jobId });
                     });
                   });
    });
  }
  loadPayment() {
    let jobId = Number(this.context.router.getCurrentParams().jobId);
    let userId = Number(this.context.router.getCurrentParams().userId);
    let accessToken = this.props.oauthToken.get('accessToken');
    request.get(host + '/api/jobs/' + jobId + '/payment/' + userId + '?access_token=' + accessToken,
                (err, res) => {
                  if (err) {
                    return this.props.alert('网络错误');
                  }
                  let rsp = res.body;
                  if (rsp.err) {
                    return this.props.alert(rsp.msg || rsp.err);
                  }
                  this.setState(rsp);
                });
  }

  renderLoading() {
    return (
      <Container style={{
        marginTop: 10,
        textAlign: 'center'
      }} wrap>
        正在努力加载中...
      </Container>
    );
  }

  renderHeader() {
    let payment = this.state.payment;
    let user = payment.user;
    let totalSalary = payment.totalSalary + ' RMB';
    let unpaid = '待发工资: ' + payment.unpaid + ' RMB';
    return (
      <List>
        <List.Item title={<RecordTitle name={user.realName} salary={totalSalary} />}>
          {unpaid}
        </List.Item>
      </List>
    );
  }

  renderSetup0() {
    let card = this.renderHeader();
    return (
      <div>
        {card}
        <br />
        <List>
          <List.Item before='支付金额'>
            <Input ref='money'
              type="text" placeholder="请填写支付的金额" />
          </List.Item>
        </List>
        <Title>支付方式</Title>
        <List>
          <List.Item title="在线支付"
            onTap={this.handleMethod.bind(this, true)}
            after={
              <Icon
                file={require('reapp-kit/icons/check.svg')}
                size={24}
                color={this.getConstant(this.state.byOnline ? 'active' : 'inactive')}
                styles={{ self: { margin: 'auto' } }}
                />
            } />
          <List.Item title="线下支付"
            onTap={this.handleMethod.bind(this, false)}
            after={
              <Icon
                file={require('reapp-kit/icons/check.svg')}
                size={24}
                color={this.getConstant(this.state.byOnline ? 'inactive' : 'active')}
                styles={{ self: { margin: 'auto' } }}
                />
            } />
        </List>
        <br />
        <Button onTap={this.handlePayOffline}> 支付 </Button>
      </div>
    );
  }
  componentDidMount() {
    this.loadPayment();
  }
  render() {
    const backButton =
      <BackButton onTap={() => window.history.back()} />;

    let stepBody;
    if (this.state.payment.user) {
      let steps = [this.renderSetup0, this.renderStep1];
      stepBody = steps[this.state.step]();
    } else {
      stepBody = this.renderLoading();
    }

    return (
      <View {...this.props} title={[
        backButton,
        '支付'
      ]}>
      {stepBody}
      </View>
    );
  }
}));
