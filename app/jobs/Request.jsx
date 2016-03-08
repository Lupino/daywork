import React, { Component, PropTypes } from 'react';
import {
  Button, CardActions,
  ProgressBar
} from 'react-toolbox';
import { getJobWorker, assignWorker } from '../api';
import UserItem from './UserItem';
import style from '../style';
import lodash from 'lodash';

export default class Request extends Component {
  constructor(props) {
    super(props);
    this.state = {
      worker: {},
      loaded: false
    }
  }

  loadWorker = () => {
    const { params, notify } = this.props;
    const { jobId, userId } = params;
    getJobWorker({ jobId, userId }, (err, rsp) => {
      if (err) {
        return notify(err);
      }
      this.setState({ worker: rsp.worker, loaded: true });
    });
  };

  handleJoin() {
    const { params, notify } = this.props;
    const { jobId, userId } = params;
    const { router } = this.context;
    assignWorker({ userId, jobId }, (err, rsp) => {
      if (err) {
        return notify(err);
      }
      notify('添加成功', () => {
        router.push(`/jobs/${jobId}`);
      });
    });
  }

  componentDidMount() {
    this.loadWorker();
  }

  render() {
    const { worker, loaded } = this.state;
    if (!loaded) {
      return <ProgressBar mode='indeterminate' />;
    }
    return (
      <div>
        <UserItem worker={worker}>
          <CardActions>
            <Button label='同意加入' icon='add' raised onClick={this.handleJoin.bind(this)} />
          </CardActions>
        </UserItem>
      </div>
    )
  }
}

Request.title = '职工详情';
Request.contextTypes = {
  router: PropTypes.object
}
