import React, { Component, PropTypes } from 'react';
import { ProgressBar, CardActions, IconButton } from 'react-toolbox';
import { getService, favoriteService, unfavoriteService } from '../api';
import ServiceItem from './ServiceItem';
import style from '../style';

export default class ServiceInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      service: {},
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

  componentDidMount() {
    this.loadService();
  }

  render() {
    const { service, loaded } = this.state;
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
            </CardActions>
        </ServiceItem>
      </div>
    )
  }
}

ServiceInfo.title = '服务详情';
ServiceInfo.contextTypes = {
  router: PropTypes.object
}
