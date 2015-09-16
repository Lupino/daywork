import { React, View, BackButton, Button, List, Input } from 'reapp-kit';
import { modal } from '../../lib/higherOrderComponent';

export default modal(class extends React.Component {
  handleSave() {
    var name = this.refs.name.getDOMNode().value.trim();
    this.props.profileUpdate('realName', name, (err) => {
      if (err) {
        return this.props.alert(err);
      }
      this.router().transitionTo('profile');
    });
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
          <Input ref="name" type="text" defaultValue={this.props.profile.realName} />
        </List>
      </View>
    );
  }
});
