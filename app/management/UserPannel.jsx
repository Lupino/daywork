import React, { Component, PropTypes } from 'react';

import { Drawer, Menu, MenuItem, MenuDivider, Table } from 'react-toolbox';
import style from './style';

export default class Dashboard extends Component {
  handleMenuSelect = (menuValue) => {
    const { router } = this.context;
    router.push('users' + menuValue);
  };

  render() {
    const child = this.props.children;
    return (
      <section>
        <div className={style['container-left']}>
          <Menu outline={false} active
            className={style['left-menu']}
            onSelect={this.handleMenuSelect}>
            <MenuItem value='/' icon='all_inclusive' caption='所有用户' />
            <MenuItem value='/add' icon='add' caption='添加用户' />
          </Menu>
        </div>
        <div className={style['container-right']}>
          {child}
        </div>
      </section>
    );
  }
}

Dashboard.contextTypes = {
  router: PropTypes.object
}
