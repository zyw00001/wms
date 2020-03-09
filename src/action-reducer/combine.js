import {getPathValue, deepAssignObj, deepAssignValue} from './helper';

/**
 * 返回值：返回reducer函数，该reducer会依据keyReducer的返回值调用指定keys下的reducer
 * keyReducer: 函数，原型为func(state, action)，返回值为包含keys和reducer的对象
 */
const mapReducer = (keyReducer) => {
  return (state, action) => {
    const {keys, reducer} = keyReducer(state, action);
    if (keys && typeof reducer === 'function') {
      const preState = getPathValue(state, keys);
      const newState = typeof preState !== 'object' ? preState : reducer(preState, action);
      if (preState !== newState) {
        return deepAssignValue(state, newState, keys);
      }
    }
    return state;
  }
};

const isUndefinedOrNull = (value) => {
  return (value === null) || (typeof value === 'undefined');
};

/**
 * 返回值：返回reducer函数，类似于redux中combineReducers返回的reducer
 *  只有state中相应的key存在时才会调用对应的reducer
 * reducers：键值对，key对应为state中的key，value是reducer函数
 */
const combineReducers = (reducers) => {
  const keys = Object.keys(reducers);
  return (state, action) => {
    let hasChange = false;
    let preKeyState, newKeyState;
    let newState = keys.reduce((newState, key) => {
      preKeyState = state[key];
      if (!isUndefinedOrNull(preKeyState)) {
        newKeyState = reducers[key](preKeyState, action);
        newState[key] = newKeyState;
        hasChange = hasChange || preKeyState !== newKeyState;
      }
      return newState;
    }, {});
    return hasChange ? deepAssignObj(state, newState) : state;
  }
};

/**
 * 返回值：返回reducer，该reducer会依据action type来调用reducer，如果action未能处理则交给nextReducer
 * reducers：键值对，key为action的type，value为reducer函数
 * nextReducer：[可选] reducer函数
 * initState：[可选] 传递给返回reducer的初始状态
 */
const composeReducers = (reducers, nextReducer, initState = {}) => {
  if (typeof nextReducer !== 'function') {
    nextReducer = state => state;
  }

  return (state = initState, action) => {
    if (reducers.hasOwnProperty(action.type)) {
      return reducers[action.type](state, action);
    } else {
      return nextReducer(state, action);
    }
  }
};

export {mapReducer, combineReducers, composeReducers};
