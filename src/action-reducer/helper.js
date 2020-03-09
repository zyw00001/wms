/**
 * (不会修改原对象) 为对象的关键路径赋值，且在关键路径上遇到的每个对象都会生成一个新的对象
 * subObj：赋予的新值，key-value对
 * path：字符串或字符串数组，用于指定关键路径，路径中的每一个key(字符串)都是对象中的属性，如果指定的key不存在则会创建
 */
const deepAssignObj = (obj, subObj, path) => {
  const {...newObj} = obj;
  const last = makeArray(path).reduce((state, key) => {
    ({...state[key]} = state[key] || {});
    return state[key];
  }, newObj);
  Object.assign(last, subObj);
  return newObj;
};

/**
 * (不会修改原对象) 为对象的关键路径赋值
 */
const deepAssignValue = (obj, value, path) => {
  const arrPath = makeArray(path);
  const key = arrPath[arrPath.length - 1];
  return deepAssignObj(obj, {[key]: value}, arrPath.slice(0, -1));
};

/**
 * 功能：获取对象关键路径的值，不存在则返回undefined
 * obj：对象
 * path：字符串或字符串数组，指定关键路径
 */
const getPathValue = (obj, path) => {
  if (!path) {
    return undefined;
  } else {
    return makeArray(path).reduce((value, key) => typeof value !== 'object' ? undefined : value[key], obj);
  }
};

/**
 * 确保path为数组
 */
const makeArray = (path) => {
  if (Array.isArray(path)) {
    return path;
  } else if (!path) {
    return [];
  } else {
    return [path];
  }
};

export {deepAssignObj, deepAssignValue, getPathValue, makeArray};
