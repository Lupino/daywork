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
        || (pathname === '/dashboard' && location.pathname === '/')) {
        return linkStyle.active;
      }
      return '';
    }
    const links = [
      {
        href: '#/',
        label: '控制面板',
        className: `${navStyle.link} ${style['color-white']} ${isCurrent('/dashboard')}`
      },
      {
        href: '#/users',
        label: '用户管理',
        className: `${navStyle.link} ${style['color-white']} ${isCurrent('/users')}`
      },
      {
        href: '#/jobs',
        label: '职位管理',
        className: `${navStyle.link} ${style['color-white']} ${isCurrent('/jobs')}`
      },
      {
        href: '#/services',
        label: '服务管理',
        className: `${navStyle.link} ${style['color-white']} ${isCurrent('/services')}`
      },
      {
        href: '#/cities',
        label: '城市管理',
        className: `${navStyle.link} ${style['color-white']} ${isCurrent('/cities')}`
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
