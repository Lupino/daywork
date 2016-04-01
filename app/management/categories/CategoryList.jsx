import React, { Component, PropTypes } from 'react';

import { Table, ProgressBar, Navigation } from 'react-toolbox';
import { getCategories } from '../../api';
import { prettyTime } from '../../modules/utils';

const CategoryModel = {
  categoryId: { type: String, title: '#' },
  categoryName: { type: String, title: '分类' },
  createdAt: { type: String, title: '添加时间' }
};

export default class CategoryList extends Component {
  state = {
    selected: [],
    source: [],
    loaded: false
  };

  handleSelect = (selected) => {
    this.setState({selected});
  };

  handleShowEditCategory = () => {
    const { selected, source } = this.state;
    if (selected.length === 0) {
      return;
    }
    const category = source[selected[0]];
    const { router } = this.context;
    const { categoryType } = this.props;
    const prefix = categoryType === 'job' ? 'jobs' : 'services';
    router.push(`${prefix}/categories/edit/${category.categoryId}`);
  }

  loadCategoryList(page) {
    const { notify, categoryType } = this.props;

    this.setState({ loaded: false });
    getCategories(categoryType, (err, rsp) => {
      if (err) {
        return notify(err);
      }

      const { categories } = rsp;

      const source = (categories || []).map((category) => {
        category.createdAt = prettyTime(category.createdAt);
        return category;
      });
      this.setState({ source, loaded: true });
    });
  }

  componentDidMount() {
    this.loadCategoryList();
  }

  render() {
    if (!this.state.loaded) {
      return <ProgressBar mode="indeterminate" />;
    }

    const { source, selected } = this.state;
    const actions = [
      { label: '编辑', raised: true, disabled: selected.length !== 1, onClick: this.handleShowEditCategory }
    ]
    return (
      <section>
        <Navigation type='horizontal' actions={actions}>
        </Navigation>
        <Table
          model={CategoryModel}
          source={source}
          onSelect={this.handleSelect}
          selectable={true}
          selected={selected}
          />
        <Navigation type='horizontal' actions={actions} />
      </section>
    );
  }
}

CategoryList.contextTypes = {
  router: PropTypes.object
}
