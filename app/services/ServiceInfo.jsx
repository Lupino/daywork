import React, { Component, PropTypes } from 'react';
import { ProgressBar, CardActions, IconButton, Dialog, Input } from 'react-toolbox';
import { getService, favoriteService, unfavoriteService, createServiceOrder } from '../api';
import ServiceItem from './ServiceItem';
import style from '../style';

class ServiceOrderForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: props.active,
      serviceId: props.serviceId,
      amount: 1,
      summary: ''
    };
  }

  handleInputChange(key, value){
    this.setState({ [key]: value });
  };

  handleCloseDialog = () => {
    this.setState({active: false});
    if ( this.props.onClose ) {
      this.props.onClose();
    }
  };

  handleCreateOrder = () => {
    const { serviceId, amount, summary } = this.state;
    const realAmount = Number(amount);
    if (realAmount < 1) {
      return alert('数量太小');
    }

    createServiceOrder({ serviceId, amount, summary }, (err, rsp) => {
      this.handleCloseDialog();
      if (err) {
        return alert(err);
      }
      console.log(rsp);
    });
  };

  componentWillReceiveProps(nextProps) {
    const { active, serviceId } = nextProps;
    if (this.props.serviceId !== serviceId) {
      this.setState({ amount: 1, summary: '' });
    }
    this.setState({ active, serviceId });
  }

  render() {
    const { amount, summary, active } = this.state;
    const actions = [
      { label: '关闭', raised: true, accent: true, onClick: this.handleCloseDialog },
      { label: '购买', raised: true, onClick: this.handleCreateOrder}
    ];
    return (
      <Dialog actions={actions} active={active} title={'购买服务'}>
        <Input
          type='number'
          label='数量'
          onChange={this.handleInputChange.bind(this, 'amount')}
          value={amount} />
        <Input
          multiline
          className={style.summary}
          type='text'
          label='备注'
          onChange={this.handleInputChange.bind(this, 'summary')}
          value={summary} />
      </Dialog>
    );
  }
}

export default class ServiceInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      service: {},
      showOrderForm: false,
      loaded: false
    }
  }

  loadService = () => {
    const { params, notify } = this.props;
    const serviceId = params.serviceId;
    getService({ serviceId }, (err, rsp) => {
      if (err) {
        return notify(err);
      }
      this.setState({ service: rsp.service, loaded: true });
    });
  };

  handleFavorite(fav) {
    const { notify } = this.props;
    const { serviceId } = this.state.service;
    let method = fav ? favoriteService : unfavoriteService;
    this.updateFavorite(fav);
    method({ serviceId }, (err) => {
      if (err) {
        this.updateFavorite(!fav);
        return notify(err);
      }
    });
  }

  updateFavorite(fav) {
    let { service } = this.state;
    service.favorited = fav;
    this.setState({ service });
  }

  handleShowPhoneNumber(phoneNumber) {
    const { alert } = this.props;
    alert({ message: phoneNumber, title: '电话号码' });
  }

  handleShowOrderForm = () => {
    this.setState({ showOrderForm: true });
  };

  handleCloseOrderForm = () => {
    this.setState({ showOrderForm: false });
  };

  componentDidMount() {
    this.loadService();
  }

  render() {
    const { service, showOrderForm, loaded } = this.state;
    if (!loaded) {
      return <ProgressBar mode='indeterminate' />;
    }

    const { serviceId, status, favorited, user, userId } = service;
    const phoneNumber = user && user.phoneNumber || '';

    return (
      <div>
        <ServiceItem service={service}>
          <CardActions>
            <IconButton icon='favorite'
              accent={favorited}
              onClick={this.handleFavorite.bind(this, !favorited)} />
            <IconButton icon='call' onClick={this.handleShowPhoneNumber.bind(this, phoneNumber)} />
            <IconButton icon='add_shopping_cart' onClick={this.handleShowOrderForm} disabled={status !== 'Publish'} />
          </CardActions>
        </ServiceItem>
        <ServiceOrderForm
          active={showOrderForm}
          onClose={this.handleCloseOrderForm}
          serviceId={serviceId}
        />
      </div>
    )
  }
}

ServiceInfo.title = '服务详情';
ServiceInfo.contextTypes = {
  router: PropTypes.object
}
