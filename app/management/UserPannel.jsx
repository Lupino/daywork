import React, { Component, PropTypes, cloneElement } from 'react';

import { Menu, MenuItem, MenuDivider } from 'react-toolbox';
import style from './style';

export default class UserPannel extends Component {
  handleMenuSelect = (menuValue) => {
    const { router } = this.context;
    router.push('/management/users' + menuValue);
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

UserPannel.contextTypes = {
  router: PropTypes.object
}
