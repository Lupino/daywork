import React, { Component, PropTypes } from 'react';
import { List, ListItem, ProgressBar, Navigation } from 'react-toolbox';
import {
  getServiceOrder,
  payServiceOrder,
  cancelServiceOrder,
  dealingServiceOrder,
  dealtServiceOrder,
  finishServiceOrder
} from '../api';
import { prettyTime, getOrderStatus, getUnit } from '../modules/utils';
import lodash from 'lodash';
import style from '../style';

export default class Order extends Component {
  constructor(props) {
    super(props);
    this.state = {
      order: {},
      loaded: false
    }
  }

  loadOrder() {
    const { id } = this.props.params;
    getServiceOrder({ orderId: id }, (err, rsp) => {
      if (err) return window.alert(err);
      const { order } = rsp;
      this.setState({ order, loaded: true});
    });
  }

  handleShowService(serviceId, isSaled) {
    const { router } = this.context;
    if (isSaled) {
      router.push(`/services/${serviceId}`);
    } else {
      router.push(`/service_info/${serviceId}`);
    }
  }

  handlePayOrder(orderId) {
    if (!confirm('确定支付订单？')) {return;}
    payServiceOrder({ orderId }, (err, rsp) => {
      if (err) {
        return alert(err);
      }
      alert('订单已支付');
      this.reload();
    });
  }

  handleCancelOrder(orderId, isSaled) {
    if (!isSaled && !confirm('确定取消订单？')) {return;}
    let reason = '用户取消';
    if (isSaled) {
      reason = prompt('请输入取消的原因');
      if (!reason || reason.length < 4) {
        return alert('原因必须超过 4 个字');
      }
    }
    cancelServiceOrder({ orderId, reason }, (err, rsp) => {
      if (err) {
        return alert(err);
      }
      alert('订单已取消');
      this.reload();
    });
  }

  handleFinishOrder(orderId) {
    if (!confirm('确定完成交易？')) {return;}
    finishServiceOrder({ orderId }, (err, rsp) => {
      if (err) {
        return alert(err);
      }
      alert('完成交易');
      this.reload();
    });
  }

  handleDealingOrder(orderId) {
    if (!confirm('确定处理交易？')) {return;}
    dealingServiceOrder({ orderId }, (err, rsp) => {
      if (err) {
        return alert(err);
      }
      alert('交易处理中');
      this.reload();
    });
  }

  handleDealingOrder(orderId) {
    if (!confirm('确定完成处理？')) {return;}
    dealtServiceOrder({ orderId }, (err, rsp) => {
      if (err) {
        return alert(err);
      }
      alert('交易完成处理');
      this.reload();
    });
  }

  reload() {
    this.loadOrder();
  }

  componentDidMount() {
    this.loadOrder();
  }

  render() {
    const { order, loaded } = this.state;

    if (!loaded) {
      return <ProgressBar mode='indeterminate' />;
    }

    const { id, amount, price, status, service, serviceId, reason, isPurchased, isSaled } = order;
    const { unit, title } = service;

    let actions = [];
    if (isPurchased) {
      switch (status) {
          case 'Unpaid':
              actions.push({ label: '支付', raised: true, primary: true,
                             onClick: this.handlePayOrder.bind(this, id) });
              actions.push({ label: '取消', raised: true, primary: true,
                             onClick: this.handleCancelOrder.bind(this, id) });
              break;

          case 'Paid':
          case 'Dealing':
          case 'Dealt':
              actions.push({ label: '完成交易', raised: true, primary: true,
                             onClick: this.handleFinishOrder.bind(this, id) });
              break;
      }
    }

    if (isSaled) {
      switch (status) {
          case 'Unpaid':
              actions.push({ label: '取消', raised: true, primary: true,
                             onClick: this.handleCancelOrder.bind(this, id, isSaled) });
              break;

          case 'Paid':
              actions.push({ label: '处理交易', raised: true, primary: true,
                             onClick: this.handleDealingOrder.bind(this, id) });
              break;
          case 'Dealing':
              actions.push({ label: '处理完成', raised: true, primary: true,
                             onClick: this.handleDealtOrder.bind(this, id) });
              break;
      }
    }

    return (
      <div>
        <List selectable={false} ripple>
          <ListItem caption="订单ID">
            <span className={style['legend-right']}>{id}</span>
          </ListItem>
          <ListItem caption="服务名称"
            rightIcon='chevron_right'
            onClick={this.handleShowService.bind(this, serviceId, isSaled)}
          >
            <span className={style['legend-right']}>{title}</span>
          </ListItem>
          <ListItem caption="单价">
            <span className={style['legend-right']}>
              {service.price} 元/{getUnit(unit)}
            </span>
          </ListItem>
          <ListItem caption="数量">
            <span className={style['legend-right']}>{amount} {getUnit(unit)}</span>
          </ListItem>
          <ListItem caption="价格">
            <span className={style['legend-right']}>{price} 元</span>
          </ListItem>
          <ListItem caption="订单状态">
            <span className={style['legend-right']}>{getOrderStatus(status)}</span>
          </ListItem>
          {reason ? <ListItem caption="原因">
            <span className={style['legend-right']}>{reason}</span>
          </ListItem> : <li> </li>}
        </List>
        <Navigation type='horizontal'
          actions={actions.filter((a) => !!a)}
          className={style['order-actions']} />
      </div>
    );
  }
}

Order.title = '订单详情';
Order.contextTypes = {
  router: PropTypes.object
}
