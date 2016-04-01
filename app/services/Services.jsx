import React, { Component, PropTypes } from 'react';
import { CardActions, Button } from 'react-toolbox';
import { getUserServices, deleteService, publishService } from '../api';
import ServiceItem from './ServiceItem';
import style from '../style';
import lodash from 'lodash';

export default class Services extends Component {
  constructor(props) {
    super(props);
    this.state = {
      services: [],
      currentPage: 0,
      limit: 10,
      status: '',
      loadMoreButton: false,
      loaded: false
    }
  }

  handleLoadServices = (page) => {
    page = page || 0;
    const { limit, status } = this.state;
    this.setState({ loaded: false });
    getUserServices({page, limit, status}, (err, rsp) => {
      if (err) return window.alert(err);
      let { services } = this.state;
      services = services.concat(lodash.clone(rsp.services));
      services = lodash.uniq(services, 'serviceId');
      const loadMoreButton = rsp.services.length > limit;
      this.setState({services, loadMoreButton, currentPage: Number(page), loaded: true});
    });
  };

  handleDeleteService = (serviceId) => {
    const { confirm, notify } = this.props;
    confirm({ title: '确定删除？', message: '删除后将无法恢复' }, (del) => {
      if (!del) return;
      deleteService({ serviceId }, (err, rsp) => {
        if (err) {
          return notify(err);
        }
        const services = this.state.services.filter((service) => {
          return serviceId !== service.serviceId;
        });
        this.setState({ services });
        notify('服务已删除');
      });
    });
  };

  handlePublish = (serviceId) => {
    const { notify } = this.props;
    publishService({ serviceId }, (err, service) => {
        if (err) {
          return notify(err);
        }
        const services = this.state.services.map((service) => {
          if ( serviceId === service.serviceId ) {
            service.status = 'Publish';
          }
          return service;
        });
        this.setState({ services });
        notify('服务已发布');
    });
  };

  handleEditService = (serviceId) => {
    const { router } = this.context;
    router.push(`/edit_service/${serviceId}`);
  };

  handleShowService = (serviceId) => {
    const { router } = this.context;
    router.push(`/services/${serviceId}`);
  };

  handleNewService = () => {
    const { router } = this.context;
    router.push(`/new_service`);
  };

  componentDidMount() {
    this.handleLoadServices();
  }

  renderService(service) {
    const { serviceId, status } = service;
    return (
      <ServiceItem service={service} key={`service-${serviceId}`}>
        <CardActions>
          <Button label="查看详情" raised onClick={this.handleShowService.bind(this, serviceId)} />
          { status === 'Draft' ? <Button label="发布" raised onClick={this.handlePublish.bind(this, serviceId)} /> : null }
          <Button label="编辑" raised onClick={this.handleEditService.bind(this, serviceId)} />
          { status === 'Draft' ? <Button label="删除" accent raised onClick={this.handleDeleteService.bind(this, serviceId)} /> : null }
        </CardActions>
      </ServiceItem>
    );
  }

  renderNOService() {
    return (
      <div>
        <Button
          label='还没有服务, 快点击我发布服务'
          className={style['load-more']}
          onClick={this.handleNewService}
        />
      </div>
    );
  }

  render() {
    const services = this.state.services.map((service) => this.renderService(service));
    const { loadMoreButton, currentPage } = this.state;

    if (services.length === 0) {
      return this.renderNOService();
    }

    return (
      <div>
        {services}
        { loadMoreButton &&
          <Button
            label='加载更多...'
            raised
            primary
            className={style['load-more']}
            onClick={this.handleLoadServices.bind(this, currentPage + 1)}
          />
        }
      </div>
    );
  }
}

Services.title = '我发布的服务';
Services.contextTypes = {
  router: PropTypes.object
}
