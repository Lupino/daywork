import React, { Component } from 'react';

export default class About extends Component {
  render() {
    return (
      <section>
        <h4 style={{ textAlign: 'center' }}>每日工作简介</h4>
        <p style={{ fontSize: '14pt' }}>&nbsp; &nbsp;&nbsp; &nbsp;使用每日工作你可以在这里找到你想要的兼职工作, 并帮助你记录每天的工作, 为你做结算。</p>
        <p style={{ fontSize: '14pt' }}>&nbsp; &nbsp;&nbsp; &nbsp;您也可以发布职位，将您的工作外包出去。</p>
      </section>
    );
  }
}

About.title = '关于';
