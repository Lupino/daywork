import React, { Component, PropTypes, cloneElement } from 'react';

import { Drawer, Menu, MenuItem, MenuDivider, Table } from 'react-toolbox';
import style from './style';

export default class Dashboard extends Component {
  handleMenuSelect = (menuValue) => {
    const { router } = this.context;
    router.push('cities' + menuValue);
  };

  render() {
    const { children, ...props } = this.props;
    const child = cloneElement(children, { ...props });
    return (
      <section>
        <div className={style['container-left']}>
          <Menu outline={false} active
            className={style['left-menu']}
            onSelect={this.handleMenuSelect}>
            <MenuItem value='/' icon='all_inclusive' caption='所有城市' />
            <MenuItem value='/add' icon='add' caption='添加城市' />
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
