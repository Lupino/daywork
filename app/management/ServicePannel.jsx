import React, { Component, PropTypes, cloneElement } from 'react';

import { Menu, MenuItem, MenuDivider } from 'react-toolbox';
import style from './style';

export default class ServicePannel extends Component {
  handleMenuSelect = (menuValue) => {
    const { router } = this.context;
    router.push('/management/services' + menuValue);
  };

  render() {
    const { children, ...props } = this.props;
    const child = cloneElement(children, { ...props, categoryType: 'service' });
    return (
      <section>
        <div className={style['container-left']}>
          <Menu outline={false} active
            className={style['left-menu']}
            onSelect={this.handleMenuSelect}>
            <MenuItem value='/' icon='all_inclusive' caption='所有服务' />
            <MenuItem value='/categories/' icon='all_inclusive' caption='所有分类' />
            <MenuItem value='/categories/add' icon='add' caption='添加分类' />
          </Menu>
        </div>
        <div className={style['container-right']}>
          {child}
        </div>
      </section>
    );
  }
}

ServicePannel.contextTypes = {
  router: PropTypes.object
}
