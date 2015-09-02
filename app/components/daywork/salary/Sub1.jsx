import { React, View, BackButton, Button, Icon } from 'reapp-kit';
import phone from 'reapp-kit/icons/phone.svg';

export default class extends React.Component {
  render() {
    const backButton =
      <BackButton onTap={() => this.router().transitionTo('salary')}> 我的工资 </BackButton>;

    var call = <Button icon={<Icon file={phone} />}> </Button>;

    return (
      <View {...this.props} title={[
        backButton,
        '红旗山隧道',
        call
      ]}>
        <p>红旗上侧边电杆施工</p>
        <p>工资日结</p>
        <p>很多描述，描述</p>
        <p>100 RMB / 天</p>
        <p>需求 2 人</p>
      </View>
    );
  }
}
