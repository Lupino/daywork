import { React, View, BackButton, Button, List, Input } from 'reapp-kit';

export default class extends React.Component {
  handleSave() {
    var name = this.refs.name.getDOMNode().value.trim();
    this.props.profileUpdate('name', name);
    this.router().transitionTo('profile');
  }
  render() {
    const backButton =
      <BackButton onTap={() => this.router().transitionTo('profile')}> 个人信息 </BackButton>;

    var save = <Button chromeless onTap={this.handleSave}> 保存 </Button>;

    return (
      <View {...this.props} title={[
        backButton,
        '姓名',
        save
      ]}>
        <List wrap>
          <Input ref="name" type="text" defaultValue={this.props.profile.name} />
        </List>
      </View>
    );
  }
}
