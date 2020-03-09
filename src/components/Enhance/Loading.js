import React, {PropTypes} from 'react';
import Loading from '../Loading';

const STATUS = [
  'loadingWithInit',  // 显示加载画面，并自动触发onInit事件，默认值
  'loading',          // 显示加载画面
  'retry',            // 显示重试画面
  'retryForHome',     // 显示重试画面(触发onInit时，home参数为true)
  'page',             // 显示正常的页面(表明页面状态已经初始化好)
];

/**
 * status: [可选], 当前状态。默认为loadingWithInit
 * home: [可选]，为true表明接受首页触发的事件。默认为false
 * onInit: [可选],原型为func(home)，home为true表明初始化是来源首页
 * onRefreshForHome：[可选],检测到来至首页时会触发该事件，原型为func()
 */
const Enhance = Component => class extends React.Component {
  static propTypes = {
    status: PropTypes.oneOf(STATUS),
    home: PropTypes.bool,
    onInit: PropTypes.func,
    onRefreshForHome: PropTypes.func
  };

  triggerEvent = () => {
    if (!global.isServer) {
      const {status='loadingWithInit', home, onInit, onRefreshForHome} = this.props;
      if (!home) {
        if (status === 'loadingWithInit') {
          onInit && onInit(false);
        }
      } else {
        const __home = global['__home'];
        global['__home'] && (global['__home'] = false);
        if (status === 'loadingWithInit') {
          onInit && onInit(__home);
        } else if (__home) {
          if (status === 'page') {
            onRefreshForHome && onRefreshForHome(__home);
          } else if (status !== 'loading') {
            onInit && onInit(__home);
          }
        }
      }
    }
  };

  componentDidMount() {
    this.triggerEvent();
  }

  componentDidUpdate() {
    this.triggerEvent();
  }

  onRetry = () => {
    const {status, onInit} = this.props;
    onInit && onInit(status === 'retryForHome');
  };

  getPageProps = () => {
    const props = {...this.props};
    delete props.status;
    delete props.home;
    delete props.onInit;
    delete props.onRefreshForHome;
    return props;
  };

  render() {
    const {status} = this.props;
    if (status !== 'page') {
      const retry = status === 'retry' || status === 'retryForHome';
      return <Loading retry={retry} onRetry={this.onRetry}/>;
    } else {
      return <Component {...this.getPageProps()} />;
    }
  }
};

export default Enhance;
