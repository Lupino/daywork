import { React, NestedViewList, View, BackButton, Card, Swiper, Button, Page, store } from 'reapp-kit';

import { host } from '../../config';
import request from 'superagent';
import { modal } from '../lib/higherOrderComponent';
import JobTitle from './JobTitle';
import _ from 'lodash';

export default store.cursor(['profile', 'oauthToken'], modal(class extends Page {
  state = {
    status: '',
    loadMoreButton: true,
    currentPage: 0,
    works: []
  }
  handleLoadMore(page) {
    this.loadWorks(page);
  }
  loadWorks(page) {
    page = page || 0;
    let profile = this.props.profile;
    let userId = profile.get('userId');

    request.get(host + '/api/users/' + userId + '/works?page=' + page,
                (err, res) => {
                  if (err) {
                    return this.props.alert('网络错误');
                  }
                  let rsp = res.body;
                  if (rsp.err) {
                    return this.props.alert(rsp.msg || rsp.err);
                  }
                  let works = this.state.works.concat(_.clone(rsp.works));
                  works = _.uniq(works, 'jobId');
                  this.setState({ works });
                  if (rsp.works.length < 10) {
                    this.setState({ loadMoreButton: false });
                  }
                  this.setState({ currentPage: page });
                });
  }
  componentDidMount() {
    this.loadWorks();
  }
  render() {
    const backButton =
      <BackButton onTap={() => this.router().transitionTo('daywork')}> 我 </BackButton>;

    var child = this.hasChildRoute() && this.createChildRouteHandler({ getJobFromParent: this.handleGetJob }) || null;

    var viewListProps = this.routedViewListProps();

    let cards = this.state.works.filter(work=>work.status!=='Request')
      .map(work => {
      let { job, userId, jobId } = work;
      let salary = job.salary + ' RMB / ';
      if (job.payMethod === 'Daily') {
        salary += '天';
      } else {
        salary += '时';
      }

      let card = (
        <Card key={job.jobId}
          onClick={() => this.router().transitionTo('workDetail', { jobId, userId })}
          title={<JobTitle salary={salary} name={job.title} time={job.createdAt} />}>
          {job.summary}
        </Card>
      );
      return card;
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
            '我的工作'
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
