import {deepAssignObj} from './helper';
import {Action} from './action';
import {addArrayItem, delArrayItem, updateArray} from './array';
import {composeReducers} from './combine';

/**
 * 功能：替换整个状态
 * payload：[对象]，新的状态
 */
const create = (state, {payload}) => {
  return payload;
};

/**
 * 功能：修改指定对象的值，会和原对象进行合并
 * path：[字符串数组或字符串]，指定要操作的数组在state中的位置
 * payload：[对象]，新的值
 */
const assign = (state, {path, payload}) => {
  return deepAssignObj(state, payload, path);
};

/**
 * 功能：在数组中增加一个元素
 * action必须含有path,index,payload
 *  path：[字符串数组或字符串]，指定要操作的数组在state中的位置
 *  index：索引号，可以为非负整数、undefined或对象
 *   为undefined表示添加到数组最后
 *   为对象时，对象中必须含有key和value属性
 *  payload：[对象]，新元素的值
 */
const add = (state, action) => {
  return addArrayItem(state, action);
};

/**
 * 功能：删除数组指定位置的元素
 * action必须含有path,index
 *  path：[字符串数组或字符串]，指定要操作的数组在state中的位置
 *  index：索引号，可以为非负整数或对象，为对象时，对象中必须含有key和value属性
 */
const del = (state, action) => {
  return delArrayItem(state, action);
};

/**
 * 功能：修改数组的一个或所有元素
 * action必须含有path,index,payload
 *  path：[数组或字符串]，指定要操作的数组在state中的位置
 *  index: 索引号，为-1表示对所有数组元素进行操作
 *  payload：[对象]，该对象会与原数组元素进行合并
 */
const update = (state, action) => {
  return updateArray(state, action);
};

// 创建一个key-value对象，key表示action type，value是reducer函数
const createReducerObj = (typePrefix) => {
  const TYPE = Action.createActionType(typePrefix);
  return {
    [TYPE.CREATE]: create,
    [TYPE.ASSIGN]: assign,
    [TYPE.ADD]: add,
    [TYPE.DEL]: del,
    [TYPE.UPDATE]: update
  };
};

/**
 * 功能：创建一个标准的reducer函数：先依据action type做处理，如果未识别type，则交给nextReducer处理
 * typePrefix：数组，用于构造action type的前缀，确保action type的唯一性
 * nextReducer：可选，reducer函数
 * initState：可选，初始状态
 */
const createReducer = (typePrefix, nextReducer, initState = {}) => {
  return composeReducers(createReducerObj(typePrefix), nextReducer, initState);
};

export {createReducer};
