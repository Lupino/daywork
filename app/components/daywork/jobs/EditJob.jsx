import { React, View, BackButton, List, Input, Button, Title, TextArea, Container, store } from 'reapp-kit';

import { host } from '../../../config';
import request from 'superagent';
import { modal } from '../../lib/higherOrderComponent';

export default store.cursor(['oauthToken'], modal(class extends React.Component {
  state = {
    byDaily: true,
    job: {},
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
    let { jobId } = this.state.job;
    let title = this.refs.title.getDOMNode().value.trim();
    let summary = this.refs.summary.getDOMNode().value.trim();
    let status = this.state.publish ? 'Publish' : 'Draft';

    if (!title) {
      return this.props.alert('请填写标题');
    }

    let job = {
      title: title,
      summary: summary,
      status: status,
      access_token: this.props.oauthToken.get('accessToken')
    };
    request.post(host + '/api/jobs/' + jobId + '/update', job, (err, res) => {
      if (err) {
        return this.props.alert('网络错误');
      }
      let rsp = res.body;
      if (rsp.err) {
        return this.props.alert(rsp.msg || rsp.err);
      }
      this.router().transitionTo('jobDetail', { jobId });
    });
  }
  loadJob() {
    let jobId = Number(this.context.router.getCurrentParams().jobId);
    // let job = this.props.getJobFromParent(jobId);
    // if (job && job.jobId) {
    //   this.setState({ job: job });
    //   return;
    // }
    request.get(host + '/api/jobs/' + jobId, (err, res) => {
      if (err) {
        return this.props.alert('网络错误');
      }
      let rsp = res.body;
      if (rsp.err) {
        return this.props.alert(rsp.msg || rsp.err);
      }
      this.setState(rsp);
      let publish = rsp.job.status === 'Publish';
      this.setState({ publish });
    });
  }
  componentDidMount() {
    this.loadJob();
  }
  render() {
    const backButton =
      <BackButton onTap={() => window.history.back()} />;

    let body;
    if (this.state.job.jobId) {
      body = this.renderJob();
    } else {
      body = this.renderLoading();
    }

    return (
      <View {...this.props} title={[
        backButton,
        '编辑职位'
      ]}>
      {body}
      </View>
    );
  }
  renderJob() {
    let publishButton = (
        <List>
          <List.Item>
            <Input type="checkbox" label="发布?" ref="publish"
              defaultChecked={false}
              onChange={this.handlePublish} />
          </List.Item>
        </List>
    );
    return (
      <div>
        <List>
          <List.Item before="标题">
            <Input ref="title" type="text" placeholder="职位的标题" defaultValue={this.state.job.title}/>
          </List.Item>
        </List>
        <Title> 简要描述 </Title>
        <List>
          <TextArea ref="summary" style={{height: 100}} defaultValue={this.state.job.summary} />
        </List>
        {this.state.job.status === 'Draft' && publishButton}
        <br />
        <Button onTap={this.handleSave}> 保存 </Button>
      </div>
    );
  }
  renderLoading() {
    return (
      <Container style={{
        marginTop: 10,
        textAlign: 'center'
      }} wrap>
        正在努力加载中...
      </Container>
    );
  }
}));
