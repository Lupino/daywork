import React, { Component } from 'react';
import { AppBar, Navigation, Button, Drawer, MenuItem, MenuDivider, Card } from 'react-toolbox';
import style from './style';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false
    };
  }

  handleToggle = () => {
    this.setState({active: !this.state.active});
  }

  render() {
    const actions = [
      { label: 'Play', icon: 'play-arrow' },
      { label: 'Close' }
    ]
    return (
      <div>
        <AppBar fixed flat className={style['app-bar']}>
          <Button icon='list' floating mini ripple
            onClick={this.handleToggle}
          />
          <div className={style['app-bar-text']}> 每日工作 </div>
          <Navigation />
        </AppBar>
        <Drawer active={this.state.active} onOverlayClick={this.handleToggle}>
          <MenuItem value='signup' icon='account_box' caption='注册/登录' />
          <MenuItem value='message' icon='message' caption='消息' />
          <MenuItem value='settings' icon='settings' caption='设置' />
          <MenuItem value='help' icon='help' caption='帮助' />
          <MenuDivider />
          <MenuItem value='关于' icon='info' caption='关于' />
        </Drawer>
        <div className={style.container}>
          <Card
              className={style.card}
              image='http://pitchfork-cdn.s3.amazonaws.com/longform/221/Deerhunter-Fading-Frontier640.jpg'
              text='A Deerhunter album rollout usually coincides with some pithy and provocative statements from Bradford Cox on pop culture...'
              title='Deerhunter - Fading Frontier'
              color="rgba(0,0,0,.4)"
              actions={actions}
              />
          <Card
              className={style.card}
              image='http://pitchfork-cdn.s3.amazonaws.com/longform/221/Deerhunter-Fading-Frontier640.jpg'
              text='A Deerhunter album rollout usually coincides with some pithy and provocative statements from Bradford Cox on pop culture...'
              title='Deerhunter - Fading Frontier'
              color="rgba(0,0,0,.4)"
              actions={actions}
              />
        </div>
      </div>
    );
  }
}
