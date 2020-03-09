import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import Login from './routes/login/Login';

const context = {
  insertCss: (...styles) => {
    const removeCss = styles.map(x => x._insertCss());
    return () => { removeCss.forEach(f => f()); };
  },
};

const getCurrent = () => {
  const path = window.location.pathname.replace(/\/$/g, '');
  if (path === '/login') {
    return <Login />;
  } else {
    return <div>页面不存在</div>;
  }
};

const container = document.getElementById('app');
const component = <App context={context}>{getCurrent()}</App>;
ReactDOM.render(component, container);
