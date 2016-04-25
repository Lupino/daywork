import React, { Component, cloneElement, PropTypes } from 'react';
import {
  AppBar,
  Navigation,
  Button,
  Drawer,
  Menu, MenuItem, MenuDivider
} from 'react-toolbox';
import style from './style';
import { getProfile } from './api';
import store from './modules/store';
import WapperApp from './modules/WapperApp';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      logIn: false,
      drawerActive: false,
      profile: {}
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
      } else {
        const uneedAuth = /about|signin|signup|problem|reset_password|help|job_info|service_info/;
        const pathname = this.props.location.pathname;
        if (!uneedAuth.exec(pathname) && pathname !== '/') {
          this.handleGoto('signin?next=' + pathname);
        }
      }
    });
  };

  componentDidMount = () => {
    this.loadProfile();
  };

  render() {
    const { drawerActive, logIn } = this.state;
    let child = cloneElement(this.props.children, {
      onLogin: this.handleLogIn,
      onProfileLoaded: this.handleProfileLoaded,
      onProfileUpdated: this.handleProfileUpdated,
      getProfile: this.handleGetProfile,
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
      menus.push(<MenuItem value='purchased' icon='shopping_cart' caption='我买到的服务' key='purchased' />);
      menus.push(<MenuItem value='saled' icon='shop' caption='我卖出的服务' key='saled' />);
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
      <section className={style.app}>
        <AppBar fixed flat className={style['app-bar']}>
          <Button icon='list' floating mini ripple
            onClick={this.handleToggle}
          />
          <div className={style['app-bar-text']}> {child.type.title || '找事做'} </div>
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
      </section>
    );
  }
}

App.contextTypes = {
  router: PropTypes.object
}

export default WapperApp(App);
