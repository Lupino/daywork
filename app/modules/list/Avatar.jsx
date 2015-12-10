import React from 'react';
import ClassNames from 'classnames';
import FontIcon from 'react-toolbox/lib/font_icon';
import Ripple from 'react-toolbox/lib/ripple';
import style from 'react-toolbox/lib/list/style';
import _style from './style';
import Dropzone from 'react-dropzone';

class Avatar extends React.Component {
  static propTypes = {
    avatar: React.PropTypes.string,
    caption: React.PropTypes.string.isRequired,
    className: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    onDrop: React.PropTypes.func,
    rightIcon: React.PropTypes.string,
    ripple: React.PropTypes.bool,
    selectable: React.PropTypes.bool,
  };

  static defaultProps = {
    disabled: false,
    ripple: false,
    selectable: false
  };

  handleDrop = (files) => {
    if (this.props.onDrop && !this.props.disabled) {
      this.props.onDrop(files);
    }
  };

  handleMouseDown = (event) => {
    if (this.refs.ripple && !this.props.disabled) {
      this.refs.ripple.start(event);
    }
  };

  renderContent () {
    const className = ClassNames(style.item, {
      [style.disabled]: this.props.disabled,
      [style.selectable]: this.props.selectable
    }, this.props.className);

    return (
      <span className={className}>
        <Dropzone onDrop={this.handleDrop} className={_style.dropzone}>
          <span className={_style.caption}> {this.props.caption} </span>
          <div className={`${_style.avatar}`}>
            <img src={this.props.avatar} />
          </div>
        </Dropzone>
        {this.props.ripple ? <Ripple ref='ripple' className={style.ripple} spread={2} /> : null}
        {this.props.rightIcon ? <FontIcon className={`${style.icon} ${style.right}`} value={this.props.rightIcon} /> : null}
      </span>
    );
  }

  render () {
    return (
      <li className={style['list-item']} onMouseDown={this.handleMouseDown}>
        {this.renderContent()}
      </li>
    );
  }
}

export default Avatar;
