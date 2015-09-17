import { React, View, BackButton } from 'reapp-kit';

export default class extends React.Component {
  render() {
    const backButton =
      <BackButton onTap={() => window.history.back()} />;

    return (
      <View {...this.props} title={[
        backButton,
        '提示'
      ]}>
        <p>开发中...</p>
      </View>
    );
  }
}
