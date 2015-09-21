import { React, View, store, Button } from 'reapp-kit';

import { host } from '../../config';
import request from 'superagent';
import { modal } from '../lib/higherOrderComponent';
import _ from 'lodash';
import Message from './Message';

export default store.cursor(['profile', 'oauthToken'], modal(class extends React.Component {
  state = {
    messages: [],
    loadMoreButton: true,
    update: 0,
    currentPage: 0
  }
  handleLoadMore(page) {
    this.loadMessages(page);
  }
  loadMessages(page) {
    page = page || 0;
    let accessToken = this.props.oauthToken.get('accessToken');
    let userId = this.props.oauthToken.get('userId');
    request.get(host + '/api/users/' + userId + '/messages?page=' + page + '&access_token=' + accessToken,
                (err, res) => {
                  if (err) {
                    return this.props.alert('网络错误');
                  }
                  let rsp = res.body;
                  if (rsp.err) {
                    return this.props.alert(rsp.msg || rsp.err);
                  }
                  let messages = this.state.messages.concat(_.clone(rsp.messages));
                  messages = _.uniq(messages, 'msgId');
                  this.setState({ messages });
                  if (rsp.messages.length < 10) {
                    this.setState({ loadMoreButton: false });
                  }
                  this.setState({ currentPage: page });
                });
  }
  reloadMessages() {
    this.setState({ messages: [] });
    this.loadMessages();
  }
  componentDidMount() {
    this.loadMessages();
  }
  componentDidUpdate() {
    if (this.state.update !== this.props.update) {
      let update = this.props.update;
      this.setState({ update });
      this.reloadMessages();
    }
  }
  render() {
    let messages = this.state.messages.map((message) =>
                                           <Message key={'message-' + message.msgId} data={message} />);
    let button = null;
    if (this.state.loadMoreButton) {
      let page = this.state.currentPage + 1;
      button = <Button
        onTap={this.handleLoadMore.bind(this, page)}>
        加载更多... </Button>;
    }

    return (
      <View key="messages-view">
        <div>
          {messages}
        </div>
        {button}
      </View>
    );
  }
}));
