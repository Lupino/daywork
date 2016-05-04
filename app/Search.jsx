import React, { Component, PropTypes } from 'react';
import { Button } from 'react-toolbox';

import Documents from './Documents';
import SearchInput from './modules/input/SearchInput';

import lodash from 'lodash';
import { search } from './api';
import style from './style';


export default class Search extends Component {
  state = {
    loadMoreButton: true,
    docs: [],
    query: '',
    total: 0,
    from: 0,
    size: 10
  };

  handleSearch(from, query) {
    from = from || 0;
    query = query || '';
    const { notify } = this.props;
    const { size } = this.state;
    let q = { query: 'status:Publish status:Finish' };
    if (query) {
      q = { conjuncts: [
        q,
        { query }
      ] };
    }

    search({ from, size, q }, (err, rsp) => {
      if (err) return notify(err);
      let { docs } = this.state;
      docs = docs.concat(lodash.clone(rsp.docs));
      const { total, size, from } = rsp;
      const loadMoreButton = total > from + size;
      this.setState({ docs, total, size, from, query, loadMoreButton } );
    });
  }

  handleUpdateDocuments(docs) {
    this.setState({ docs });
  }

  handleNewSearch(query) {
    const { router } = this.context;
    router.push(`/search/${query}`);
    this.setState({ docs: [] });
    this.handleSearch(0, query);
  }

  componentDidMount() {
    const { query } = this.props.params;
    this.handleSearch(0, query);
  }

  render() {
    const { docs, loadMoreButton, from, size, query } = this.state;

    return (
      <div>
        <SearchInput onSearch={this.handleNewSearch.bind(this)} query={query} />
        <Documents docs={docs} onUpdate={this.handleUpdateDocuments.bind(this)} />
        { loadMoreButton &&
          <Button
            label='加载更多...'
            raised
            primary
            className={style['load-more']}
            onClick={this.handleSearch.bind(this, from + size, query)}
          />
        }
      </div>
    );
  }
}

Search.title = '搜索结果';
Search.contextTypes = {
  router: PropTypes.object
}
