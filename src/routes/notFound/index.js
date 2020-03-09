import React from 'react';
import LayoutContainer from '../../components/Layout/LayoutContainer';
import NotFound from './NotFound';

const title = 'Page Not Found';

export default {

  path: '*',

  action() {
    return {
      title,
      component: <LayoutContainer><NotFound title={title}/></LayoutContainer>,
      status: 404
    };
  }

};
