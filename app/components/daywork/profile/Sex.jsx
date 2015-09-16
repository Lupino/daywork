import { React, View, BackButton, List, Input } from 'reapp-kit';
import { modal } from '../../lib/higherOrderComponent';

export default modal(class extends React.Component {
  handleChange(sex) {
    this.props.profileUpdate('sex', sex, (err) => {
      if (err) {
        return this.props.alert(err);
      }
      this.router().transitionTo('profile');
    });
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
          <Input type="radio" label="男" defaultChecked={M} onClick={this.handleChange.bind(this, '男')} />
          <Input type="radio" label="女" defaultChecked={F} onClick={this.handleChange.bind(this, '女')} />
        </List>
      </View>
    );
  }
});
