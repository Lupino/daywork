import React, { Component } from 'react';
import { AppBar, Navigation, Button, Drawer, Menu, MenuItem, MenuDivider, Card } from 'react-toolbox';
import style from './style';
import { Link } from 'react-router';

const { object } = React.PropTypes;

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuValue: '',
      drawerActive: false
    };
  }

  handleToggle = () => {
    this.setState({drawerActive: !this.state.drawerActive});
  }

  handleMenuSelect = (menuValue) => {
    const { history } = this.context;
    let { state } = this.props;
    history.pushState(state, menuValue, {});
    this.setState({ menuValue, drawerActive: false });
  }

  render() {
    const actions = [
      { label: 'Play', icon: 'play-arrow' },
      { label: 'Close' }
    ];
    const { menuValue, drawerActive } = this.state;
    return (
      <div>
        <AppBar fixed flat className={style['app-bar']}>
          <Button icon='list' floating mini ripple
            onClick={this.handleToggle}
          />
          <div className={style['app-bar-text']}> {this.props.children.type.title || '每日工作'} </div>
          <Navigation />
        </AppBar>
        <Drawer active={drawerActive} onOverlayClick={this.handleToggle}>
          <Menu outline={false} active
            className={style['drawer-menu']}
            onSelect={this.handleMenuSelect}
            value={menuValue}>
            <MenuItem value='signup' icon='account_box' caption='注册/登录' />
            <MenuItem value='message' icon='message' caption='消息' />
            <MenuItem value='settings' icon='settings' caption='设置' />
            <MenuItem value='help' icon='help' caption='帮助' />
            <MenuDivider />
            <MenuItem value='about' icon='info' caption='关于' />
          </Menu>
        </Drawer>
        <div className={style.container}>
         {this.props.children}
        </div>
      </div>
    );
  }
}

App.contextTypes = {
  history: object
}
