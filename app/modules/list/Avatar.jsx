import React from 'react';
import style from './style';
import Dropzone from 'react-dropzone';
import { ListItem, Avatar as Ava } from 'react-toolbox';

export default class Avatar extends React.Component {
  render () {
    const { onDrop, avatar, ...props } = this.props;
    return (
      <Dropzone onDrop={onDrop} className={style.dropzone}>
        <div className={`${style.avatar}`}>
          <Ava>
            <img src={avatar} />
          </Ava>
        </div>
      </Dropzone>
    );
  }
}
