import React, { Component, PropTypes, cloneElement } from 'react';

import { Menu, MenuItem, MenuDivider } from 'react-toolbox';
import style from './style';

export default class CityPannel extends Component {
  handleMenuSelect = (menuValue) => {
    const { router } = this.context;
    router.push('/management/cities' + menuValue);
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

CityPannel.contextTypes = {
  router: PropTypes.object
}
