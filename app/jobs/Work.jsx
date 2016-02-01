import React, { Component } from 'react';
import {
  Button, CardText,
  ProgressBar,
  List, ListItem
} from 'react-toolbox';
import {
  getJob, getUserWork, getUserRecords
} from '../api';
import JobItem from './JobItem';
import style from '../style';
import lodash from 'lodash';
import { prettyTime } from '../modules/utils';

export default class Work extends Component {
  constructor(props) {
    super(props);
    this.state = {
      work: {},
      records: [],
      loadMoreButton: false,
      currentPage:  0,
      loaded: false
    }
  }

  loadWork() {
    const { params, notify } = this.props;
    const { jobId } = params;
    getUserWork({ jobId }, (err, rsp) => {
      if (err) {
        return notify(err);
      }
      this.setState({ work: rsp.work, loaded: true });
    });
  }

  loadRecords(page) {
    const { params, notify } = this.props;
    const { jobId } = params;
    const limit = 10;
    page = page || 0;
    getUserRecords({ jobId, page, limit }, ( err, rsp ) => {
      if ( err ) {
        return notify(err);
      }
      let { records } = this.state;
      records = records.concat(lodash.clone(rsp.records));
      this.setState({ records, currentPage: page });
      if ( rsp.records.length < limit ) {
        this.setState( { loadMoreButton: false } );
      } else {
        this.setState( { loadMoreButton: true } );
      }
    });
  }

  componentDidMount() {
    this.loadWork();
    this.loadRecords();
  }

  render() {
    const { work, loaded, records, loadMoreButton, activeRecord, activePayment, recordNumber, currentPage } = this.state;
    if (!loaded) {
      return <ProgressBar mode='indeterminate' />;
    }

    const { payMethod, salary } = work.job;
    const unit = payMethod === 'Daily' ? '天' : '小时';
    const items = records.map((record) => {
      const paid = record.status === 'Unpaid' ? '未支付' : '已支付';
      return (
        <ListItem key={record.recordId}
          caption={`记录 ${record.recordNumber} ${unit}`}
         legend={`工资: ${record.salary} RMB (${paid})`}
         >
          <div className={style.date}>
            {prettyTime(record.createdAt)}
          </div>
        </ListItem>
      );
    });
    return (
      <div>
        <JobItem job={work.job}>
          <CardText>
            <div>{`总工资 ${work.totalSalary} RMB`}</div>
            <div>{`已支付工资 ${work.paidOffline + work.paidOnline} RMB`}</div>
            <div>{`待支付工资 ${work.unpaid} RMB`}</div>
            <div>{`待支付工作 ${work.recordNumber} ${unit}`}</div>
          </CardText>
        </JobItem>
        <List selectable ripple>
          {items}
        </List>
        { loadMoreButton && <Button
          label='加载更多...'
          raised
          primary
          className={style['load-more']}
          onClick={this.loadRecords.bind(this, currentPage + 1)}
        /> }
      </div>
    )
  }
}

Work.title = '工作详情';
