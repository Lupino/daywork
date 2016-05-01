import React, { Component, PropTypes } from 'react';
import { Button } from 'react-toolbox';

import Documents from './Documents';

import lodash from 'lodash';
import { search } from './api';
import style from './style';


export default class Default extends Component {
  state = {
    loadMoreButton: true,
    docs: [],
    q: 'status:Publish status:Finish',
    total: 0,
    from: 0,
    size: 10
  };

  handleSearch(from) {
    from = from || 0;
    const { notify } = this.props;
    const { size, q } = this.state;
    search({ from, size, q }, (err, rsp) => {
      if (err) return notify(err);
      let { docs } = this.state;
      docs = docs.concat(lodash.clone(rsp.docs));
      const { total, size, from, q } = rsp;
      const loadMoreButton = total > from + size;
      this.setState({ docs, total, size, from, q, loadMoreButton } );
    });
  }

  handleUpdateDocuments(docs) {
    this.setState({ docs });
  }

  componentDidMount() {
    this.handleSearch();
  }


  render() {
    const { docs, loadMoreButton, from, size } = this.state;

    return (
      <div>
        <Documents docs={docs} onUpdate={this.handleUpdateDocuments.bind(this)} />
        { loadMoreButton &&
          <Button
            label='加载更多...'
            raised
            primary
            className={style['load-more']}
            onClick={this.handleSearch.bind(this, from + size)}
          />
        }
      </div>
    );
  }
}

Default.title = '首页';
Default.contextTypes = {
  router: PropTypes.object
}
