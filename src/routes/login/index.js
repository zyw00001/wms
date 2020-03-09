import React from 'react';
import Login from './Login';

const title = '登录';

export default {
  path: '/login',

  async action() {
    return {
      title,
      single: true,
      component: <Login />
    };
  }
};
