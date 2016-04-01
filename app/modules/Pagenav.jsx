import React, { Component, PropTypes } from 'react';
import { Navigation } from 'react-toolbox';
import linkStyle from 'react-toolbox/lib/link/style';
import navStyle from 'react-toolbox/lib/navigation/style';
import classNames from 'classnames';

export default class Pagenav extends Component {
  constructor(props) {
    super(props);
  }
  handleClick = (page) => {
    if ( this.props.onClick ) {
      this.props.onClick(page);
    }
  };
  render() {
    const { currentPage, total, limit } = this.props;
    const totalPage = Math.ceil(total / limit);

    let links = [];
    links.push({ icon: 'home', label: '首页', index: 1 });
    if (currentPage > 1) {
      links.push({ label: '上一页',
                 index: currentPage - 1 });
    }

    let start = currentPage - 3;
    if (start < 1) start = 1;

    for (let i = start; i < currentPage; i ++) {
      links.push({ label: i + '', index: i });
    }

    links.push({ label: currentPage + '', index: currentPage });

    let end = currentPage + 3;
    if (end > totalPage) end = totalPage;

    for (let i = currentPage + 1; i <= end; i ++) {
      links.push({ label: i + '', index: i });
    }

    let next = currentPage + 1;
    if (next < totalPage) {
      links.push({ label: '下一页', index: next});
    }

    links.push({ label: '末页', index: totalPage});

    links = links.map((link) => {
      const { index } = link;
      if (index !== currentPage) {
        link.onClick = this.handleClick.bind(this, index);
        link.className = classNames(navStyle.link, linkStyle.active, navStyle.active);
      }
      return link;
    });

    return (
        <Navigation type='horizontal' routes={links} />
    );
  }
}

Pagenav.propTypes = {
  currentPage: PropTypes.number,
  limit: PropTypes.number,
  total: PropTypes.number,
  onClick: PropTypes.func
};
