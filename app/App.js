import React, { Component, cloneElement } from 'react';
import { AppBar, Navigation, Button, Drawer, Menu, MenuItem, MenuDivider, Snackbar } from 'react-toolbox';
import style from './style';
import { Link } from 'react-router';
import { getProfile } from './api';
import store from './modules/store';

const { object } = React.PropTypes;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      logIn: false,
      profile: {},
      drawerActive: false,
      snackbarActive: false,
      snackbarLabel: ''
    };
  }

  handleToggle = () => {
    this.setState({drawerActive: !this.state.drawerActive});
  }

  handleMenuSelect = (menuValue) => {
    const { history } = this.context;
    history.push(menuValue);
    this.setState({ drawerActive: false });
  }

  handleLogIn = (logIn) => {
    this.setState({ logIn });
  }

  handleLoadedProfile = (profile) => {
    this.setState({ profile });
  }

  handleSnackbarClick = () => {
    this.setState({ snackbarActive: false });
  };

  handleSnackbarTimeout = () => {
    this.setState({ snackbarActive: false });
  };

  handleShowSnackbar = (snackbarLabel) => {
    this.setState({ snackbarActive: true, snackbarLabel })
  }

  loadProfile = () => {
    getProfile((err, { user }) => {
      if (!err && user && user.userId) {
        store.set('profile', user);
        this.setState({ profile: user, logIn: true });
      }
    });
  }

  componentDidMount = () => {
    this.loadProfile();
  }

  render() {
    const { drawerActive, snackbarActive, snackbarLabel, logIn } = this.state;
    let child = cloneElement(this.props.children, {
      onLogin: this.handleLogIn,
      onLoadedProfile: this.handleLoadedProfile,
      notify: this.handleShowSnackbar
    });
    return (
      <div>
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
            { logIn ? <MenuItem value='profile' icon='account_box' caption='账户信息' /> :
            <MenuItem value='signin' icon='account_box' caption='注册/登录' />}
            <MenuItem value='message' icon='message' caption='消息' />
            <MenuItem value='settings' icon='settings' caption='设置' />
            <MenuItem value='help' icon='help' caption='帮助' />
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
      </div>
    );
  }
}

App.contextTypes = {
  history: object
}
