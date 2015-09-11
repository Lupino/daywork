import { React, View, List, Input } from 'reapp-kit';

export default class extends React.Component {
  handleResetPassword() {
    this.router().transitionTo('resetPassword');
  }
  handleSignup() {
    this.router().transitionTo('signup');
  }
  render() {
    return (
      <View {...this.props} title="登录遇到问题">
        <List wrap>
          <Input type="radio" label="忘记密码" onClick={this.handleResetPassword} />
          <Input type="radio" label="注册新账户" onClick={this.handleSignup} />
        </List>
      </View>
    );
  }
}
