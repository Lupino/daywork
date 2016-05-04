import React, { Component } from 'react';
import { IconButton, Input } from 'react-toolbox';
import classNames from 'classnames';
import style from './style';

export default class SearchInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: props.query || ''
    };
  }
  handleChange = (query) => {
    this.setState({ query });
  };
  handleSearch = () => {
    this.props.onSearch(this.state.query);
  };
  handleKeyPress = (event) => {
    if (event.nativeEvent.keyCode === 13) {
      this.handleSearch();
    }
  };

  render() {
    const { label, className } = this.props;
    const { query } = this.state;
    return (
      <div className={classNames(style.search, className)}>
        <Input label={label} value={query} onChange={this.handleChange}
          onKeyPress={this.handleKeyPress}
        />
        <IconButton icon='search' className={style['search-btn']}
          onClick={this.handleSearch}
        />
      </div>
    );
  }
}
