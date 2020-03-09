import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {Spin} from 'antd';
import s from './Loading2.less';

function Loading() {
  return (
    <div className={s.root}>
      <div>
        <Spin />
      </div>
    </div>
  );
}

export default withStyles(s)(Loading);
