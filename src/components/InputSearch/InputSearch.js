import React, { PropTypes } from 'react';
import {Select} from 'antd';
import {getObjectExclude} from '../../common/common';
import {makeString} from '../Control';
const SelectOption = Select.Option;

/**
 * searchWhenClick: 每次点击时，触发onSearch事件，默认为false
 * noSearchWhenTypo: 当输入时，不触发onSearch事件，默认为false
 */
const PROPS = {
  searchWhenClick: PropTypes.bool,
  noSearchWhenTypo: PropTypes.bool,
  options: PropTypes.array,
  value: PropTypes.any,
  defaultValue: PropTypes.any,
  inputRef: PropTypes.func,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onSelect: PropTypes.func,
  onSearch: PropTypes.func
};

const PROPS_KEYS = Object.keys(PROPS);

class InputSearch extends React.Component {
  static propTypes = PROPS;

  onSearch = (value) => {
    const {onSearch, noSearchWhenTypo} = this.props;
    !noSearchWhenTypo && onSearch && onSearch(value);
    this.title = value;
    this.change = true;
  };

  onBlur = () => {
    const {options = [], onChange, onBlur} = this.props;
    const index = options.findIndex(option => option.title === this.title);
    const value = index === -1 ? '' : options[index];
    this.title = undefined;
    this.change && onChange && onChange(value);
    onBlur && onBlur(this.change ? value : this.props.value);
    this.change = false;
  };

  onSelect = (value, option) => {
    const {onChange, options = []} = this.props;
    const index = options.findIndex(option => option.value === value);
    const objValue = index === -1 ? {value, title: option.props.children} : options[index];
    this.change = false;
    this.title = undefined;
    onChange && onChange(objValue);
  };

  onClick = (e) => {
    const {options=[], onSearch, searchWhenClick, value} = this.props;
    if (onSearch && (!options.length || (!value && searchWhenClick))) {
      onSearch(e.target.value);
    }
  };

  getValue = () => {
    const {value} = this.props;
    if (typeof this.title !== 'undefined') {
      return this.title;
    } else if (typeof value === 'object') {
      return !value ? '' : value.title;
    } else {
      return value;
    }
  };

  isMatch = (inputValue, option) => {
    return option.props.children.indexOf(inputValue) !== -1;
  };

  toOption = (option, index) => {
    return <SelectOption key={index} value={String(option.value)}>{option.title}</SelectOption>;
  };

  render() {
    const otherProps = getObjectExclude(this.props, PROPS_KEYS);
    const {options = [], inputRef} = this.props;
    const props = {
      ...otherProps,
      value: makeString(this.getValue()),
      mode: 'combobox',
      optionLabelProp: 'children',
      allowClear: true,
      ref: inputRef,
      filterOption: this.isMatch,
      onSearch: this.onSearch,
      onSelect: this.onSelect,
      onBlur: this.onBlur
    };
    return (
      <div onClick={this.onClick}>
        <Select {...props}>
          {options.map(this.toOption)}
        </Select>
      </div>
    );
  }
}

export default InputSearch;
