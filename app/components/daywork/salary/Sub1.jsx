import { React, View, BackButton } from 'reapp-kit';

export default class extends React.Component {
  render() {
    const backButton =
      <BackButton onTap={() => this.router().transitionTo('salary')}> 我的工资 </BackButton>;

    return (
      <View {...this.props} title={[
        backButton,
        '提示'
      ]}>
        <p>正在开发中...</p>
      </View>
    );
  }
}
