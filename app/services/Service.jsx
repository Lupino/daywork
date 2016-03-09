import React, { Component, PropTypes } from 'react';
import { ProgressBar } from 'react-toolbox';
import { getService } from '../api';
import ServiceItem from './ServiceItem';

export default class Service extends Component {
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

  componentDidMount() {
    this.loadService();
  }

  render() {
    const { service, loaded } = this.state;
    if (!loaded) {
      return <ProgressBar mode='indeterminate' />;
    }

    return (
      <div>
        <ServiceItem service={service} />
      </div>
    )
  }
}

Service.title = '服务详情';
Service.contextTypes = {
  router: PropTypes.object
}
