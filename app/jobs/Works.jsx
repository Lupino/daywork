import React, { Component, PropTypes } from 'react';
import { Button, List, ListItem } from 'react-toolbox';
import { getUserWorks, imageRoot } from '../api';
import style from '../style';
import lodash from 'lodash';

export default class Works extends Component {
  constructor(props) {
    super(props);
    this.state = {
      works: [],
      currentPage: 0,
      limit: 10,
      loadMoreButton: false,
      loaded: false
    }
  }

  handleLoadWorks = (page) => {
    page = page || 0;
    const { limit } = this.state;
    getUserWorks({page, limit}, (err, rsp) => {
      if (err) return window.alert(err);
      let { works } = this.state;
      works = works.concat(lodash.clone(rsp.works));
      works = lodash.uniq(works, 'id');
      const loadMoreButton = rsp.works.length > limit;
      this.setState({works, loadMoreButton, currentPage: Number(page), loaded: true});
    });
  };

  handleShowWork = (jobId) => {
    const { router } = this.context;
    router.push(`/works/${jobId}`);
  };

  handleFindJob = () => {
    const { router } = this.context;
    router.push(`/`);
  };

  componentDidMount() {
    this.handleLoadWorks();
  }

  renderWork(work) {
    const { id, jobId, unpaid, job } = work;
    let imgUrl = '/static/default-avatar.png';
    const avatar = job.user.avatar;
    if (avatar && avatar.key) {
      imgUrl = `${imageRoot}${avatar.key}`
    }
    return (
      <ListItem
        avatar={imgUrl}
        caption={job.title}
        key={id}
        onClick={this.handleShowWork.bind(this, jobId)}>
        <div className={style['right']}>
          {`${unpaid} 元`}
        </div>
      </ListItem>
    );
  }

  renderFindJob() {
    return (
      <div>
        <Button
          label='还没有工作, 快点击我找工作'
          className={style['load-more']}
          onClick={this.handleFindJob}
        />
      </div>
    );
  }

  render() {
    const works = this.state.works.map((work) => this.renderWork(work));
    const { loadMoreButton, currentPage } = this.state;

    if (works.length === 0) {
      return this.renderFindJob();
    }

    return (
      <div>
        <List selectable={false} ripple>
          {works}
        </List>
        { loadMoreButton &&
          <Button
            label='加载更多...'
            raised
            primary
            className={style['load-more']}
            onClick={this.handleLoadWorks.bind(this, currentPage + 1)}
          />
        }
      </div>
    );
  }
}

Works.title = '我的工作';
Works.contextTypes = {
  router: PropTypes.object
}
