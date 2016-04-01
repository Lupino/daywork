import React, { Component, PropTypes, cloneElement } from 'react';

import { Menu, MenuItem, MenuDivider } from 'react-toolbox';
import style from './style';

export default class Dashboard extends Component {
  handleMenuSelect = (menuValue) => {
    const { router } = this.context;
    router.push('jobs' + menuValue);
  };

  render() {
    const { children, ...props } = this.props;
    const child = cloneElement(children, { ...props, categoryType: 'job' });
    return (
      <section>
        <div className={style['container-left']}>
          <Menu outline={false} active
            className={style['left-menu']}
            onSelect={this.handleMenuSelect}>
            <MenuItem value='/' icon='all_inclusive' caption='所有职位' />
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

Dashboard.contextTypes = {
  router: PropTypes.object
}
