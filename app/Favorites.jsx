import React, { Component, PropTypes } from 'react';
import { Button } from 'react-toolbox';

import Documents from './Documents';

import lodash from 'lodash';
import { getFavorites } from './api';
import style from './style';

export default class Favorite extends Component {
  state = {
    loadMoreButton: true,
    docs: [],
    total: 0,
    from: 0,
    size: 10
  };

  handleGetFavorites(from) {
    from = from || 0;
    const { notify } = this.props;
    const { userId } = this.props.params;
    const { size } = this.state;
    getFavorites({ userId, from, size }, (err, rsp) => {
      if (err) return notify(err);
      let { docs } = this.state;
      docs = docs.concat(lodash.clone(rsp.docs));
      const { total, size, from } = rsp;
      const loadMoreButton = total > from + size;
      this.setState({ docs, total, size, from, loadMoreButton } );
    });
  }

  handleUpdateDocuments(docs) {
    this.setState({ docs });
  }

  componentDidMount() {
    this.handleGetFavorites();
  }


  render() {
    const { docs, loadMoreButton, from, size } = this.state;

    return (
      <div>
        <Documents docs={docs} onUpdate={this.handleUpdateDocuments.bind(this)} {...this.props} />
        { loadMoreButton &&
          <Button
            label='加载更多...'
            raised
            primary
            className={style['load-more']}
            onClick={this.handleGetFavorites.bind(this, from + size)}
          />
        }
      </div>
    );
  }
}

Favorite.title = '我的收藏';
Favorite.contextTypes = {
  router: PropTypes.object
}
