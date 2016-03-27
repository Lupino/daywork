import React, { Component, cloneElement } from 'react';
import { AppBar, Navigation } from 'react-toolbox';
import style from './style';
import linkStyle from 'react-toolbox/lib/link/style';
import navStyle from 'react-toolbox/lib/navigation/style';

import WapperApp from '../modules/WapperApp';

class App extends Component {
  render() {
    const child = cloneElement(this.props.children, {});

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
      }
    ];
    return (
      <div>
        <AppBar fixed flat className={`${style['app-bar']} ${style['not-print']}`}>
          <a href='#'> 一起来啦 </a>
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
