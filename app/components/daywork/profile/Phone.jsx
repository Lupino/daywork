import { React, View, BackButton, Button, List, Input } from 'reapp-kit';

export default class extends React.Component {
  handleSave() {
    var phone = this.refs.phone.getDOMNode().value.trim();
    this.props.profileUpdate('phone', phone);
    this.router().transitionTo('profile');
  }
  render() {
    const backButton =
      <BackButton onTap={() => this.router().transitionTo('profile')}> 个人信息 </BackButton>;

    var save = <Button chromeless onTap={this.handleSave}> 保存 </Button>;

    return (
      <View {...this.props} title={[
        backButton,
        '手机号',
        save
      ]}>
        <List wrap>
          <Input ref="phone" type="text" defaultValue={this.props.profile.phone} />
        </List>
      </View>
    );
  }
}
