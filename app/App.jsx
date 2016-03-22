import React, { Component, cloneElement, PropTypes } from 'react';
import {
  App as ToolboxApp,
  AppBar,
  Navigation,
  Button,
  Drawer,
  Menu, MenuItem, MenuDivider,
  Snackbar, Dialog
} from 'react-toolbox';
import style from './style';
import { getProfile, getCategories } from './api';
import store from './modules/store';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      logIn: false,
      profile: {},
      categories: {},
      drawerActive: false,
      snackbarActive: false,
      snackbarLabel: '',
      snackbarCallback: null,
      diaTitle: '',
      diaActive: false,
      diaActions: [],
      diaChildren: null
    };
  }

  handleToggle = () => {
    this.setState({drawerActive: !this.state.drawerActive});
  };

  handleMenuSelect = (menuValue) => {
    const { router } = this.context;
    router.push(menuValue);
    this.setState({ drawerActive: false });
  };

  handleLogIn = (logIn) => {
    this.setState({ logIn });
  };

  handleProfileLoaded = (profile) => {
    this.setState({ profile });
  };

  handleProfileUpdated = (name, value) => {
    const { profile } = this.state;
    this.setState({ profile: {...profile, [name]: value} })
  };

  handleGetProfile = () => {
    return this.state.profile;
  };

  handleGetCategories = (key) => {
    if (key) {
      return this.state.categories[key];
    }
    return this.state.categories;
  };

  handleSnackbarClick = () => {
    const { snackbarCallback } = this.state;
    if ( snackbarCallback ) {
      snackbarCallback();
    }
    this.setState({ snackbarActive: false, snackbarCallback: null });
  };

  handleSnackbarTimeout = () => {
    const { snackbarCallback } = this.state;
    if ( snackbarCallback ) {
      snackbarCallback();
    }
    this.setState({ snackbarActive: false, snackbarCallback: null });
  };

  handleShowSnackbar = (snackbarLabel, snackbarCallback) => {
    this.setState({ snackbarActive: true, snackbarLabel, snackbarCallback })
  };

  handleDiaClose = () => {
    this.setState( { diaActive: false } );
  };

  handleDiaAlert = ({ message, title }, callback) => {
    const diaActive = true;
    const diaActions = [
      {
        label: '确定',
        raised: true,
        onClick: () => {
          callback && callback();
          this.handleDiaClose();
        }
      }
    ];
    const diaChildren = <p> {message} </p>;
    this.setState( { diaTitle: title, diaActions, diaChildren, diaActive } );
  };

  handleDiaConfirm = ({ message, title, onConfirm, onCancel }, callback) => {
    const diaActive = true;
    const diaActions = [
      {
        label: '确定',
        raised: true,
        onClick: () => {
          onConfirm && onConfirm();
          callback && callback(true);
          this.handleDiaClose();
        }
      },
      {
        label: '取消',
        raised: true,
        onClick: () => {
          onCancel && onCancel();
          callback && callback(false);
          this.handleDiaClose();
        }
      }
    ];
    const diaChildren = <p> {message} </p>;
    this.setState( { diaTitle: title, diaActions, diaChildren, diaActive } );
  };

  handleDialog = ({ title, children, actions }) => {
    const diaActive = true;
    const diaActions = actions.map(( action ) => {
      const _onClick = action.onClick;
      action.onClick = () => {
        const ret = _onClick ? _onClick.apply(null, arguments) : null;
        if (ret !== false) {
          this.handleDiaClose();
        }
      }
      return action;
    });
    const diaChildren = children;
    this.setState( { diaTitle: title, diaActions, diaChildren, diaActive } );
  };

  handleGoto = (route) => {
    const { router } = this.context;
    router.push(route);
  }

  loadProfile = () => {
    getProfile((err, rsp) => {
      if (!err && rsp && rsp.user && rsp.user.userId) {
        const user = rsp.user;
        store.set('profile', user);
        this.setState({ profile: user, logIn: true });
      }
    });
  };

  loadCategories() {
    getCategories((err, rsp) => {
      if (!err && rsp) {
        store.set('categories', rsp);
        this.setState({ categories: rsp });
      }
    });
  }

  componentDidMount = () => {
    this.loadProfile();
    this.loadCategories();
  };

  render() {
    const { drawerActive, snackbarActive, snackbarLabel, logIn } = this.state;
    const { diaTitle, diaActive, diaActions, diaChildren } = this.state;
    let child = cloneElement(this.props.children, {
      onLogin: this.handleLogIn,
      onProfileLoaded: this.handleProfileLoaded,
      onProfileUpdated: this.handleProfileUpdated,
      getProfile: this.handleGetProfile,
      getCategories: this.handleGetCategories,
      notify: this.handleShowSnackbar,
      alert: this.handleDiaAlert,
      confirm: this.handleDiaConfirm,
      dialog: this.handleDialog,
      goto: this.handleGoto,
      isLogIn: logIn
    });

    const { profile } = this.state;

    let menus = [];
    if (logIn) {
      menus.push(<MenuItem value='profile' icon='account_box' caption='账户信息' key='profile' />);
      menus.push(<MenuDivider key='div1' />)
      menus.push(<MenuItem value='new_service' icon='add' caption='发布新服务' key='new_service' />);
      menus.push(<MenuItem value='services' icon='check_box_outline_blank' caption='我发布的服务' key='services' />);
      menus.push(<MenuDivider key='div2' />)
      menus.push(<MenuItem value='new_job' icon='add' caption='发布新职位' key='new_job' />);
      menus.push(<MenuItem value='jobs' icon='check_box_outline_blank' caption='我发布的职位' key='jobs' />);
      menus.push(<MenuItem value='works' icon='work' caption='我的工作' key='works' />);
      menus.push(<MenuDivider key='div3' />)
      menus.push(<MenuItem value='balance' icon='attach_money' caption='余额' key='balance' shortcut={`${profile.remainMoney} 元`} />);
      menus.push(<MenuItem value='message' icon='message' caption='消息' key='message' />);
    } else {
      menus.push(<MenuItem value='signin' icon='account_box' caption='注册/登录' key='signin' />);
    }
    return (
      <ToolboxApp>
        <AppBar fixed flat className={style['app-bar']}>
          <Button icon='list' floating mini ripple
            onClick={this.handleToggle}
          />
          <div className={style['app-bar-text']}> {child.type.title || '每日工作'} </div>
          <Navigation />
        </AppBar>
        <Drawer active={drawerActive} onOverlayClick={this.handleToggle}>
          <Menu outline={false} active
            className={style['drawer-menu']}
            onSelect={this.handleMenuSelect}>
            <MenuItem value='/' icon='home' caption='首页' />
            { menus }
            <MenuDivider />
            <MenuItem value='about' icon='info' caption='关于' />
          </Menu>
        </Drawer>
        <div className={style.container}>
         {child}
        </div>
        <Snackbar
          action='关闭'
          active={snackbarActive}
          icon='info'
          label={snackbarLabel}
          timeout={2000}
          onClick={this.handleSnackbarClick}
          onTimeout={this.handleSnackbarTimeout}
          type='cancel'
        />
        <Dialog actions={diaActions} active={diaActive} title={diaTitle || '提示'} onOverlayClick={this.handleDiaClose}>
          {diaChildren}
        </Dialog>
      </ToolboxApp>
    );
  }
}

App.contextTypes = {
  router: PropTypes.object
}
