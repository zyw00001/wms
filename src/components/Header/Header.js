import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Header.less';

/**
 * username: 用户名
 */
class Header extends React.Component {
  render() {
    return (
      <header className={s.root}>
        <span>WMS</span>
      </header>
    );
  }
}

export default withStyles(s)(Header);
