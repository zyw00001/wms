import React from 'react';
import LayoutContainer from '../../components/Layout/LayoutContainer';

export default {
  path: '/',

  async action() {
    return {
      title: '',
      component: <LayoutContainer />
    };
  }
};
