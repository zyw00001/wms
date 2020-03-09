import React from 'react';
import LayoutContainer, {canOpen} from '../components/Layout/LayoutContainer';

const wrapperComponent = (nav1, nav2, route) => {
  return <LayoutContainer {...{nav1, nav2}}>{route.component}</LayoutContainer>;
};

const noComponent = () => {
  const style = {
    height: '100%',
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: 'white'
  };
  return <div style={style}>404，页面不存在</div>;
};

const createAction = (title) => async ({next, query, url=''}) => {
  const route = await next();
  if (route.wrap) {
    const params = url.split('/', 3);
    const nav1 = params[1];
    const nav2 = params[2];
    if (query['access'] === 'force' || canOpen(nav1, nav2)) {
      return {title, component: wrapperComponent(nav1, nav2, route)};
    } else {
      return {component: noComponent()};
    }
  } else {
    return route;
  }
};

const createRoutes = (path, title, children) => {
  return {path, children, action: createAction(title)};
};

export default createRoutes;
