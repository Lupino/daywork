import { React, View, BackButton, List, Input } from 'reapp-kit';

export default class extends React.Component {
  handleChange(sex) {
    this.props.profileUpdate('sex', sex);
    this.router().transitionTo('profile');
  }
  render() {
    const backButton =
      <BackButton onTap={() => this.router().transitionTo('profile')}> 个人信息 </BackButton>;

    var sex = this.props.profile.sex;
    var M, F;
    if (sex === '男') {
      M = 'checked';
    } else {
      F = 'checked';
    }
    return (
      <View {...this.props} title={[
        backButton,
        '性别'
      ]}>
        <List wrap>
          <Input type="radio" label="男" checked={M} onClick={this.handleChange.bind(this, '男')} />
          <Input type="radio" label="女" checked={F} onClick={this.handleChange.bind(this, '女')} />
        </List>
      </View>
    );
  }
}
