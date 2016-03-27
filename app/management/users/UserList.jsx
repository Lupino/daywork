import React, { Component, PropTypes } from 'react';

import { Table, ProgressBar, Navigation } from 'react-toolbox';
import { getUserList } from '../../api/management';
import Pagenav from '../../modules/Pagenav';
import { prettyTime } from '../../modules/utils';

const UserModel = {
  userId: { type: String, title: '#' },
  userName: { type: String, title: '用户名' },
  realName: { type: String, title: '姓名' },
  phoneNumber: { type: Number, title: '手机号码' },
  sex: { type: Number, title: '性别' },
  createdAt: { type: String, title: '注册时间' }
};

export default class UserList extends Component {
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
    router.push(`/dashboard/p/${page}`);
  };

  loadUserList(page) {
    page = page || 1;
    const { notify } = this.props;
    const { limit } = this.state;

    this.setState({ loaded: false });
    getUserList({ page, limit }, (err, rsp) => {
      if (err) {
        return notify(err);
      }

      const { users, total } = rsp;

      const source = (users || []).map((user) => {
        user.createdAt = prettyTime(user.createdAt);
        user.sex = user.sex === 'M' ? '男' : user.sex === 'F' ? '女': '保密';
        return user;
      });
      this.setState({ source, loaded: true, currentPage: Number(page), total: Number(total) });
    });
  }

  componentDidMount() {
    const { page } = this.props.params;
    this.loadUserList(page);
  }

  componentWillReceiveProps(props) {
    const page = props.params.page;
    if (page !== this.props.params.page) {
      this.loadUserList(page);
    }
  }

  render() {
    if (!this.state.loaded) {
      return <ProgressBar mode="indeterminate" />;
    }

    const { source, selected } = this.state;
    const { currentPage, total, limit } = this.state;
    const actions = [
      { label: '查看详情', raised: true, disabled: selected.length !== 1 }
    ]
    return (
      <section>
        <Navigation type='horizontal' actions={actions}>
        </Navigation>
        <Table
          model={UserModel}
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

UserList.contextTypes = {
  router: PropTypes.object
}
