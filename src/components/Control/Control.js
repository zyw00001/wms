import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import {Input, Select, DatePicker, Radio} from 'antd';
import InputSearch from '../InputSearch';
import NumberInput from '../NumberInput';
import moment from 'moment';
import eventWrapper from './event';
const SelectOption = Select.Option;
const TextArea = Input.TextArea;
const RadioGroup = Radio.Group;

moment.locale('zh-cn');

// 设置组件焦点
const setFocus = (element, type) => {
  if (element) {
    if (element.focus) {
      element.focus();
    } else if (type === 'select') {
      ReactDOM.findDOMNode(element).firstChild.focus();
    } else if (type === 'search' || type === 'date') {
      ReactDOM.findDOMNode(element).getElementsByTagName('input')[0].focus();
    }
  }
};

const toOption = ({value, title}, index) => {
  return <SelectOption key={index} value={String(value)}>{title}</SelectOption>;
};

const toRadio = ({value, title}, index) => {
  return <Radio key={index} value={String(value)}>{title}</Radio>;
};

// 文本输入框
const text = (props) => {
  if (props.value || props.defaultValue) {
    props.title = props.value || props.defaultValue;
  }
  return <Input {...props} />;
};

// 密码输入框
const password = (props) => {
  props.type = 'password';
  return <Input {...props} />;
};

// 多行文本输入框
const textArea = (props) => {
  if (props.readonly) {
    delete props.readonly;
    props.readOnly = true;
    props.style = Object.assign(props.style || {}, {backgroundColor: '#f5f7fa'});
  }
  return <TextArea {...props} />;
};

// 只读框
const readonly = (props) => {
  props.readOnly = true;
  props.style = Object.assign(props.style || {}, {backgroundColor: '#f5f7fa'});
  if (props.value || props.defaultValue) {
    props.title = props.value || props.defaultValue;
  }
  return <Input {...props}/>;
};

// 数字输入框
const number = (props) => {
  if (props.ref) {
    props.inputRef = props.ref;
    delete props.ref;
  }
  return <NumberInput {...props} />;
};

const isMatch = (inputValue, option) => {
  return option.props.children.indexOf(inputValue) !== -1;
};

// 下拉选择框
const select = (props) => {
  const options = props.options || [];
  delete props.options;
  props.showSearch = true;
  props.filterOption = isMatch;
  (props.allowClear !== false) && (props.allowClear = true);
  if (props.mode === 'multiple' || props.mode === 'tags') {
    !props.value && typeof props.value !== 'undefined' && (props.value = []);
    !props.defaultValue && typeof props.defaultValue !== 'undefined' && (props.defaultValue = []);
  }else {
    props.value && typeof props.value === 'object' && (props.value = JSON.stringify(props.value));
    props.defaultValue && typeof props.defaultValue === 'object' && (props.defaultValue = JSON.stringify(props.defaultValue));
  }
  return <Select {...props}>{options.map(toOption)}</Select>;
};

// 搜索框
const search = (props) => {
  if (props.ref) {
    props.inputRef = props.ref;
    delete props.ref;
  }
  return <InputSearch {...props} />;
};

// 日期选择框
const date = (props) => {
  const origin = props.onChange;
  if (typeof props.value !== 'undefined') {
    props.value = !props.value ? undefined : moment(props.value);
  }
  if (typeof props.defaultValue !== 'undefined') {
    props.defaultValue = !props.defaultValue ? undefined : moment(props.defaultValue);
  }
  if (props.showTime) {
    props.format = 'YYYY-MM-DD HH:mm:ss';
    props.placeholder = '请选择时间';
    if (typeof props.showTime === 'boolean') {
      props.showTime = '00:00:00';
    }
    if (props.showTime !== 'current') {
      props.showTime = {defaultValue: moment(props.showTime, 'HH:mm:ss')};
    } else {
      props.showTime = true;
    }
  }
  if (props.onChange) {
    props.onChange = (date, str) => origin(str)
  }
  return <div onBlur={props.onBlur}><DatePicker {...props} /></div>;
};

// 单选按钮组
const radioGroup = ({options = [], ...props}) => {
  const origin = props.onChange;
  props.style = {borderSpacing: 0};
  typeof props.value === 'number' && (props.value = String(props.value));
  typeof props.defaultValue === 'number' && (props.defaultValue = String(props.defaultValue));
  if (props.onChange) {
    props.onChange = (e) => origin(e.target.value);
  }
  return <RadioGroup {...props}>{options.map(toRadio)}</RadioGroup>;
};

// 支持的控件类型
const controls = {
  text, textArea, readonly, number, select, search, date, radioGroup,password
};

const Control = ({type, autoFocus, ...props}) => {
  const ref = autoFocus ? e => setFocus(e, type) : null;
  return controls[type](Object.assign(eventWrapper(props), {ref}));
};

Control.propTypes = {
  type: PropTypes.string.isRequired,
  autoFocus: PropTypes.bool,
  onChange: PropTypes.func,
  onSearch: PropTypes.func,
  onBlur: PropTypes.func
};

// 依据value查找对应的标题
const getTitle = (value, options = []) => {
  if (typeof value === 'undefined') {
    return '';
  } else if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return value;
    } else {
      return value ? value.title : '';
    }
  } else {
    const index = options.findIndex(obj => obj.value == value);
    return index === -1 ? value : options[index].title;
  }
};

// 确保value的值为字符串(包含value和title的对象除外)
const makeString = (value) => {
  if (value === null || typeof value === 'undefined') {
    return '';
  } else if (typeof value === 'number') {
    return String(value);
  } else {
    return value;
  }
};

export default Control;
export {getTitle, makeString};
