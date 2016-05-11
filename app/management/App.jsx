import React, { Component, cloneElement } from 'react';
import { AppBar, Navigation } from 'react-toolbox';
import style from './style';
import linkStyle from 'react-toolbox/lib/link/style';
import navStyle from 'react-toolbox/lib/navigation/style';

import WapperApp from '../modules/WapperApp';
import store from '../modules/store';

class App extends Component {
  render() {
    const { children, ...props } = this.props;
    const child = cloneElement(children, { ...props });

    const { location } = this.props;
    const isCurrent = (pathname) => {
      if (location.pathname.indexOf(pathname) > -1
          || (pathname === '/management/dashboard' && location.pathname === '/management')) {
        return linkStyle.active;
      }
      return '';
    }
    const links = [
      {
        href: '/management/',
        label: '控制面板',
        className: `${navStyle.link} ${style['color-white']} ${isCurrent('/management/dashboard')}`
      },
      {
        href: '/management/users',
        label: '用户管理',
        className: `${navStyle.link} ${style['color-white']} ${isCurrent('/management/users')}`
      },
      {
        href: '/management/jobs',
        label: '职位管理',
        className: `${navStyle.link} ${style['color-white']} ${isCurrent('/management/jobs')}`
      },
      {
        href: '/management/services',
        label: '服务管理',
        className: `${navStyle.link} ${style['color-white']} ${isCurrent('/management/services')}`
      },
      {
        href: '/management/cities',
        label: '城市管理',
        className: `${navStyle.link} ${style['color-white']} ${isCurrent('/management/cities')}`
      }
    ];
    return (
      <div>
        <AppBar fixed flat className={`${style['app-bar']} ${style['not-print']}`}>
          <a href='#'> 找事做 管理中心</a>
          <Navigation className={style.menu} type='horizontal' routes={links} />
        </AppBar>
        <div className={style.container}>
          {child}
        </div>
      </div>
    );
  }
}

export default WapperApp(App);
