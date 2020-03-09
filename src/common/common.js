import fetch from '../core/fetch';
import message from 'antd/lib/message';

/**
 * 功能：设置fetch的选项
 */
const postOption = (body, method = 'post') => {
  return {
    method,
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body)
  }
};

/**
 * 功能：发送请求，并解析json
 */
const fetchJson = async (url, option, cookie=true, jump=true) => {
  if (cookie) {
    if (typeof option === 'undefined') {
      option = {credentials: 'include'};
    } else if (typeof option === 'string') {
      option = {method: option, credentials: 'include'};
    } else if (!option.credentials) {
      Object.assign(option, {credentials: 'include'});
    }
  } else {
    if (typeof option === 'string') {
      option = {method: option};
    }
  }

  try {
    const res = await fetch(url, option);
    if (!res.ok) {
      return {returnCode: res.status, returnMsg: `${res.status} - ${res.statusText}`};
    } else {
      const json = await res.json();
      if (json.returnCode !== 0 && json.errorCode) {
        json.returnCode = Number(json.errorCode) || 10001;
      }
      if (jump && (json.returnCode === 9998)) {
        window.location.href = '/login';
      }
      return json;
    }
  } catch (e) {
    return {returnCode: 10000, returnMsg: '无法请求资源'};
  }
};

// node端获取json数据
const fetchJsonByNode = (req, url, option) => {
  const {token} = req.cookies;
  const cookie = {'Cookie': `token=${token}`};
  if (typeof option === 'string') {
    option = {method: option, headers: cookie};
  } else if (typeof option === 'undefined') {
    option = {headers: cookie};
  } else if (option.headers) {
    Object.assign(option.headers, cookie);
  } else {
    Object.assign(option, {headers: cookie});
  }
  if (req.headers['accept-language']) {
    option.headers['accept-language'] = req.headers['accept-language'];
  }
  return fetchJson(url, option, false, false);
};

/**
 * 功能：(批量)获取标准的下拉列表
 * 返回值：
 *  当传了多个参数时，则每个参数必须为字符串，返回值中的result是对象，对象的key则是传递的type
 *  当只传了一个参数时，且类型为数组，返回值中的result对象，对象的key则是传递的type
 *  当只传了一个参数时，且类型是字符串，返回值中的result是数组
 */
const fetchSelect = (...types) => {
  const url = '/api/standard/select';
  if (types.length > 1) {
    return fetchJson(url, postOption(types));
  } else if (types.length === 1) {
    if (Array.isArray(types[0])) {
      return fetchJson(url, postOption(types[0]));
    } else {
      return fetchJson(`${url}/${types[0]}`);
    }
  }
};

// 模糊搜索
const fuzzySearch = (type, filter='') => {
  const url = `/api/standard/search/${type}?filter=${filter}`;
  return fetchJson(url);
};

// 根据option中的searchType或searchUrl进行模糊搜索
const fuzzySearchEx = (filter, option) => {
  if (option.hasOwnProperty('searchType')) {
    return fuzzySearch(option.searchType, filter);
  } else if (option.hasOwnProperty('searchUrl')) {
    return fetchJson(`${option.searchUrl}?filter=${filter}`);
  } else {
    return {returnCode: -1, returnMsg: '无效参数'};
  }
};

/**
 * 功能：如果returnCode不为0，则抛出异常，否则取出result
 * 参数：从服务端获取的JSON格式数据
 */
const getJsonResult = (json) => {
  if (json.returnCode !== 0) {
    const error = new Error();
    error.message = json.returnMsg;
    error.code = json.returnCode;
    throw error;
  } else {
    return json.result;
  }
};

/**
 * 功能：从obj中提取出指定属性，并构造出一个新的对象
 *  obj：[必须]，对象
 *  keys：[必须]，字符串数组，用于指定需要提取的属性
 * 返回值：返回构造出的对象
 */
const getObject = (obj, keys) => {
  return keys.reduce((newObj, key) => {
    newObj[key] = obj[key];
    return newObj;
  }, {});
};

/**
 * 功能：从obj中取出不包含keys指定的属性，并组成一个新的子对象
 */
const getObjectExclude = (obj, keys) => {
  const inKeys = key => keys.some(k => k === key);
  return  Object.keys(obj).reduce((newObj, key) => {
    !inKeys(key) && (newObj[key] = obj[key]);
    return newObj;
  }, {});
};

