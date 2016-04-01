import React, { Component } from 'react';
import { Dropdown } from 'react-toolbox';
import { getCategories } from '../../api';

export default class Categories extends Component {

  state = {
    source: []
  };

  loadCategories() {
    const { type } = this.props;
    getCategories({ type }, (err, rsp) => {
      if (err) {
        alert(err);
        return;
      }
      const { categories } = rsp;
      const source = categories.map(({ categoryId, categoryName }) => {
        return { value: categoryId, label: categoryName }
      });
      this.setState({ source });
    });
  }

  componentDidMount() {
    this.loadCategories();
  }

  render() {
    const { type, ...props } = this.props;
    const { source } = this.state;

    return (
      <Dropdown
        source={source}
        {...props}
      />
    );
  }
}
