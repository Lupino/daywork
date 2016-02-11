import React, { Component, PropTypes } from 'react';
import { Card, CardActions, CardTitle, Button } from 'react-toolbox';

import style from '../style';

export default class Cancel extends Component {
  handleShowBalance = () => {
    const { router } = this.context;
    router.push('/balance');
  };

  render() {
    return (
      <section>
        <Card className={style.card}>
          <CardTitle title='交易已被取消' />
          <CardActions>
            <Button label='查看余额' onClick={this.handleShowBalance} raised />
          </CardActions>
        </Card>
      </section>
    );
  }
}

Cancel.title = '支付结果';
Cancel.contextTypes = {
  router: PropTypes.object
}
