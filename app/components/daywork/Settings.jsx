import { React, Page, NestedViewList, View, BackButton, List, Input, Router, Title, store } from 'reapp-kit';
import request from 'superagent';
import { host } from '../../config';
import { modal } from '../lib/higherOrderComponent';

var {Link} = Router;

class Settings extends Page {
  handleChange(key, value) {
    if (value === undefined) {
      return;
    }
    var settings = {};
    settings[key] = value;
    this.action.updateSettings(settings);
  }
  handleLogOut() {
    this.props.confirm('确定退出当前账号?', () => {
      this.action.delOauthToken();
      request.post(host + '/api/logOut',
                   () => this.router().transitionTo('signin'));
    });
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
            <Title> 提醒 </Title>
            <List>
              <List.Item>
                <Input type="checkbox" label="工作提醒" ref="notify"
                  defaultChecked={this.props.settings.get('notify')}
                  onChange={this.handleChange.bind(this, 'notify')} />
              </List.Item>
            </List>
            <List>
              <List.Item>
                <Input type="checkbox" label="声音" ref="voice"
                  defaultChecked={this.props.settings.get('voice')}
                  onChange={this.handleChange.bind(this, 'voice')} />
              </List.Item>
            </List>
            <List>
              <List.Item>
                <Input type="checkbox" label="震动" ref="shock"
                  defaultChecked={this.props.settings.get('shock')}
                  onChange={this.handleChange.bind(this, 'shock')} />
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
                onTap={this.handleLogOut}
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

export default store.cursor(['settings'], modal(Settings));
