import React, { Component, PropTypes } from 'react';
import { Card, CardActions, CardTitle, Button, ProgressBar } from 'react-toolbox';

import style from '../style';
import { checkPayment } from '../api';

export default class Result extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    loaded: false,
    payment: {},
  };

  handleShowBalance = () => {
    const { router } = this.context;
    router.push('/balance');
  };

  checkPayment() {
    const { notify, location } = this.props;
    checkPayment(location.query.out_trade_no, (err, rsp) => {
      if (err) {
        return notify(err);
      }
      const { payment } = rsp;
      this.setState({ payment, loaded: true });
    });
  }

  componentDidMount() {
    this.checkPayment();
  }

  render() {
    const { location } = this.props;
    const { payment, loaded } = this.state;
    return (
      <section>
        <Card className={style.card}>
          { !loaded && <ProgressBar type="circular" mode="indeterminate" /> }
          { loaded && <CardTitle title='余额充值成功' /> }
          <CardActions>
            <Button label='查看余额' onClick={this.handleShowBalance} raised />
          </CardActions>
        </Card>
      </section>
    );
  }
}

Result.title = '支付结果';
Result.contextTypes = {
  router: PropTypes.object
}
