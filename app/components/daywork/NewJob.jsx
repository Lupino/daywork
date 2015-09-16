import { React, View, BackButton, List, Input, Button, Title, TextArea,
  Icon, store } from 'reapp-kit';

import { host } from '../../config';
import request from 'superagent';
import { modal } from '../lib/higherOrderComponent';

export default store.cursor(['oauthToken'], modal(class extends React.Component {
  state = {
    byDaily: true,
    publish: false
  }
  getConstant(name) {
    return this.context.theme.constants[name];
  }
  handleDaily(byDaily) {
    this.setState({ byDaily: byDaily });
  }
  handlePublish(publish) {
    this.setState({ publish: publish });
  }
  handleSave() {
    let title = this.refs.title.getDOMNode().value.trim();
    let summary = this.refs.summary.getDOMNode().value.trim();
    let payMethod = this.state.byDaily ? 'Daily' : 'Hourly';
    let salary = this.refs.salary.getDOMNode().value.trim();
    let requiredPeople = this.refs.requiredPeople.getDOMNode().value.trim();
    let status = this.state.publish ? 'Publish' : 'Draft';

    if (!title) {
      return this.props.alert('请填写标题');
    }

    if (!salary) {
      return this.props.alert('请填写单位工资');
    }

    let job = {
      title: title,
      summary: summary,
      payMethod: payMethod,
      salary: Number(salary),
      requiredPeople: Number(requiredPeople),
      status: status,
      access_token: this.props.oauthToken.get('accessToken')
    };
    request.post(host + '/api/jobs/create', job, (err, res) => {
      if (err) {
        return this.props.alert('网络错误');
      }
      let rsp = res.body;
      if (rsp.err) {
        return this.props.alert(rsp.msg || rsp.err);
      }
    });
  }
  render() {
    const backButton =
      <BackButton onTap={() => this.router().transitionTo('daywork')}> 我 </BackButton>;

    return (
      <View {...this.props} title={[
        backButton,
        '发布新职位'
      ]}>
        <List>
          <List.Item before="标题">
            <Input ref="title" type="text" placeholder="职位的标题" />
          </List.Item>
        </List>
        <Title> 简要描述 </Title>
        <List>
          <TextArea ref="summary" style={{height: 100}}> </TextArea>
        </List>
        <Title> 工资 </Title>
        <List>
          <List.Item title="按天计算"
            onTap={this.handleDaily.bind(this, true)}
            after={
              <Icon
                file={require('reapp-kit/icons/check.svg')}
                size={24}
                color={this.getConstant(this.state.byDaily ? 'active' : 'inactive')}
                styles={{ self: { margin: 'auto' } }}
                />
            } />
          <List.Item title="按小时计算"
            onTap={this.handleDaily.bind(this, false)}
            after={
              <Icon
                file={require('reapp-kit/icons/check.svg')}
                size={24}
                color={this.getConstant(this.state.byDaily ? 'inactive' : 'active')}
                styles={{ self: { margin: 'auto' } }}
                />
            } />
        </List>
        <List>
          <List.Item before={this.state.byDaily ? '每天工资' : '每小时工资'}>
            <Input ref="salary" type="number" placeholder="请填写单位工资" />
          </List.Item>
        </List>
        <br />
        <List>
          <List.Item before="需要人数">
            <Input ref="requiredPeople" type="number" placeholder="请填写需要的人数" />
          </List.Item>
        </List>
        <List>
          <List.Item>
            <Input type="checkbox" label="直接发布?" ref="publish"
              defaultChecked={false}
              onChange={this.handlePublish} />
          </List.Item>
        </List>
        <br />
        <Button onTap={this.handleSave}> { this.state.publish ? '发布' : '保存草稿' } </Button>
      </View>
    );
  }
}));
