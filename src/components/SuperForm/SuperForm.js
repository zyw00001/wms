import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import helper from '../../common/common';
import Control, {getTitle, makeString} from '../Control';
import {Icon, Form, Row, Col,Checkbox} from 'antd';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './SuperForm.less';

const FormItem = Form.Item;
const defaultSize = 'default';
const defaultColNum = 4;

const TYPE = [
  'readonly',
  'text',
  'search',
  'select',
  'radioGroup',
  'number',
  'date',
  'textArea',
  'password'
];

/**
 * key：[必须]，用于唯一标识该Form下的一个表单元素
 * title：[必须]，表单元素的标签
 * type：[必须]，表单元素类型
 * required: [可选]，是否为必填项
 * options: [可选]，对象数组(type为readonly，radio，search，select时有效)
 * span: [可选]，占据的列数，默认为1
 * showAdd: [可选]，是否显示+号，点击+号会触发onAdd事件，默认为false
 * rule: [可选]，用于设置校验规则
 */
const ControlType = {
  key: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.oneOf(TYPE).isRequired,
  required: PropTypes.bool,
  options: PropTypes.array,
  span: PropTypes.number,
  onCheckItem: PropTypes.any,
  showAdd: PropTypes.any,
  rule: PropTypes.object,
  props: PropTypes.object
};

class Controlled extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: props.value};
  }

  componentWillReceiveProps(nextProps) {
    if (this.props['data-isSpecialValue']) return;
    if (this.state.value !== nextProps.value) {
      this.setState({value: nextProps.value});
    }
  }

  onChange = (value) => {
    const {onChange} = this.props;
    this.setState({value});
    onChange && onChange(value);
  };

  render() {
    const props = {
      ...this.props,
      value: this.state.value,
      onChange: this.onChange
    };
    return <Control {...props} />;
  }
}

/**
 * colNum：[可选]，表单的列数，默认为4
 * readonly: [可选]，为true时，所有表单元素都是只读的; 为字符串数组时，用于指定key的表单元素是只读的
 * hideControls: [可选]，指定key的表单元素被隐藏
 * options: [可选]，键值对，值与ControlType中options作用相同，但优先级更高
 * onChange：内容改变时触发，原型为func(key, value)
 * onSearch：搜索框中用户输入时触发，原型为func(key, title, control)
 * onAdd: 点击+号时触发，原型为func(key)
 * checkable:是否显示checkbox选择框
 */
class SuperForm extends React.Component {
  static propTypes = {
    controls: PropTypes.arrayOf(PropTypes.shape(ControlType)).isRequired,
    value: PropTypes.object,
    colNum: PropTypes.number,
    valid: PropTypes.bool,
    readonly: PropTypes.oneOfType([PropTypes.bool, PropTypes.array]),
    hideControls: PropTypes.array,
    options: PropTypes.object,
    onChange: PropTypes.func,
    onSearch: PropTypes.func,
    onExitValid: PropTypes.func,
    onAdd: PropTypes.func,
    checkable: PropTypes.bool
  };

  onAdd = (key) => {
    const {onAdd} = this.props;
    onAdd && onAdd(key);
  };

  onChange = (key, value) => {
    const {onChange} = this.props;
    if (onChange) {
      this.onExitValid(key);
      onChange(key, value);
    }
  };

  onBlur = (key, value) => {
    const {onChange} = this.props;
    if (onChange) {
      this.onExitValid(key);
      onChange(key, value);
    }
  };

  onExitValid = (key,value) => {
    if (key === this.validKey) {
      this.validKey = '';
      this.props.onExitValid();
    }
    this.props.onChangeOperate && this.props.onChangeOperate(key,value);
  };

  // 动态生成getValidState方法
  initValidState = () => {
    const {value, valid} = this.props;
    const invalid = () => null;
    const _valid = ({key, required}) => {
      if (required) {
        if (!value || helper.isEmpty2(value[key]) || ( !Array.isArray(value[key]) && typeof value[key] === 'object' && helper.isEmpty(value[key].value))) {
          this.getValidState = invalid;
          this.validKey = key;
          return 'error';
        }
      }
      return null;
    };
    this.getValidState = valid ? _valid : invalid;
  };

  validDate = ({key, type}) => (date) => {
    const {value={}} = this.props;
    if (!date || !value[key]) {
      return false;
    } else {
      if (type === '>') {
        return date.format('YYYY-MM-DD') <= value[key];
      } else if (type === '<') {
        return date.format('YYYY-MM-DD') >= value[key];
      } else {
        return false;
      }
    }
  };

  getPopupContainer = () => {
    const {container} = this.props;
    if (typeof container === 'undefined') {
      return ReactDOM.findDOMNode(this);
    } else if (typeof container === 'boolean') {
      return document.body;
    } else {
      return ReactDOM.findDOMNode(container);
    }
  };

  getMaxWidth = () => {
    const {colNum=defaultColNum} = this.props;
    return colNum * 250;
  };

  getControls = () => {
    const {hideControls, controls} = this.props;
    if (!hideControls) {
      return controls;
    } else {
      return controls.filter(control => !hideControls.some(key => control.key === key));
    }
  };

  getType = ({key, type}) => {
    const {readonly} = this.props;
    if (!readonly) {
      return type;
    } else if (readonly === true) {
      return 'readonly';
    } else if (Array.isArray(readonly) && readonly.some(readonlyKey => readonlyKey === key)) {
      return 'readonly';
    } else {
      return type;
    }
  };

