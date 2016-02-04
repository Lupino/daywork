import React, { Component, PropTypes } from 'react';
import {
  Card, CardActions, CardTitle, CardText, List, ListItem,
  Button, IconButton
} from 'react-toolbox';

import style from './style';

export default class Balance extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    loadMoreButton: true,
    currentPage: 0,
    jobs: []
  };

  handleShowWorks = () => {
    const { router } = this.context;
    router.push('works');
  };

  render() {
    const profile = this.props.getProfile();
    return (
      <section>
        <Card className={style.card}>
          <CardTitle
            title='余额'
            subtitle='可提现'
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
            <Button label='充值' raised />
            <Button label='提现' raised />
          </CardActions>
        </Card>
      </section>
    );
  }
}

Balance.title = '帐户余额';
Balance.contextTypes = {
  router: PropTypes.object
}
