import React, { Component } from 'react';
import { List, ListItem } from 'react-toolbox';

export default class Problem extends Component {
  render() {
    return (
      <section>
        <List selectable ripple>
          <ListItem
            caption='忘记密码'
            rightIcon='done'
            to='#/reset_password'
          />
          <ListItem
            caption='注册新用户'
            rightIcon='done'
            to='#/signup'
          />
        </List>
      </section>
    );
  }
}

Problem.title = '登录遇到问题';
