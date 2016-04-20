import React, { Component, PropTypes } from 'react';
import { Button, List, ListItem } from 'react-toolbox';
import { getPurchasedOrders, imageRoot } from '../api';
import { prettyTime } from '../modules/utils';
import lodash from 'lodash';
import style from '../style';

export default class Purchased extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      currentPage: 0,
      limit: 10,
      loadMoreButton: false,
      loaded: false
    }
  }

  loadPurchasedList(page) {
    page = page || 0;
    const { limit } = this.state;
    getPurchasedOrders({ page, limit: 10 }, (err, rsp) => {
      if (err) return window.alert(err);
      let { orders } = this.state;
      orders = orders.concat(lodash.clone(rsp.orders));
      orders = lodash.uniq(orders, 'id');
      const loadMoreButton = rsp.orders.length > limit;
      this.setState({orders, loadMoreButton, currentPage: Number(page), loaded: true});
    });
  }

  handleShowOrder(id) {
    const { router } = this.context;
    router.push(`/orders/${id}`);
  }

  handleFindSerivce = () => {
    const { router } = this.context;
    router.push(`/`);
  };

  componentDidMount() {
    this.loadPurchasedList();
  }

  renderOrder(order) {
    const { id, amount, price, service, createdAt } = order;
    let imgUrl = '/static/default-avatar.png';
    const avatar = service.user.avatar;
    if (avatar && avatar.key) {
      imgUrl = `${imageRoot}${avatar.key}`
    }
    return (
      <ListItem
        avatar={imgUrl}
        caption={service.title}
        key={id}
        legend={prettyTime(createdAt)}
        onClick={this.handleShowOrder.bind(this, id)}
        >
        <div className={style['right']}>
          {`${price} 元`}
        </div>
      </ListItem>
    );
  }

  renderFindService() {
    return (
      <div>
        <Button
          label='还没有购买服务, 快点击我找服务'
          className={style['load-more']}
          onClick={this.handleFindSerivce}
        />
      </div>
    );
  }

  render() {
    const orders = this.state.orders.map((order) => this.renderOrder(order));
    const { loadMoreButton, currentPage } = this.state;

    if (orders.length === 0) {
      return this.renderFindService();
    }

    return (
      <div>
        <List selectable={false} ripple>
          {orders}
        </List>
        { loadMoreButton &&
          <Button
            label='加载更多...'
            raised
            primary
            className={style['load-more']}
            onClick={this.loadPurchasedList.bind(this, currentPage + 1)}
          />
        }
      </div>
    );
  }
}

Purchased.title = '我买到的服务';
Purchased.contextTypes = {
  router: PropTypes.object
}