  specialProps = (type, {key, props={}, type:originType}) => {
    if (type === 'readonly') {
      if (originType === 'textArea') {
        return {
          type: 'textArea',
          readonly: true,
          onBlur: this.onExitValid.bind(this, key)
        }
      } else {
        return {
          onBlur: this.onExitValid.bind(this, key)
        };
      }
    } else if (type === 'text' || type === 'textArea') {
      return {
        ...props,
        onChange: this.onExitValid.bind(this, key),
        onBlur: this.onChange.bind(this, key)
      }
    } else {
      return {
        ...props,
        onChange: this.onBlur.bind(this, key),
        onBlur: this.onExitValid.bind(this, key)
      };
    }
  };

  getControlProps = (control, status) => {
    const {value={}} = this.props;
    const type = this.getType(control);
    const props = this.specialProps(type, control);
    return {
      type, ...props,
      size: defaultSize,
      autoFocus: !!status,
      value: makeString(value[control.key]),
    };
  };

  getOptions = (key, options) => {
    const higher = this.props.options || {};
    return higher[key] || options;
  };

  toText = (props) => {
    return <Controlled {...props} />;
  };

  toPassword = (props) => {
    return <Controlled {...props} />;
  };

  toTextArea = (props, control) => {
    const {__isSpecialValue} = this.props;
    if(control.allFullFather){
      props.rows = control.rows;
      props.maxLength = control.maxLength;
      props.style = {
        'resize': 'none'
      };
    }else{
      props.autosize = {minRows: 1, maxRows: 5};
    }
    return <Controlled {...{...props, 'data-isSpecialValue': __isSpecialValue}} />;
  };

  toNumber = (props) => {
    props.defaultValue = props.value;
    delete props.value;
    return <Control {...props} />;
  };

  toSelect = (props, {options, key}) => {
    props.getPopupContainer = this.getPopupContainer;
    props.options = this.getOptions(key, options);
    props.dropdownMatchSelectWidth = false;
    return <Control {...props} />;
  };

  createSearchEvent = (control) => {
    if (this.props.onSearch) {
      return value => this.props.onSearch(control.key, value, control);
    } else {
      return null;
    }
  };

  toSearch = (props, control) => {
    props.getPopupContainer = this.getPopupContainer;
    props.options = this.getOptions(control.key, control.options);
    props.onSearch = this.createSearchEvent(control);
    props.dropdownMatchSelectWidth = false;
    return <Control {...props} />;
  };

  toDate = (props, {rule}) => {
    props.getCalendarContainer = this.getPopupContainer;
    props.style = {width: '100%'};
    rule && (props.disabledDate = this.validDate(rule));
    return <Control {...props} />;
  };

  toRadioGroup = (props, {key, options}) => {
    props.options = this.getOptions(key, options);
    return <Control {...props} />;
  };

  toReadonly = (props, {options, key}) => {
    props.value = getTitle(props.value, this.getOptions(key, options));
    return <Control {...props} />;
  };

  toControl = (props, control) => {
    switch (props.type) {
      case 'readonly':
        return this.toReadonly(props, control);
      case 'text':
        return this.toText(props, control);
      case 'number':
        return this.toNumber(props, control);
      case 'select':
        return this.toSelect(props, control);
      case 'search':
        return this.toSearch(props, control);
      case 'date':
        return this.toDate(props, control);
      case 'radioGroup':
        return this.toRadioGroup(props, control);
      case 'textArea':
        return this.toTextArea(props, control);
      case 'password':
        return this.toPassword(props, control);
      default:
        return 'type error';
    }
  };

  toLabel = ({title, showAdd, key}, type) => {
    if (showAdd && (type !== 'readonly')) {
      const onClick = this.onAdd.bind(this, key);
      return <span>{title}<Icon role='add' type='plus-circle-o' onClick={onClick}/></span>;
    } else {
      return title;
    }
  };

  toCol = (span, control) => {
    const factor = control.span || 1;
    const status = this.getValidState(control);
    const controlProps = this.getControlProps(control, status);
    const itemProps = {
      label: this.toLabel(control, controlProps.type),
      required: control.required,
      validateStatus: status
    };
    const {checkable,onCheckItem} = this.props;
    return (
      <Col span={span * factor} key={control.key}>
        {checkable && <Checkbox className={s.checkbox} onChange={onCheckItem.bind(this,control)} checked={control.checked} />}
        <FormItem {...itemProps} className={checkable ? s.formItemWithCheckbox : ''}>
          {this.toControl(controlProps, control)}
        </FormItem>
      </Col>
    );
  };

  toCols = () => {
    let {colNum=defaultColNum,allFullFather} = this.props;
    if(allFullFather){
      colNum = 1;
    }
    const span = 24 / colNum;
    return this.getControls().map(control => {
      if(allFullFather){
        control.allFullFather = allFullFather;
      }
      return this.toCol(span, control)
    });
  };

  render() {
    this.initValidState();
    return (
      <div className={s.root}>
        <Form layout='vertical' style={{maxWidth: this.props.allFullFather ? '100%' : this.getMaxWidth()}}>
          <Row gutter={20}>
            {this.toCols()}
          </Row>
        </Form>
      </div>
    );
  }
}

export default withStyles(s)(SuperForm);
