import React, { Component } from 'react';
import {
  Button, CardActions, CardText,
  ProgressBar,
  List, ListItem,
  Input, Dialog
} from 'react-toolbox';
import {
  getJob, getJobWorker, getJobRecords,
  addRecord, cancelRecord, assignWorker,
  payOffline
} from '../api';
import UserItem from './UserItem';
import style from '../style';
import lodash from 'lodash';
import { prettyTime } from '../modules/utils';

class Payment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: props.active,
      money: props.money || ''
    };
  }

  handleInputChange = (money) => {
    this.setState({ money });
  };

  handleCloseDialog = () => {
    this.setState({active: false});
    if ( this.props.onClose ) {
      this.props.onClose();
    }
  };

  handlePayOffline = () => {
    const { notify, jobId, id, confirm } = this.props;
    const { money } = this.state;
    this.handleCloseDialog();
    confirm({ message: '确定支付？', onConfirm: () => {
      payOffline({ jobId, id, money }, (err, rsp) => {
        if (err) {
          return notify(err);
        }
        this.handleCloseDialog();
        if (this.props.onPaid) {
          this.props.onPaid();
        }
      });
    } });
  };

  componentWillReceiveProps(props) {
    this.setState({ active: props.active });
  }

  render() {
    const { money, active } = this.state;
    const actions = [
      { label: '关闭', raised: true, accent: true, onClick: this.handleCloseDialog },
      { label: '线下支付', raised: true, onClick: this.handlePayOffline}
    ];
    return (
      <Dialog actions={actions} active={active} title={'支付工资'}>
        <Input type='number' label='支付金额(元)' onChange={this.handleInputChange} value={money} />
      </Dialog>
    );
  }
}

class AddRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: props.active,
      recordNumber: 1
    };
  }

  handleInputChange = (recordNumber) => {
    this.setState({ recordNumber });
  };

  handleCloseDialog = () => {
    this.setState({active: false});
    if ( this.props.onClose ) {
      this.props.onClose();
    }
  };

  handleAddRecord = () => {
    const { notify, jobId, userId } = this.props;
    const { recordNumber } = this.state;
    addRecord({ jobId, userId, recordNumber }, (err, rsp) => {
      if ( err ) {
        return notify(err)
      }
      if (this.props.onAdded) {
        this.props.onAdded(rsp.record);
      }
      this.handleCloseDialog();
    });
  };

  componentWillReceiveProps(props) {
    this.setState({ active: props.active });
  }

  render() {
    const { payMethod } = this.props;
    const { recordNumber, active } = this.state;
    const actions = [
      { label: '取消', raised: true, accent: true, onClick: this.handleCloseDialog },
      { label: '添加', raised: true, onClick: this.handleAddRecord}
    ];
    const inputLabel = payMethod === 'Daily' ? '工作天数' : '工作小时数';
    return (
      <Dialog actions={actions} active={active} title={'记录工作'}>
        <Input label={inputLabel} type='number' value={recordNumber} onChange={this.handleInputChange} />
      </Dialog>
    );
  }
}

export default class Worker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      worker: {},
      records: [],
      loadMoreButton: false,
      currentPage:  0,
      loaded: false,
      activeRecord: false,
      recordNumber: 1
    }
  }

  loadWorker() {
    const { params, notify } = this.props;
    const { jobId, userId } = params;
    getJobWorker({ jobId, userId }, (err, rsp) => {
      if (err) {
        return notify(err);
      }
      this.setState({ worker: rsp.worker, loaded: true });
    });
  }


  handleShowRecordDia = () => {
    this.setState({activeRecord: true});
  };

  handleShowPaymentDia = () => {
    this.setState({activePayment: true});
  };

  handleCloseDialog = () => {
    this.setState({activePayment: false, activeRecord: false});
  };

  handleAddedRecord = (record) => {
    records = [record].concat(this.state.records);
    this.setState({ records });
  };

  handlePaid = () => {
    window.location.reload();
  };

  loadRecords(page) {
    const { params, notify } = this.props;
    const { jobId, userId } = params;
    const limit = 10;
    page = page || 0;
    getJobRecords({ jobId, userId, page, limit }, ( err, rsp ) => {
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
    this.loadWorker();
    this.loadRecords();
  }

  render() {
    const { worker, loaded, records, loadMoreButton, activeRecord, activePayment, recordNumber, currentPage } = this.state;
    if (!loaded) {
      return <ProgressBar mode='indeterminate' />;
    }

    const { payMethod, salary } = worker.job;
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
        <UserItem worker={worker}>
          <CardText>
            <div>{`总工资 ${worker.totalSalary} RMB`}</div>
            <div>{`已支付工资 ${worker.paidOffline + worker.paidOnline} RMB`}</div>
            <div>{`待支付工资 ${worker.unpaid} RMB`}</div>
            <div>{`待支付工作 ${worker.recordNumber} ${unit}`}</div>
          </CardText>
          <CardActions>
            <Button label='记录工作' icon='add' raised onClick={this.handleShowRecordDia} />
            <Button label='支付' icon='payment' raised onClick={this.handleShowPaymentDia} />
          </CardActions>
        </UserItem>
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
        <AddRecord
          payMethod={worker.job.payMethod}
          jobId={worker.jobId}
          userId={worker.userId}
          notify={this.props.notify}
          active={activeRecord}
          onClose={this.handleCloseDialog}
          onAdded={this.handleAddedRecord}
        />
        <Payment
          jobId={worker.jobId}
          id={worker.id}
          notify={this.props.notify}
          confirm={this.props.confirm}
          active={activePayment}
          onClose={this.handleCloseDialog}
          onPaid={this.handlePaid}
          money={worker.unpaid}
        />
      </div>
    )
  }
}

Worker.title = '职工详情';
