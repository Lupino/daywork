import React, { Component, PropTypes } from 'react';
import { Input, Button, List } from 'react-toolbox';

import { updateCategory } from '../../api/management';
import { getCategory } from '../../api';

export default class EditCategory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categoryName: ''
    }
  }

  handleInputChange = (name, value) => {
    this.setState({ [name]: value });
  };

  handleSave = () => {
    const { notify, categoryType } = this.props;
    const { categoryName } = this.state;
    const { router } = this.context;
    const { categoryId } = this.props.params;

    if (!categoryName) {
      return alert('请填写分类名称');
    }

    updateCategory({ categoryId, categoryName, categoryType }, (err, rsp) => {
      if (err) {
        return notify(err);
      }
      alert('更新分类成功')
      router.goBack();
    });
  };

  loadCategory() {
    const { categoryId } = this.props.params;
    const { categoryType } = this.props;
    getCategory({ categoryId, categoryType }, (err, rsp) => {
      if (err) {
        return alert(err);
      }
      const { categoryName } = rsp.category || {};
      this.setState({ categoryName });
    })
  }

  componentDidMount() {
    this.loadCategory();
  }

  render() {
    const { categoryName } = this.state;
    const { categoryId } = this.props.params;
    return (
      <div style={{width: 600}}>
        <List selectable ripple>
          <li>
            <Input label="分类 ID"
              type='text'
              value={categoryId}
              />
          </li>
          <li>
            <Input label="分类名称"
              type='text'
              value={categoryName}
              onChange={this.handleInputChange.bind(this, 'categoryName')} />
          </li>
        </List>
        <Button label='保存'
          raised
          primary
          floating
          onClick={this.handleSave} / >
      </div>
    );
  }
}

EditCategory.contextTypes = {
  router: PropTypes.object
}
