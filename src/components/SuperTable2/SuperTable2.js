import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {getTitle} from '../Control';
import {Table, Checkbox, Button, Icon, Switch} from 'antd';
import SuperTableCell from './SuperTableCell';
import fixed from '../SuperTable/fixed';
import s from './SuperTable2.less';

const TypeEnum = [
  'readonly',
  'index',
  'checkbox',
  'text',
  'number',
  'select',
  'search',
  'date',
  'button',
  'custom',
  'switch',
  'selectSearch',
  'selectWriting',
  'select2'
];

/**
 * key：标识所在列，在一个表格中必须唯一
 * title：列的标题，type为checkbox时，title为空字符串时，表头才会显示为复选框
 * type：嵌入的表单元素类型
 * link: 是否为超链接，type未设置时，该属性才生效。为true表示内容来至items，为字符串表示超链接内容就是该字符串
 * options: 对象(包含value和title)数组
 * props：传递参数给被嵌入的组件
 * width: 嵌入的组件的宽度，默认值为100
 * align：对齐方式，index默认center，其他类型默认为left
 * showAdd: 表头是否显示+号，默认为false，加号会触发onAdd事件
 * hide: 为true时隐藏该列
 */
const ColType = {
  key: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.oneOf(TypeEnum),
  link: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  align: PropTypes.oneOf(['left', 'center', 'right']),
  width: PropTypes.number,
  options: PropTypes.array,
  showAdd: PropTypes.any,
  hide: PropTypes.bool,
  props: PropTypes.any
};

/**
 * onCheck：点击复选框时触发，原型func(rowIndex, keyName, checked)
 * onContentChange: 输入框内容改变时触发，原型为function(rowIndex, keyName, value)
 * onSearch：search组件输入内容时触发，原型为function(rowIndex, keyName, value)
 * onLink: 点击超链接时触发，原型为function(keyName, rowIndex, item)
 * onAdd：点击+号时触发，原型为function(keyName)
 * onRenderCustom：(废弃)用于渲染type为custom类型的单元格，原型为function(rowIndex, keyName, value，props)
 */
const CallbackType = {
  onExitValid: PropTypes.func,
  onCheck: PropTypes.func,
  onContentChange: PropTypes.func,
  onSearch: PropTypes.func,
  onLink: PropTypes.func,
  onAdd: PropTypes.func,
  onRenderCustom: PropTypes.func
};

class SuperTable2 extends React.Component {
  static propTypes = {
    cols: PropTypes.arrayOf(PropTypes.shape(ColType)).isRequired,
    items: PropTypes.array.isRequired,
    options: PropTypes.object,
    valid: PropTypes.bool,
    readonly: PropTypes.bool,
    style: PropTypes.object,
    maxHeight: PropTypes.string,
    emptyText: PropTypes.string,
    footer: PropTypes.func,
    callback: PropTypes.shape(CallbackType)
  };

  onSwitch = (key, rowIndex) => (value) => {
    const {onContentChange} = this.props.callback || {};
    onContentChange && onContentChange(rowIndex, key, value);
  };

  onCheck = (key, rowIndex) => (e) => {
    const {onCheck} = this.props.callback || {};
    onCheck && onCheck(rowIndex, key, e.target.checked);
  };

  onChange = (key, rowIndex) => (value) => {
    const {onContentChange} = this.props.callback || {};
    this.closeValid();
    onContentChange && onContentChange(rowIndex, key, value);
  };

  onSearch = (key, rowIndex) => (value) => {
    const {onSearch} = this.props.callback || {};
    onSearch && onSearch(rowIndex, key, value);
  };

  onAdd = (key) => () => {
    const {onAdd} = this.props.callback || {};
    onAdd && onAdd(key);
  };

  onBlur = () => {
    this.closeValid();
  };

  closeValid = () => {
    const {valid, callback={}} = this.props;
    valid && callback.onExitValid();
  };

  getOptions = (key, colOptions, index) => {
    const {options} = this.props.items[index];
    const {options: options2} = this.props;
    if (options && Array.isArray(options[key])) {
      return options[key];
    } else if (options2 && Array.isArray(options2[key])) {
      return options2[key];
    } else {
      return colOptions;
    }
  };

  validField = (required, value) => {
    if (!this.props.valid || this.error || !required || value) {
      return false;
    } else if (typeof value === 'number') {
      return false;
    } else {
      this.error = true;
      return true;
    }
  };

