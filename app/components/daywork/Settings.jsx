import { React, Page, NestedViewList, View, BackButton, List, Input, Router, Modal, Title } from 'reapp-kit';

var {Link} = Router;

class Settings extends Page {
  state = {
    logOutModal: false
  }
  toggleModal(type) {
    this.setState({logOutModal: type});
  }
  render() {
    const backButton =
      <BackButton onTap={() => this.router().transitionTo('daywork')}> 我 </BackButton>;

    var child = this.hasChildRoute() && this.createChildRouteHandler() || null;
    var viewListProps = this.routedViewListProps();
    return (
      <View {...this.props}>
        <NestedViewList {...viewListProps}>
          <View title={[
            backButton,
            '设置'
          ]}>
            {this.state.logOutModal && <Modal
              title="确定退出当前账号吗？"
              type={this.state.logOutModal}
              onClose={this.toggleModal.bind(this, false)} />}

            <Title> 提醒 </Title>
            <List>
              <List.Item>
                <Input type="checkbox" label="工作提醒" />
              </List.Item>
            </List>
            <List>
              <List.Item>
                <Input type="checkbox" label="声音" />
              </List.Item>
            </List>
            <List>
              <List.Item>
                <Input type="checkbox" label="震动" />
              </List.Item>
            </List>
            <br />
            <List>
              <List.Item
                title="关于"
                wrapper={<Link to="about" />}
                icon
                nopad
              />
            </List>
            <br />
            <List>
              <List.Item
                title="退出当前账号"
                onTap={this.toggleModal.bind(this, 'confirm')}
                icon
                nopad
              />
            </List>
          </View>
          {child}
        </NestedViewList>
      </View>
    );
  }
}

export default Settings;
