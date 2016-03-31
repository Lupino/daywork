import React, { Component, PropTypes } from 'react';

import { Table, ProgressBar, Navigation, Dialog, Input } from 'react-toolbox';
import { getServices } from '../../api';
import Pagenav from '../../modules/Pagenav';
import PasswordInput from '../../modules/input/PasswordInput';
import { prettyTime, getCityName, getUnit } from '../../modules/utils';

const ServiceModel = {
  serviceId: { type: String, title: '#' },
  userName: { type: String, title: '用户名' },
  realName: { type: String, title: '姓名' },
  title: { type: String, title: '标题' },
  price: { type: String, title: '价格' },
  city: { type: String, title: '城市' },
  status: { type: String, title: '状态' },
  createdAt: { type: String, title: '创建时间' }
};

export default class ServiceList extends Component {
  state = {
    selected: [],
    source: [],
    limit: 10,
    currentPage: 1,
    loaded: false
  };

  handleSelect = (selected) => {
    this.setState({selected});
  };

  handlePagenavClick = (page) => {
    const { router } = this.context;
    router.push(`/services/p/${page}`);
  };

  handleShowEditService = () => {
    const { selected, source } = this.state;
    if (selected.length === 0) {
      return;
    }
    const service = source[selected[0]];
    const { router } = this.context;
    router.push(`/services/edit/${service.serviceId}`);
  }

  loadServiceList(page) {
    page = page || 1;
    const { notify } = this.props;
    const { limit } = this.state;

    this.setState({ loaded: false });
    getServices({ page: page - 1, limit }, (err, rsp) => {
      if (err) {
        return notify(err);
      }

      const { services, total } = rsp;

      const source = (services || []).map((service) => {
        service.createdAt = prettyTime(service.createdAt);
        ['userName', 'realName'].forEach((key) => {
          service[key] = service.user[key];
        });
        service.city = getCityName(service.city)
        service.price = service.price + ' RMB/' + getUnit(service.unit)
        return service;
      });
      this.setState({ source, loaded: true, currentPage: Number(page), total: Number(total) });
    });
  }

  componentDidMount() {
    const { page } = this.props.params;
    this.loadServiceList(page);
  }

  componentWillReceiveProps(props) {
    const page = props.params.page;
    if (page !== this.props.params.page) {
      this.loadServiceList(page);
    }
  }

  render() {
    if (!this.state.loaded) {
      return <ProgressBar mode="indeterminate" />;
    }

    const { source, selected } = this.state;
    const { currentPage, total, limit } = this.state;
    const actions = [
      { label: '编辑', raised: true, disabled: selected.length !== 1, onClick: this.handleShowEditService },
    ]
    return (
      <section>
        <Navigation type='horizontal' actions={actions}>
        </Navigation>
        <Table
          model={ServiceModel}
          source={source}
          onSelect={this.handleSelect}
          selectable={true}
          selected={selected}
          />
        <Navigation type='horizontal' actions={actions} />
        <Pagenav
          currentPage={currentPage}
          total={total}
          limit={limit}
          onClick={this.handlePagenavClick}
        />
      </section>
    );
  }
}

ServiceList.contextTypes = {
  router: PropTypes.object
}