  renderEditableCell = ({key, type, options, props, required, width}, value, index) => {
    const {readonly, isReadonly=[], isRequired=[], _extraProps={}} = this.props.items[index];
    const cellProps = {
      value, width,
      type: readonly || (Array.isArray(isReadonly) && isReadonly.includes(key)) ? 'readonly' : type,
      props: readonly ? {} : props,
      error: this.validField(required, value),
      options: this.getOptions(key, options, index),
      onChange: this.onChange(key, index),
      onSearch: this.onSearch(key, index),
      onBlur: this.onBlur
    };
    if(Array.isArray(isRequired) && isRequired.includes(key)){
      cellProps.error = this.validField(true, value);
      cellProps.props = {...cellProps.props, ..._extraProps};
      return (<div>
        <span style={{color: 'red', display: 'inline-block'}}>*</span>
        <span style={{marginLeft: '5px', display: 'inline-block'}}><SuperTableCell {...cellProps} /></span>
      </div>);
    }
    return <SuperTableCell {...cellProps} />;
  };

  renderLinkCell = (col, value, record, index) => {
    const title = typeof col.link === 'string' ? col.link : value;
    const onClick = () => {
      const {onLink} = this.props.callback || {};
      onLink && onLink(col.key, index, record);
    };
    return <a onClick={onClick}>{title}</a>;
  };

  getCellRender = (col) => (value, record, index) => {
    switch (col.type) {
      case 'checkbox':
        return <Checkbox onChange={this.onCheck(col.key, index)} checked={value || false}/>;
      case 'index':
        return index + 1;
      case 'link':
        return this.renderLinkCell(col, value, record, index);
      case 'button':
        // const onClick = this.props.callback.onBtnClick.bind(null, index, col.key);
        const onClick = () => {};
        return <Button onClick={onClick} size='default'>{col.typeRelated}</Button>;
      case 'switch':
        return <Switch onChange={this.onSwitch(col.key, index)} size='default' checked={value || false}/>;
      case 'custom':
        return this.props.callback.onRenderCustom(index, col.key, value, col.props);
      default:
        return this.renderEditableCell(col, value, index);
    }
  };

  getCheckedStatus = (key) => {
    let has = false, not = false;
    const {items} = this.props;
    for (const item of items) {
      item[key] ? (has = true) : (not = true);
    }
    return {checked: has && !not, indeterminate: has && not};
  };

  toAdd = (key, showAdd) => {
    if (showAdd) {
      const onClick = this.onAdd(key);
      return <Icon type='plus-circle-o' role='add' onClick={onClick} />;
    } else {
      return null;
    }
  };

  getColumnTitle = ({required, title, type, key, showAdd}) => {
    if (type === 'checkbox') {
      const status = this.getCheckedStatus(key);
      return <Checkbox onChange={this.onCheck(key, -1)} {...status} />;
    } else {
      const className = required ? 'ant-form-item-required' : '';
      return (
        <span className={className}>
          {title}
          {this.toAdd(key, showAdd)}
        </span>
      );
    }
  };

  getColumnClassName = ({type, align}) => {
    if (type === 'index' || type === 'checkbox') {
      return 'ant-table-selection-column';
    } else {
      return align ? s[align] : '';
    }
  };

  canReadonly = (type) => {
    if (type) {
      return !['index', 'checkbox', 'link', 'button', 'switch', 'custom'].includes(type);
    } else {
      return false;
    }
  };

  getColumns = (cols) => {
    const readonly = this.props.readonly;
    return cols.filter(col => !col.hide).map(({...col}) => {
      col.className = this.getColumnClassName(col);
      col.title = this.getColumnTitle(col);
      col.dataIndex = col.key;
      if (!readonly || !this.canReadonly(col.type)) {
        if (col.type) {
          col.render = this.getCellRender(col);
        } else if (col.link) {
          col.type = 'link';
          col.render = this.getCellRender(col);
        }
      }
      return col;
    });
  };

  getDataSource = (items, cols) => {
    return items.map((item, index) => {
      return cols.reduce((result, {key, options}) => {
        result[key] = getTitle(item[key], options);
        return result;
      }, {key: index});
    });
  };

  getPropsByCheckbox = () => {
    const {items} = this.props;
    return {rowClassName: (record) => items[record.key].checked ? s.select : ''};
  };

  getProps = () => {
    const {cols, items, style={},footer=null} = this.props;
    return {
      className: s.root,
      columns: this.getColumns(cols),
      dataSource: this.getDataSource(items, cols),
      style: Object.assign({}, {whiteSpace: 'nowrap'}, style),
      size: 'small',
      scroll: {x: true},
      pagination: false,
      footer,
      locale: this.props.emptyText ? {emptyText: this.props.emptyText} : null,
      ...this.getPropsByCheckbox()
    };
  };

  setScroll = () => {
    if (this.props.maxHeight && this.props.items.length) {
      const root = ReactDOM.findDOMNode(this);
      const container = root.getElementsByClassName('ant-table-body')[0];
      const header = root.getElementsByClassName('ant-table-thead')[0];
      fixed(container, header, this.props.maxHeight);
    }
  };

  componentDidMount() {
    this.setScroll();
  }

  componentDidUpdate() {
    this.setScroll();
  }

  render() {
    this.error = false;
    return <Table {...this.getProps()} />;
  }
}

export default withStyles(s)(SuperTable2);
