import React, { Component, cloneElement } from 'react';
import { App as ToolboxApp, Snackbar, Dialog, Input } from 'react-toolbox';
import style from './style';

export default function(App, Wapper) {
  Wapper = Wapper || ToolboxApp;
  return class extends Component {
    state = {
      snackbarActive: false,
      snackbarLabel: '',
      snackbarCallback: null,
      diaTitle: '',
      diaActive: false,
      diaActions: [],
      diaChildren: null,
      promptValue: '',
      isPromptDia: false
    };

    handleSnackbarClick = () => {
      const { snackbarCallback } = this.state;
      if ( snackbarCallback ) {
        snackbarCallback();
      }
      this.setState({ snackbarActive: false, snackbarCallback: null });
    };

    handleSnackbarTimeout = () => {
      const { snackbarCallback } = this.state;
      if ( snackbarCallback ) {
        snackbarCallback();
      }
      this.setState({ snackbarActive: false, snackbarCallback: null });
    };

    handleShowSnackbar = (snackbarLabel, snackbarCallback) => {
      this.setState({ snackbarActive: true, snackbarLabel, snackbarCallback })
    };

    handleDiaClose = () => {
      this.setState( { diaActive: false, isPromptDia: false } );
    };

    handleDiaAlert = ({ message, title }, callback) => {
      const diaActive = true;
      const diaActions = [
        {
          label: '确定',
          raised: true,
          onClick: () => {
            callback && callback();
            this.handleDiaClose();
          }
        }
      ];
      const diaChildren = <p> {message} </p>;
      this.setState( { diaTitle: title, diaActions, diaChildren, diaActive } );
    };

    handleDiaConfirm = ({ message, title, onConfirm, onCancel }, callback) => {
      const diaActive = true;
      const diaActions = [
        {
          label: '确定',
          raised: true,
          onClick: () => {
            onConfirm && onConfirm();
            callback && callback(true);
            this.handleDiaClose();
          }
        },
        {
          label: '取消',
          raised: true,
          onClick: () => {
            onCancel && onCancel();
            callback && callback(false);
            this.handleDiaClose();
          }
        }
      ];
      const diaChildren = <p> {message} </p>;
      this.setState( { diaTitle: title, diaActions, diaChildren, diaActive } );
    };

    handleDialog = ({ title, children, actions }) => {
      const diaActive = true;
      const diaActions = actions.map(( action ) => {
        const _onClick = action.onClick;
        action.onClick = () => {
          const ret = _onClick ? _onClick.apply(null, arguments) : null;
          if (ret !== false) {
            this.handleDiaClose();
          }
        }
        return action;
      });
      const diaChildren = children;
      this.setState( { diaTitle: title, diaActions, diaChildren, diaActive } );
    };

    handlePromptChange = (promptValue) => {
      this.setState({ promptValue });
    };

    handleDiaPrompt = ({ message, title, onSuccess, onCancel }, callback) => {
      const diaActive = true;
      const diaActions = [
        {
          label: '确定',
          raised: true,
          onClick: () => {
            const { promptValue } = this.state;
            onSuccess && onSuccess(promptValue);
            callback && callback(promptValue);
            this.handleDiaClose();
          }
        },
        {
          label: '取消',
          raised: true,
          onClick: () => {
            onCancel && onCancel();
            callback && callback(false);
            this.handleDiaClose();
          }
        }
      ];
      this.setState( { diaTitle: title, diaActions, diaActive, promptValue: '', isPromptDia: true } );
    };

    render() {
      const { snackbarActive, snackbarLabel } = this.state;
      const { diaTitle, diaActive, diaActions, isPromptDia, promptValue } = this.state;
      const props = {
        notify: this.handleShowSnackbar,
        alert: this.handleDiaAlert,
        confirm: this.handleDiaConfirm,
        dialog: this.handleDialog,
        prompt: this.handleDiaPrompt
      };
      const { children, ...otherProps } = this.props;
      const child = children ? cloneElement(children, props): null;

      let diaChildren = this.state.diaChildren;
      if (!diaChildren && isPromptDia) {
        diaChildren = <Input value={promptValue} onChange={this.handlePromptChange} />
      }

      return (
        <Wapper>
          <App ref="app" {...otherProps} {...props}>
           {child}
          </App>
          <Snackbar
            action='关闭'
            active={snackbarActive}
            icon='info'
            label={snackbarLabel}
            timeout={2000}
            onClick={this.handleSnackbarClick}
            onTimeout={this.handleSnackbarTimeout}
            type='cancel'
            className={style['not-print']}
          />
          <Dialog
            actions={diaActions}
            active={diaActive}
            title={diaTitle || '提示'}
            onOverlayClick={this.handleDiaClose}>
            {diaChildren}
          </Dialog>
        </Wapper>
      );
    }
  }
}
