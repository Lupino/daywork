import React, { Component, PropTypes } from 'react';
import { CardActions, Button } from 'react-toolbox';
import { getUserWorks } from '../api';
import JobItem from './JobItem';
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

  componentDidMount() {
    this.handleLoadWorks();
  }

  renderWork(work) {
    const { id, jobId } = work;
    return (
      <JobItem job={work.job} key={`work-${id}`}>
        <CardActions>
          <Button label="查看详情" raised onClick={this.handleShowWork.bind(this, jobId)} />
        </CardActions>
      </JobItem>
    );
  }

  render() {
    const works = this.state.works.map((work) => this.renderWork(work));
    const { loadMoreButton, currentPage } = this.state;

    return (
      <div>
        {works}
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
