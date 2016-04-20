import React, { Component, PropTypes } from 'react';
import { List, ListItem, ProgressBar, Navigation } from 'react-toolbox';
import { getServiceOrder, payServiceOrder, cancelServiceOrder, finishServiceOrder } from '../api';
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

  handleShowService(serviceId) {
    const { router } = this.context;
    router.push(`/service_info/${serviceId}`);
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

  handleCancelOrder(orderId) {
    if (!confirm('确定取消订单？')) {return;}
    const reason = '用户取消';
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

    const { id, amount, price, status, service, serviceId, reason } = order;
    const { unit, title } = service;

    const actions = [
      status === 'Unpaid' && {
        label: '支付', raised: true, primary: true,
        onClick: this.handlePayOrder.bind(this, id)
      },
      status === 'Unpaid' && {
        label: '取消', raised: true, accent: true,
        onClick: this.handleCancelOrder.bind(this, id)
      },
      status === 'Paid' && {
        label: '完成交易', raised: true, primary: true,
        onClick: this.handleFinishOrder.bind(this, id)
      }
    ];

    return (
      <div>
        <List selectable={false} ripple>
          <ListItem caption="订单ID">
            <span className={style['legend-right']}>{id}</span>
          </ListItem>
          <ListItem caption="服务名称"
            rightIcon='chevron_right'
            onClick={this.handleShowService.bind(this, serviceId)}
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
