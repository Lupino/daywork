import { React, View, Container, List, Input, Button, Router, Modal } from 'reapp-kit';
import request from 'superagent';
import { host } from '../../config';

let { Link } = Router;

export default class extends React.Component {
  state = {
    modal: false,
    msg: ''
  }
  toggleModal(type, msg) {
    this.setState({ modal: type, msg: msg });
  }
  alert(msg) {
    this.toggleModal('alert', msg);
  }
  handleSignin() {
    let phoneNumber = this.refs.phoneNumber.getDOMNode().value.trim();
    let passwd = this.refs.passwd.getDOMNode().value.trim();
    if (!phoneNumber.match(/\d{11}/)) {
      return this.alert('请填写正确的手机号码');
    }
    if (!passwd) {
      return this.alert('请填写密码');
    }
    request.post(host + '/auth', {
      userName: phoneNumber,
      passwd: passwd
    }, (err, res) => {
      if (err) {
        return this.alert('登录失败');
      }
      let rsp = res.body;
      if (rsp.err) {
        return this.alert(rsp.msg || rsp.err);
      }
      this.router().transitionTo('daywork');
    });
  }
  render() {
    return (
      <View {...this.props} title="登录">
        {this.state.modal && <Modal
          title="提示"
          type={this.state.modal}
          onClose={this.toggleModal.bind(this, false)}>{this.state.msg} </Modal>}
        <List>
          <List.Item before="账号">
            <Input ref="phoneNumber" type="text" placeholder="电话号码" />
          </List.Item>
        </List>
        <br />
        <List>
          <List.Item before="密码">
            <Input ref="passwd" type="password" placeholder="请填写密码" />
          </List.Item>
        </List>
        <br />
        <Button onTap={this.handleSignin}> 登录 </Button>
        <Container style={{
          marginTop: 10,
          textAlign: 'center'
        }} wrap>
          <Link to="problem"> 登录遇到问题？ </Link>
        </Container>
      </View>
    );
  }
}
