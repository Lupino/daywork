import React, { Component, PropTypes } from 'react';
import { Button, List, ListItem } from 'react-toolbox';
import { getSaledOrders, imageRoot } from '../api';
import { prettyTime } from '../modules/utils';
import lodash from 'lodash';
import style from '../style';

export default class Saled extends Component {
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

  loadSaledList(page) {
    page = page || 0;
    const { limit } = this.state;
    getSaledOrders({ page, limit: 10 }, (err, rsp) => {
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

  handlePublishSerivce = () => {
    const { router } = this.context;
    router.push(`/new_service`);
  };

  componentDidMount() {
    this.loadSaledList();
  }

  renderOrder(order) {
    const { id, amount, price, service, createdAt } = order;
    return (
      <ListItem
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

  renderPublishService() {
    return (
      <div>
        <Button
          label='还没有卖出服务, 快点击我发布服务'
          className={style['load-more']}
          onClick={this.handlePublishSerivce}
        />
      </div>
    );
  }

  render() {
    const orders = this.state.orders.map((order) => this.renderOrder(order));
    const { loadMoreButton, currentPage } = this.state;

    if (orders.length === 0) {
      return this.renderPublishService();
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
            onClick={this.loadSaledList.bind(this, currentPage + 1)}
          />
        }
      </div>
    );
  }
}

Saled.title = '我卖出的服务';
Saled.contextTypes = {
  router: PropTypes.object
}
