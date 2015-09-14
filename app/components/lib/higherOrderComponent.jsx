import { React, Modal } from 'reapp-kit';

export function alert(Component) {
  return class extends React.Component {
    state = {
      modal: false,
      msg: ''
    }

    toggleModal(type, msg) {
      this.setState({ modal: type, msg: msg });
    }

    alert(msg) {
      this.toggleModal('alert', msg);
    }

    render() {
      return (
        <div>
          {this.state.modal && <Modal
            title="提示"
            type={this.state.modal}
            onClose={this.toggleModal.bind(this, false)}>{this.state.msg} </Modal>}
          <Component {...this.props} alert={this.alert} />;
        </div>
      );
    }
  };
}
