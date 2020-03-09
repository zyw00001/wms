import React, { PropTypes } from 'react';
import {Input} from 'antd';
import {getObjectExclude} from '../../common/common';

/**
 * real: true表示带小数点，默认为false
 * sign: true表示带正负号，默认为false
 * precision: real为true时，小数的精度；否则无效
 * zero：true表示可以输入0，默认为false
 */
const PROPS = {
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  real: PropTypes.bool,
  sign: PropTypes.bool,
  precision: PropTypes.any,
  zero: PropTypes.bool,
  inputRef: PropTypes.func,
  onChange: PropTypes.func,
  onBlur: PropTypes.func
};

const PROPS_KEYS = Object.keys(PROPS);

class NumberInput extends React.Component {
  static propTypes = PROPS;

  constructor(props) {
    super(props);
    this.initState(props);
  }

  componentWillReceiveProps(nextProps) {
    this.initState(nextProps);
    this.setState(this.state);
  }

  initState = (props) => {
    if (this.isFit(String(props.defaultValue))) {
      this.state = { value: String(props.defaultValue) };
    } else {
      this.state = { value: '' };
    }
    this.defaultValue = this.state.value;
  };

  isSpecialChar = (value) => {
    const {sign, real} = this.props;
    let chars = ['+'];
    !sign && chars.push('-');
    !real && chars.push('.');
    for(const ch of value) {
      if (chars.some(c => c === ch)) {
        return true;
      }
    }
  };

  onChange = (event) => {
    const value = event.target.value;
    if (!this.isSpecialChar(value)) {
      this.change = true;
      this.setState({value});
    }
  };

  format = (value) => {
    if (value.indexOf('.') >= 0) {
      value = value.replace(/(^(\s|0)*)|((\s|0)*$)/g, '');
      value = value.replace(/\.*$/g, '');
      if (value && value[0] === '.') {
        value = '0' + value;
      }
    } else {
      value = value.replace(/(^(\s|0)*)|(\s*$)/g, '');
    }
    return value || (this.props.zero ? '0' : '');
  };

  getValue = () => {
    const value = this.state.value;
    if (!value || (value === '.')) {
      return value;
    }

    if (this.isFit(value)) {
      const {real, precision} = this.props;
      if (real && precision) {
        return this.format(String(Number(value).toFixed(Number(precision))));
      } else {
        return this.format(value);
      }
    } else {
      return this.defaultValue;
    }
  };

  onBlur = (event) => {
    const {onBlur, onChange} = this.props;
    if (this.change) {
      const value = this.getValue();
      this.change = false;
      this.setState({value});
      onChange && onChange(value);
    }
    onBlur && onBlur(event);
  };

  isFit = str => {
    const {sign = false, real = false} = this.props;
    return real ? this.isRealNumber(str, sign) : this.isInteger(str, sign);
  };

  isInteger = (str, sign) => {
    return str.match(sign ? /^(\+|-)?\d*$/ : /^\d*$/);
  };

  isRealNumber = (str, sign) => {
    return str.match(sign ? /^(\+|-)?\d*(\.)?\d*$/ : /^\d*(\.)?\d*$/);
  };

  getProps = () => {
    const props = getObjectExclude(this.props, PROPS_KEYS);
    return {
      ...props,
      ref: this.props.inputRef || null,
      type: 'text',
      value: this.state.value,
      onChange: this.onChange,
      onBlur: this.onBlur,
      onCompositionStart: this.onCompositionStart,
      onCompositionEnd: this.onCompositionEnd
    };
  };

  render() {
    return <Input {...this.getProps()} />;
  }
}

export default NumberInput;
