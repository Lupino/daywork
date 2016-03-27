import React, { Component, PropTypes } from 'react';

import { Table, ProgressBar, Navigation, Dialog, Input } from 'react-toolbox';
import { getUserList, updatePassword } from '../../api/management';
import Pagenav from '../../modules/Pagenav';
import PasswordInput from '../../modules/input/PasswordInput';
import { prettyTime, generatePassword } from '../../modules/utils';

const UserModel = {
  userId: { type: String, title: '#' },
  userName: { type: String, title: '用户名' },
  realName: { type: String, title: '姓名' },
  phoneNumber: { type: Number, title: '手机号码' },
  sex: { type: Number, title: '性别' },
  createdAt: { type: String, title: '注册时间' }
};

class PasswordForm extends Component {
  state = {
    passwd: generatePassword(8)
  };
  handleChange(name, value) {
    this.setState({[name]: value});
  }

  handleClose = () => {
    this.props.onClose();
  };

  handleUpdatePassword = () => {
    const { phoneNumber } = this.props;
    const { passwd } = this.state;
    if (confirm('确认修改密码？')) {
      updatePassword({ phoneNumber, passwd }, (err) => {
        if (err) {
          alert(err);
        } else {
          alert('密码修改成功');
        }
        this.handleClose();
      });
    } else {
      this.handleClose();
    }
  }

  componentWillReceiveProps(props) {
    if (props.phoneNumber !== this.props.phoneNumber) {
      this.setState({passwd: generatePassword(8)});
    }
  }

  render() {
    const { passwd } = this.state;
    const { active } = this.props;
    const actions = [
      { label: '确定', raised: true, onClick: this.handleUpdatePassword },
      { label: '取消', raised: true, onClick: this.handleClose }
    ];
    return (
      <Dialog title='重置密码(尽量不要使用)' active={active} actions={actions}>
        <PasswordInput
          label='密码'
          value={passwd}
          onChange={this.handleChange.bind(this, 'passwd')}
          />
      </Dialog>
    );
  }
}

export default class UserList extends Component {
  state = {
    selected: [],
    source: [],
    limit: 10,
    currentPage: 1,
    loaded: false,
    showPasswordForm: false,
    phoneNumber: ''
  };

  handleSelect = (selected) => {
    this.setState({selected});
  };

  handlePagenavClick = (page) => {
    const { router } = this.context;
    router.push(`/users/p/${page}`);
  };

  handleClose = () => {
    this.setState({showPasswordForm: false, selected: []});
  };

  handleShow(key) {
    const { selected, source } = this.state;
    if (selected.length === 0) {
      return;
    }
    const user = source[selected[0]];
    this.setState({[key]: true, phoneNumber: user.phoneNumber});
  }

  handleShowEditUser = () => {
    const { selected, source } = this.state;
    if (selected.length === 0) {
      return;
    }
    const user = source[selected[0]];
    const { router } = this.context;
    router.push(`/users/edit/${user.userId}`);
  }

  handleShowAddJob = () => {
    const { selected, source } = this.state;
    if (selected.length === 0) {
      return;
    }
    const user = source[selected[0]];
    const { router } = this.context;
    router.push(`/users/${user.userId}/addJob`);
  }

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
    const { showPasswordForm, phoneNumber } = this.state;
    const actions = [
      { label: '编辑', raised: true, disabled: selected.length !== 1, onClick: this.handleShowEditUser },
      { label: '修改密码', onClick: this.handleShow.bind(this, 'showPasswordForm'), raised: true, disabled: selected.length !== 1 },
      { label: '添加职位', raised: true, disabled: selected.length !== 1, onClick: this.handleShowAddJob },
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
        <PasswordForm active={showPasswordForm} onClose={this.handleClose} phoneNumber={phoneNumber} />
      </section>
    );
  }
}

UserList.contextTypes = {
  router: PropTypes.object
}
