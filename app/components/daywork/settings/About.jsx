import { React, View, BackButton, Container, Title } from 'reapp-kit';

export default class extends React.Component {
  render() {
    const backButton =
      <BackButton onTap={() => this.router().transitionTo('settings')}> 设置 </BackButton>;

    return (
      <View {...this.props} title={[
        backButton,
        '关于'
      ]}>
      <Container wrap style={{
        textAlign: 'center',
        marginTop: 100
      }}>
        <Title>
          <span style={{
            fontSize: 20,
            fontWeight: 'bold'
          }}>每日工作</span>
        </Title>
        </Container>
      <Container wrap style={{
        textAlign: 'center'
      }}>
          <Title>v0.0.1</Title>
        </Container>
      </View>
    );
  }
}
