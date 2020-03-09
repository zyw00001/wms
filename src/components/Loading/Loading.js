import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {Spin} from 'antd';
import s from './Loading.less';

function Loading({retry, onRetry}) {
  return (
    <div className={s.root}>
      <div>
        {!retry ? <Spin /> : <span>加载失败，点击<a onClick={onRetry}>重试</a></span>}
      </div>
    </div>
  );
}

export default withStyles(s)(Loading);
