import React from 'react';
import ReactDOM from 'react-dom';
import App from '../components/App';
import Loading2 from '../components/Loading2';

const render = (reactElement) => {
  const store = global.store;
  const parent = document.createElement('div');
  document.body.appendChild(parent);

  const insertCss = (...styles) => {
    const removeCss = styles.map(x => x._insertCss());
    return () => { removeCss.forEach(f => f()); };
  };

  ReactDOM.render(
    <App context={{store, insertCss}}>
      {reactElement}
    </App>, parent
  );

  return parent;
};

const destroy = (domElement) => {
  ReactDOM.unmountComponentAtNode(domElement);
  domElement.parentNode.removeChild(domElement);
};

// 显示加载动画，返回销毁加载动画的函数
const showLoading = (delay=200) => {
  let domElement = null;
  const id = setTimeout(() => {
    domElement = render(<Loading2 />);
  }, delay);
  return () => {
    clearTimeout(id);
    domElement && destroy(domElement);
  };
};

/**
 * 执行异步函数并伴随着加载动画，函数执行完毕后加载动画消失(0.2秒后才会显示加载动画)
 * callback的返回值会作为决议后的结果
 * delay: 延迟多少毫秒才显示加载动画
 */
const execWithLoading = (callback, delay=200) => {
  return new Promise(resolve => {
    const close = showLoading(delay);
    callback().then((result) => {
      close();
      resolve(result);
    }).catch((e) => {
      close();
      console.error(e);
      resolve(false);
    });
  });
};

export default execWithLoading;
export {showLoading};
