import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Layout.less';
import Header from '../Header';
import Loading from '../Loading';

class Layout extends React.Component {
  static propTypes = {
    children: PropTypes.node
  };

  render() {
    const {loading, children} = this.props;
    return (
      <div className={s.root}>
        <Header />
        <div>
          {loading ? <Loading /> : <section>{children}</section>}
        </div>
      </div>
    )
  };
}

export default withStyles(s)(Layout);


