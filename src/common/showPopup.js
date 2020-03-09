import React from 'react';
import ReactDOM from 'react-dom';
import App from '../components/App';

const create = (Component, props, onClose, afterClose) => {
  const store = global.store;
  const node = document.createElement('div');
  document.body.appendChild(node);

  const insertCss = (...styles) => {
    const removeCss = styles.map(x => x._insertCss());
    return () => { removeCss.forEach(f => f()); };
  };

  const closeProps = {
    [afterClose ? 'afterClose' : 'onClose']: onClose.bind(null, node)
  };

  ReactDOM.render(
    <App context={{store, insertCss}}>
      <Component {...props} {...closeProps} />
    </App>, node
  );
};

// 显示弹出框，弹出框组件Component关闭时必须调用onClose(result), result为showPopup的返回值
const showPopup = (Component, props={}, afterClose=false) => {
  return new Promise(resolve => {
    const onClose = (resolve, node, result) => {
      ReactDOM.unmountComponentAtNode(node);
      node.parentNode.removeChild(node);
      resolve(result);
    };
    create(Component, props, onClose.bind(null, resolve), afterClose);
  });
};

export default showPopup;
