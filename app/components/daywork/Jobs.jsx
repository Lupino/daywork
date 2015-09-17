import { React, NestedViewList, View, BackButton, Card, Swiper, Button, Page, store } from 'reapp-kit';

import { host } from '../../config';
import request from 'superagent';
import { modal } from '../lib/higherOrderComponent';
import JobTitle from './JobTitle';
import _ from 'lodash';

export default store.cursor(['profile', 'oauthToken'], modal(class extends Page {
  state = {
    status: '',
    noswiping: false,
    loadMoreButton: true,
    currentPage: 0,
    jobs: []
  }
  handleLoadMore(page) {
    this.loadJobs(page);
  }
  loadJobs(page) {
    page = page || 0;
    let profile = this.props.profile;
    let userId = profile.get('userId');
    let status = this.state.status;

    request.get(host + '/api/users/' + userId + '/jobs?page=' + page + '&status=' + status,
                (err, res) => {
                  if (err) {
                    return this.props.alert('网络错误');
                  }
                  let rsp = res.body;
                  if (rsp.err) {
                    return this.props.alert(rsp.msg || rsp.err);
                  }
                  let jobs = this.state.jobs.concat(_.clone(rsp.jobs));
                  jobs = _.uniq(jobs, 'jobId');
                  this.setState({ jobs });
                  if (rsp.jobs.length < 10) {
                    this.setState({ loadMoreButton: false });
                  }
                  this.setState({ currentPage: page });
                });
  }
  handleGetJob(jobId) {
    return _.filter(this.state.jobs, (job) => job.jobId === jobId)[0];
  }
  handleDeleteJob(jobId) {
    let token = {
      access_token: this.props.oauthToken.get('accessToken')
    };
    this.setState({ noswiping: true });
    request.post(host + '/api/jobs/' + jobId + '/delete', token, (err, res) => {
      if (err) {
        return this.props.alert('网络错误');
      }
      let rsp = res.body;
      if (rsp.err) {
        return this.props.alert(rsp.msg || rsp.err);
      }
      let jobs = this.state.jobs.filter((job => job.jobId !== jobId));
      this.setState({ jobs: jobs });
      this.setState({ noswiping: false });
    });
  }
  handlePublishJob(jobId) {
    let token = {
      access_token: this.props.oauthToken.get('accessToken')
    };
    request.post(host + '/api/jobs/' + jobId + '/publish', token, (err, res) => {
      if (err) {
        return this.props.alert('网络错误');
      }
      let rsp = res.body;
      if (rsp.err) {
        return this.props.alert(rsp.msg || rsp.err);
      }
      rsp.job.status = 'Publish';
      let jobs = this.state.jobs.map(job => job.jobId === jobId ? rsp.job : job);
      this.setState({ jobs: jobs });
    });
  }
  componentDidMount() {
    this.loadJobs();
  }
  render() {
    const backButton =
      <BackButton onTap={() => this.router().transitionTo('daywork')}> 我 </BackButton>;

    var child = this.hasChildRoute() && this.createChildRouteHandler({ getJobFromParent: this.handleGetJob }) || null;

    var viewListProps = this.routedViewListProps();

    let cards = this.state.jobs.map(job => {
      let salary = job.salary + ' RMB / ';
      if (job.payMethod === 'Daily') {
        salary += '天';
      } else {
        salary += '时';
      }

      let bColor = job.status === 'Draft' ? '#ddd' : '#fff';
      if (job.status === 'Draft') {
        bColor = '#ddd';
      }

      let card = (
        <Card key={job.jobId}
          onClick={() => this.router().transitionTo('jobDetail', { jobId: job.jobId })}
          styles={ { self: { background: bColor } } }
          title={<JobTitle salary={salary} name={job.title} />}>
          {job.summary}
        </Card>
      );

      if (job.status === 'Draft') {
        return (
          <Swiper key={job.jobId} right below={
            <div style={styles.buttons}>
              <Button chromeless color="green" styles={styles.button}
                onTap={this.handlePublishJob.bind(this, job.jobId)}
                >
                发布
              </Button>
              <Button chromeless color="red" styles={styles.button}
                onTap={this.handleDeleteJob.bind(this, job.jobId)}
                >
                删除
              </Button>
            </div>
            }>
            {card}
          </Swiper>
        );
      } else {
        return card;
      }

    });

    let button = null;
    if (this.state.loadMoreButton) {
      let page = this.state.currentPage + 1;
      button = <Button
        onTap={this.handleLoadMore.bind(this, page)}>
        加载更多... </Button>;
    }

    return (
      <View {...this.props}>
        <NestedViewList {...viewListProps}>
          <View title={[
            backButton,
            '我发布的职位'
          ]}>
            {cards}
            {button}
          </View>
          {child}
        </NestedViewList>
      </View>
    );
  }
}));

const styles = {
  buttons: {
    flexFlow: 'row',
    WebkitFlexFlow: 'row'
  },
  button: {
    self: { width: 90, marginTop: 6, marginRight: 1, height: 59 }
  }
};
