import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {Button, Form, Row, Col, Icon} from 'antd';
import Control, {getTitle, makeString} from '../Control';
import s from './Search.less';

const FormItem = Form.Item;
const defaultSize = 'default';
const defaultColNum = 4;

const TYPE = [
  'text',
  'search',
  'select',
  'number',
  'date',
  'readonly'
];

/**
 * search: 搜索按钮的标题
 * more：更多按钮的标题
 * reset：重置按钮的标题
 * sort：排序按钮的标题
 */
const ConfigType = {
  search: PropTypes.string.isRequired,
  reset: PropTypes.string.isRequired,
  sort: PropTypes.string,
  more: PropTypes.string
};

/**
 * key: 唯一标识一个表单元素
 * title：表单元素旁边的标题
 * type：表单元素的类型
 * props：传递给表单元素的额外属性
 */
const FilterType = {
  key: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.oneOf(TYPE).isRequired,
  options: PropTypes.array,
  props: PropTypes.object
};

/**
 * data：传递给filters的默认值，为key:value的形式，此处的key为FilterType中的key
 * isSort：是否需要排序按钮，默认false，当设置为true时，onClick函数需要实现key为sort的响应函数
 * onClick：按钮点击事件，原型为func(key)
 * onChange：表单控件内容改变时触发，原型为func(key, value)
 * onSearch：search控件发出的事件，原型为func(key, value)
 */
class Search extends React.Component {
  static propTypes = {
    config: PropTypes.shape(ConfigType).isRequired,
    filters: PropTypes.arrayOf(PropTypes.shape(FilterType)).isRequired,
    data: PropTypes.object,
    isSort: PropTypes.bool,
    getContainer: PropTypes.func,
    onClick: PropTypes.func,
    onChange: PropTypes.func,
    onSearch: PropTypes.func,
    onHeightChange: PropTypes.func
  };

  state = {more: false};

  onClick = (key) => {
    const {onClick} = this.props;
    onClick && onClick(key);
  };

  onMore = () => {
    const {onHeightChange} = this.props;
    this.setState({more: !this.state.more});
    onHeightChange && onHeightChange(this.calHeight(!this.state.more));
  };

  onChange = (key, value) => {
    const {onChange} = this.props;
    onChange && onChange(key, value);
  };

  onPressEnter = () => {
    ReactDOM.findDOMNode(this.refs.search).click();
  };

  toButton = (key, props={}) => {
    const {config} = this.props;
    const onClick = this.onClick.bind(this, key);
    return <Button size={defaultSize} onClick={onClick} {...props}>{config[key]}</Button>;
  };

  toMore = () => {
    return (
      <a role='more' onClick={this.onMore}>
        {this.props.config.more}
        <Icon type='down' data-status={!this.state.more ? 'down' : 'up'} />
      </a>
    );
  };

  toButtons = () => {
    return (
      <div role='buttons'>
        {this.toButton('search', {ref: 'search', type: 'primary'})}
        {this.toButton('reset')}
        {this.isSort() ? this.toButton('sort') : null}
        {this.isMore() ? this.toMore() : null}
      </div>
    );
  };

  isSort = () => {
    const {config, colNum=defaultColNum, filters, isSort=false} = this.props;
    return isSort && config.sort && (filters.length > colNum);
  };

  isMore = () => {
    const {config, colNum=defaultColNum, filters} = this.props;
    return config.more && (filters.length > colNum);
  };

  getOptions = (filter) => {
    return filter.options || filter.typeRelated || [];
  };

  getContainer = () => {
    return this.props.getContainer;
  };

  getControlProps = (control) => {
    const {data={}} = this.props;
    return {
      ...(control.props || {}),
      size: defaultSize,
      type: control.type,
      value: makeString(data[control.key]),
      onChange: this.onChange.bind(this, control.key)
    };
  };

  toText = (props) => {
    props.onPressEnter = this.onPressEnter;
    return <Control {...props} />;
  };

  toNumber = (props) => {
    props.defaultValue = props.value;
    delete props.value;
    return <Control {...props} />;
  };

  toSelect = (props, filter) => {
    const container = this.getContainer();
    container && (props.getPopupContainer = container);
    props.options = this.getOptions(filter);
    props.dropdownMatchSelectWidth = false;
    return <Control {...props} />;
  };

  createSearchEvent = (filter) => {
    if (this.props.onSearch) {
      return value => this.props.onSearch(filter.key, value, filter);
    } else {
      return null;
    }
  };

  toSearch = (props, filter) => {
    const container = this.getContainer();
    container && (props.getPopupContainer = container);
    props.options = this.getOptions(filter);
    props.onSearch = this.createSearchEvent(filter);
    props.dropdownMatchSelectWidth = false;
    return <Control {...props} />;
  };

  toDate = (props) => {
    const container = this.getContainer();
    container && (props.getCalendarContainer = container);
    props.style = {width: '100%'};
    return <Control {...props} />;
  };

  toReadonly = (props, filter) => {
    props.value = getTitle(props.value, this.getOptions(filter));
    return <Control {...props} />;
  };

  toControl = (control) => {
    const props = this.getControlProps(control);
    switch (control.type) {
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
      case 'readonly':
        return this.toReadonly(props, control);
      default:
        return 'type error';
    }
  };

  toCol = (span, control) => {
    const factor = control.span || 1;
    const title = <span>{control.title}</span>;
    return (
      <Col span={span * factor} key={control.key}>
        <FormItem label={title}>
          {this.toControl(control)}
        </FormItem>
      </Col>
    );
  };

  toCols = () => {
    const {colNum=defaultColNum, filters} = this.props;
    const span = 24 / Math.min(colNum, filters.length);
    return filters.map(control => this.toCol(span, control));
  };

  calWidth = () => {
    const {colNum=defaultColNum, filters} = this.props;
    if (filters.length < colNum) {
      return `${filters.length * 18}%`;
    } else {
      return `${defaultColNum * 18}%`;
    }
  };

  calHeight = (more) => {
    const {colNum=defaultColNum, filters} = this.props;
    if (more) {
      const row = Math.ceil(filters.length / colNum);
      return row * 57 + 10;
    } else {
      return 67;
    }
  };

  render() {
    return (
      <div className={s.root} style={{height: this.calHeight(this.state.more)}}>
        <Form layout='vertical' style={{width: this.calWidth()}}>
          <Row gutter={20}>
            {this.toCols()}
          </Row>
        </Form>
        {this.toButtons()}
      </div>
    );
  }
}

export default withStyles(s)(Search);