/**
 * 功能：判断一个值是否为空(null,undefined和''属于空)
 */
const isEmpty = (value) => {
  const type = typeof value;
  if (type === 'number' || type === 'boolean') {
    return false;
  } else {
    return !value;
  }
};

/**
 * 功能：判断一个值是否为空(null,undefined,''和[]属于空)
 */
const isEmpty2 = (value) => {
  const type = typeof value;
  if (type === 'number' || type === 'boolean') {
    return false;
  } else if (Array.isArray(value)) {
    return !value.length;
  } else {
    return !value;
  }
};

/**
 * 功能：依据fields来验证value中指定属性(key)是否为空
 *  fields：[必须]，对象数组，每个对象用于描述value中的相应的属性是否为必填项(不能为空)
 *   对象中必须有key属性，以及可选的required属性，required为true表明指示的key为必填项
 *  value：[必须]，对象(key-value对)
 * 返回值：通过校验返回true，未通过返回false
 */
const validValue = (fields, value) => {
  return fields.every(({key, required}) => {
    return !required || !isEmpty2(value[key]);
  });
};

const validArray = (fields, array) => {
  return !array.some(item => !validValue(fields, item));
};

// 判断是否只选中了一个，如果选中多个或未选中一个，则返回-1；否则，返回选中的索引号
const findOnlyCheckedIndex = (items) => {
  const index = items.reduce((result, item, index) => {
    item.checked && result.push(index);
    return result;
  }, []);
  return index.length !== 1 ? -1 : index[0];
};

const findOnlyCheckedItem = (items) => {
  const index = findOnlyCheckedIndex(items);
  return index > -1 ? items[index] : null;
};


const toValidValue = (value) => {
  return [undefined, null, NaN].includes(value) ? '' : value;
};

const normalValue = (value) => {
  value = toValidValue(value);
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value;
    } else if (value.hasOwnProperty('value')) {
      return toValidValue(value.value);
    } else {
      return '';
    }
  } else {
    return value;
  }
};

/**
 * 提取出包含{value,title}中的value，用于传递给后端接口
 */
const convert = (value) => {
  return Object.keys(value).reduce((result, key) => {
    result[key] = normalValue(value[key]);
    return result;
  }, {});
};

// 判断指定的tab key是否存在
const isTabExist = (tabs, key) => {
  return tabs.some(tab => tab.key === key);
};

// 生成唯一的tab key
const genTabKey = (prefix, tabs) => {
  const defKey = `${prefix}_${tabs.length}`;
  let key = defKey;
  for (let i = 1; isTabExist(tabs, key); i++) {
    key = `${defKey}_${i}`;
  }
  return key;
};

const setOptions = (key, controls, options) => {
  const item = controls.find(control => control.key === key);
  item && (item.options = options);
};

const showError = (msg) => {
  message.error(msg);
};

const showSuccessMsg = (msg) => {
  message.success(msg);
};

const formatTime = (val) => {
  if(!val) return '';
  const date = new Date(val);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const format = (value='') => {
    return value.toString().length > 1 ? value : "0" + value;
  };
  return year +'-'+ format(month) +'-'+ format(day);
};

// 下载文件
const download = (url, name) => {
  if (url.substr(0, 4) === 'http') {
    window.open(url);
  } else {
    const node = document.createElement('a');
    node.href = url;
    node.download = name;
    node.target = '_blank';
    if (node.getAttribute('download')) {
      document.body.appendChild(node);
      node.click();
      document.body.removeChild(node);
    } else {
      window.open(url);
    }
  }
};

// 获取当前登录的用户名
const getUsername = () => {
  const username = 'username=';
  const cookie = document.cookie;
  const begin = cookie.indexOf(username) + username.length;
  const end = cookie.indexOf(';', begin);
  return unescape(cookie.substring(begin, end < 0 ? cookie.length : end));
};

const helper = {
  postOption,
  fetchJson,
  fetchSelect,
  fuzzySearch,
  fuzzySearchEx,
  getObject,
  getObjectExclude,
  isEmpty,
  isEmpty2,
  validValue,
  validArray,
  findOnlyCheckedIndex,
  findOnlyCheckedItem,
  convert,
  showError,
  showSuccessMsg,
  isTabExist,
  genTabKey,
  getJsonResult,
  fetchJsonByNode,
  setOptions,
  formatTime,
  download,
  getUsername
};

export default helper;
