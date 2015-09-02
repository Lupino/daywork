import { React, Page, NestedViewList, View, BackButton, List, Router } from 'reapp-kit';
import avatarIcon from '../../../assets/profile5.png';
import Dropzone from 'react-dropzone';

var {Link} = Router;

export default class extends Page {
  constructor(props) {
    super(props);
    this.state = {
      name: '李孟君',
      sex: '男',
      phone: '13159228627'
    };
  }

  handleChange(key, value) {
    var state = {};
    state[key] = value;
    this.setState(state);
  }

  onDrop(files) {
    /*eslint-disable no-console */
    console.log(files);
    /*eslint-enable no-console */
  }

  render() {
    const backButton =
      <BackButton onTap={() => this.router().transitionTo('daywork')}> 我 </BackButton>;

    var child = this.hasChildRoute() && this.createChildRouteHandler({
      profileUpdate: this.handleChange,
      profile: this.state
    }) || null;

    var viewListProps = this.routedViewListProps();

    return (
      <View {...this.props}>
        <NestedViewList {...viewListProps}>
          <View title={[
            backButton,
            '个人信息'
          ]}>
            <List>
              <List.Item
                title={<div style={styles.avatarText}>头像</div>}
                titleAfter={<div style={styles.avatar}><img src={avatarIcon} style={styles.avatarIcon}/> </div>}
                wrapper={<Dropzone onDrop={this.onDrop} />}
                icon
                nopad
              />
            <List>
            <br />
            </List>
              <List.Item
                title="性名"
                titleAfter={<span>{this.state.name}</span>}
                wrapper={<Link to="name" />}
                icon
                nopad
              />
              <List.Item
                title="性别"
                titleAfter={<span>{this.state.sex}</span>}
                wrapper={<Link to="sex" />}
                icon
                nopad
              />
              <List.Item
                title="手机号"
                titleAfter={<span>{this.state.phone}</span>}
                wrapper={<Link to="phone" />}
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

var styles = {
  avatar: {
    width: 72,
    height: 72,
    border: '1px #000 solid',
    borderRadius: 8
  },
  avatarIcon: {
    width: '100%',
    height: '100%'
  },
  avatarText: {
    marginTop: 26
  }
};
