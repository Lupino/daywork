import { React, Modal } from 'reapp-kit';

export function modal(Component) {
  return class extends React.Component {
    state = {
      modal: false,
      callback: null,
      msg: ''
    }

    toggleModal(type) {
      this.setState({ modal: type });
    }

    alert(msg, callback) {
      this.setState({ modal: 'alert', msg, callback });
    }

    confirm(msg, callback) {
      this.setState({ modal: 'confirm', msg, callback });
    }

    onConfirm() {
      if (this.state.callback) {
        this.state.callback(true);
      }
    }

    onClose() {
      if (this.state.callback && this.state.modal === 'alert') {
        this.state.callback(false);
      }
      this.toggleModal(false);
    }

    render() {
      return (
        <div>
          {this.state.modal && <Modal
            title="提示"
            type={this.state.modal}
            onConfirm={this.onConfirm}
            onClose={this.onClose}>{this.state.msg} </Modal>}
          <Component {...this.props} alert={this.alert} confirm={this.confirm} />;
        </div>
      );
    }
  };
}
