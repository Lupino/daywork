import React, { Component, PropTypes } from 'react';
import { Input, Button, List } from 'react-toolbox';

import { addCategory } from '../../api/management';

export default class AddCategory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categoryId: '',
      categoryName: ''
    }
  }
  handleInputChange = (name, value) => {
    this.setState({ [name]: value });
  };
  handleSave = () => {
    const { notify, categoryType } = this.props;
    const { categoryId, categoryName } = this.state;
    const { router } = this.context;

    if (!categoryId) {
      return alert('请填写分类 ID');
    }

    if (!categoryName) {
      return alert('请填写分类名称');
    }

    addCategory({ categoryId, categoryName, categoryType }, (err, rsp) => {
      if (err) {
        return notify(err);
      }
      alert('添加分类成功')
      router.goBack();
    });
  };

  render() {
    const { categoryName, categoryId } = this.state;
    return (
      <div style={{width: 600}}>
        <List selectable ripple>
          <li>
            <Input label="分类 ID"
              type='text'
              value={categoryId}
              onChange={this.handleInputChange.bind(this, 'categoryId')} />
          </li>
          <li>
            <Input label="分类名称"
              type='text'
              value={categoryName}
              onChange={this.handleInputChange.bind(this, 'categoryName')} />
          </li>
        </List>
        <Button label='添加'
          raised
          primary
          floating
          onClick={this.handleSave} / >
      </div>
    );
  }
}

AddCategory.contextTypes = {
  router: PropTypes.object
}
