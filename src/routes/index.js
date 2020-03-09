import {Action} from '../action-reducer/action';

const dispatch = (context, params, route, resolve) => {
  const newContext = Object.assign({}, context, {route});
  if (!context.route.children.length) {
    // 动态加载后，替换成真正的route
    context.route.children = route.children;
    context.route.action = route.action;
  }
  route.action(newContext, params).then(route => {
    resolve(route);
  });
};

const createAction = (load) => (context, params) => {
  return new Promise(resolve => {
    if (!global.isServer) {
      const action = new Action(['layout']);
      global.store.dispatch(action.assign({loading: context.path.slice(1)}));
      global.store.getState().layout.loading = '';
    }
    load(resolve, context, params);
  });
};

// The top-level (parent) route
export default {

  path: '/',

  children: [
    require('./login').default,
    require('./home').default,
    // Wildcard routes, e.g. { path: '*', ... } (must go last)
    require('./notFound').default
  ],

  async action({ next }) {
    const route = await next();
    route.title = route.title ? `${route.title} - WMS` : 'WMS';
    route.description = route.description || '';
    return route;
  }

};
