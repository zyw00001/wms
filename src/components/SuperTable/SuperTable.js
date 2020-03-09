import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {getTitle} from '../Control';
import {Table, Button} from 'antd';
import FilterDropDown from './FilterDropDown';
import fixed from './fixed';
import s from './SuperTable.less';

/**
 * sorter: [可选]，不传表示该列不支持排序；为string表示按字符串排序；为number表示按数字大小排序
 * filter: [可选],是否支持过滤，默认为false
 * link: [可选],为true表示超链接，内容来至items;为字符串表示超链接，内容就是该字符串;为字符串‘list’表示超链接数组，内容就是该items对应key对象数组的linkTitleKey属性拼接
 * linkTitleKey: [可选],当link为'list'表示超链接组时，该值表示要拼接展示的属性key值
 */
const ColType = {
  key: PropTypes.string.isRequired,
  title: PropTypes.string,
  align: PropTypes.oneOf(['left', 'center', 'right']),
  sorter: PropTypes.oneOf(['string', 'number']),
  filter: PropTypes.bool,
  hide: PropTypes.bool,
  options: PropTypes.array,
  link: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  linkTitleKey: PropTypes.string,
  noWrap: PropTypes.bool
};

const ItemType = {
  checked: PropTypes.bool
};

/**
 * onCheck：点击复选框时触发，原型func(isAll, checked, rowIndex);isolation为true时，原型为onCheck(checkedRows)
 * onRadio: 点击单选按钮时触发，原型为func(checkedRows)
 * onDoubleClick: 行双击时触发，原型func(rowIndex)
 * onLink: 点击超链接时触发，原型为func(key, rowIndex, item)
 * onTableChange: 排序信息改变时触发，原型为func(sortInfo, filterInfo)
 */
const CallbackType = {
  onCheck: PropTypes.func,
  onRadio: PropTypes.func,
  onDoubleClick: PropTypes.func,
  onLink: PropTypes.func,
  onTableChange: PropTypes.func,
};

/**
 * checkbox: [可选]，是否有复选框，默认为true
 * isPaging: [可选]，是否分页，默认为false
 * radio: [可选]，是否为单选按钮，当checkbox为true时生效，默认值为false
 * isolation: [可选]，为true时，复选框的选中行采用checkedRows存储
 * checkedRows: [可选]，选中的行数，radio为true时生效
 * index: [可选]，是否有序号，默认值为true
 * indexTitle：[可选]，序号标题，默认为'序号'
 * sortInfo: [可选]，排序信息，默认为null
 * filterInfo: [可选]，过滤信息，默认为null
 * maxHeight: [可选]，设置表格的最大高度
 * emptyText: [可选]，当items为空数组时显示的文本，默认为'暂无数据'
 */
class SuperTable extends React.Component {
  static propTypes = {
    cols: PropTypes.arrayOf(PropTypes.shape(ColType)).isRequired,
    items: PropTypes.arrayOf(PropTypes.shape(ItemType)).isRequired,
    isPaging:PropTypes.bool,
    checkbox: PropTypes.bool,
    radio: PropTypes.bool,
    isolation: PropTypes.bool,
    checkedRows: PropTypes.array,
    index: PropTypes.bool,
    indexTitle: PropTypes.string,
    sortInfo: PropTypes.object,
    filterInfo: PropTypes.object,
    maxHeight: PropTypes.string,
    emptyText: PropTypes.string,
    callback: PropTypes.shape(CallbackType),
    hasUnreadTable: PropTypes.bool
  };

  state = {filterVisibleKey: ''};

  onTableChange = (pagination, filters, sorter) => {
    const {onTableChange} = this.props.callback || {};
    const {filterInfo=null} = this.props;
    onTableChange && onTableChange(sorter, filterInfo);
  };

  onChange = (selectedKeys) => {
    const {onCheck} = this.props.callback || {};
    if (onCheck) {
      if (selectedKeys.length === 0) {
        onCheck(true, false, -1);
      } else if (selectedKeys.length === this.props.items.length) {
        onCheck(true, true, -1);
      } else  {
        const defaultSelectedKeys = this.getSelectedRowKeys(this.props.items);
        if (selectedKeys.length > defaultSelectedKeys.length) {
          onCheck(false, true, selectedKeys[selectedKeys.length - 1]);
        } else {
          const index = defaultSelectedKeys.findIndex(key => !selectedKeys.some(select => select === key));
          onCheck(false, false, defaultSelectedKeys[index]);
        }
      }
    }
  };

  onCheckChange = (selectedKeys) => {
    const {onCheck} = this.props.callback || {};
    onCheck && onCheck(selectedKeys);
  };

  onRadioChange = (selectedKeys) => {
    const {onRadio} = this.props.callback || {};
    onRadio && onRadio(selectedKeys);
  };

  onRadioRowClick = (record) => {
    const {onRadio} = this.props.callback || {};
    onRadio && onRadio([record.key]);
  };

  onRowClick = (record) => {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      const {onCheck} = this.props.callback || {};
      if (onCheck) {
        const {isolation, checkedRows=[]} = this.props;
        if (isolation) {
          if (checkedRows.includes(record.key)) {
            onCheck(checkedRows.filter(key => record.key !== key));
          } else {
            onCheck(checkedRows.concat(record.key));
          }
        } else {
          onCheck(false, !record.checked, record.key);
        }
      }
    }, 250);
  };

  onDoubleClick = (record) => {
    clearTimeout(this.timer);
    const {onDoubleClick} = this.props.callback || {};
    onDoubleClick && onDoubleClick(record.key);
  };

  onLink = (key, index, item, e) => {
    const {onLink} = this.props.callback || {};
    onLink && onLink(key, index, item);
    e.stopPropagation();
  };

  onLinkDouble = (e) => {
    e.stopPropagation();
  };

  getSelectedRowKeys = (items) => {
    return items.reduce((result, item, index) => {
      item.checked && result.push(index);
      return result;
    }, []);
  };

  getIndexInfo = () => {
    const {index=true, indexTitle='序号'} = this.props;
    return index ? [{key: 'index', title: indexTitle, render: (text, record, index) => index + 1}] : [];
  };

  setSortInfo = (col, sortInfo) => {
    if (col.sorter === 'string') {
      col.sortOrder = sortInfo.columnKey === col.key && sortInfo.order;
      col.sorter = (row1, row2) => {
        const a = !col.link ? row1[col.key] : row1[col.key].props.children;
        const b = !col.link ? row2[col.key] : row2[col.key].props.children;
        if (a > b) {
          return 1;
        } else if (a === b) {
          return 0;
        } else {
          return -1;
        }
      };
    } else if (col.sorter === 'number') {
      col.sortOrder = sortInfo.columnKey === col.key && sortInfo.order;
      col.sorter = (a, b) => a[col.key] - b[col.key];
    } else {
      delete col.sorter;
    }
  };

  setFilterInfo = (col, filterInfo, visibleKey) => {
    if (col.filter) {
      const onSearch = (value) => {
        const {onTableChange} = this.props.callback || {};
        const {sortInfo=null} = this.props;
        const newFilterInfo = Object.assign({}, filterInfo, {[col.key]: value});
        this.setState({filterVisibleKey: ''});
        onTableChange && onTableChange(sortInfo, newFilterInfo);
      };
      const value = filterInfo[col.key];
      col.filteredValue = value ? [value] : null;
      col.filterDropdownVisible = visibleKey === col.key;
      col.filterDropdown = <FilterDropDown {...{value, onSearch}} />;
      col.onFilterDropdownVisibleChange = (visible) => {
        this.setState({filterVisibleKey: visible ? col.key : ''});
      };
      col.onFilter = (value, record) => {
        const content = !col.link ? record[col.key] : record[col.key].props.children;
        // return content.includes(value);
        const con = Array.isArray(content) ? content : String(content);
        return con.includes(value);
      }
    }
    delete col.filter;
  };

  linkList = (key, index, item, linkTitleKey='fileName') => {
    const list = item[key] || [];
    return (
      <div>
        {list.map((item2, index2) => {
          const split = index2 === list.length-1 ? '' : ',';
          const onClick = this.onLink.bind(null, key, index, item2);
          return <a key={index2} onClick={onClick} onDoubleClick={this.onLinkDouble}>{`${item2[linkTitleKey]}${split}`}</a>;
        })}
      </div>
    )
  };

  getColumns = (cols) => {
    const {sortInfo, filterInfo, items} = this.props;
    const {filterVisibleKey} = this.state;
    return this.getIndexInfo().concat(cols.filter(col => !col.hide)).map(({...col}) => {
      col.dataIndex = col.key;
      col.className = col.key === 'index' ? 'ant-table-selection-column' : (col.align ? s[col.align] : '');
      col.noWrap && (col.className = s.noWrap);
      this.setSortInfo(col, sortInfo || {});
      this.setFilterInfo(col, filterInfo || {}, filterVisibleKey);
      if (col.link === 'list') {
        col.render = (text, record, index) => this.linkList(col.key, index, items[index], col.linkTitleKey);
      }else if (col.link && (typeof col.link === 'string')) {
        col.render = (text, record, index) => this.link(col.key, index, items[index], col.link);
      }
      return col;
    });
  };

  getText = (value, options) => {
    if (Array.isArray(value)) {
      return value.map(v => getTitle(v, options)).toString();
    } else {
      return getTitle(value, options);
    }
  };

  link = (key, index, item, text) => {
    const onClick = this.onLink.bind(null, key, index, item);
    return <a onClick={onClick} onDoubleClick={this.onLinkDouble}>{text}</a>;
  };

  getDataSource = (items, cols) => {
    return items.map((item, index) => {
      return cols.reduce((result, {key, options, link, icon}) => {
        const onClick = this.onLink.bind(null, key, index, item);
        if (link) {
          if (typeof link === 'boolean') {
            result[key] = this.link(key, index, item, this.getText(item[key], options));
          }
        } else if (icon) { //单独的icon列，icon=true数据值为icon的图标内容，否则icon值为图标内容,没数据时不显示icon
          result[key] = item[key] ? <Button  role="marker" onClick={onClick} icon={icon} style={{border: 'none'}} ghost /> : '';
        } else {
          result[key] = this.getText(item[key], options);
        }
        return result;
      }, {key: index, checked: item.checked});
    });
  };

  getPropsByCheckbox = () => {
    const {checkbox=true, radio=false, isolation, items, checkedRows=[],hasUnreadTable=false} = this.props;
    const rowClassName1 = (record) => checkedRows.includes(record.key) ? s.select : '';
    const rowClassName2 = (record) => {
      if(hasUnreadTable && items[record.key].state === 0){
        return items[record.key].checked ? s.unReadRowSelect : s.unReadRowUnselect
      }
      return items[record.key].checked ? s.select : '';
    };
    if (checkbox) {
      if (radio) {
        return {
          rowClassName: rowClassName1,
          onRowClick: this.onRadioRowClick,
          rowSelection: {
            type: 'radio',
            selectedRowKeys: checkedRows,
            onChange: this.onRadioChange
          }
        }
      } else if (isolation) {
        return {
          rowClassName: rowClassName1,
          onRowClick: this.onRowClick,
          rowSelection: {
            selectedRowKeys: checkedRows,
            onChange: this.onCheckChange
          }
        }
      } else {
        return {
          rowClassName: rowClassName2,
          onRowClick: this.onRowClick,
          rowSelection: {
            selectedRowKeys: this.getSelectedRowKeys(items),
            onChange: this.onChange
          }
        }
      }
    } else {
      return {};
    }
  };

  getProps = () => {
    const {cols, items,isPaging=false,hasUnreadTable,footer = null} = this.props;
    let tableClassName = hasUnreadTable === undefined ? s.root : s.noTransition;
    return {
      className: tableClassName,
      columns: this.getColumns(cols),
      dataSource: this.getDataSource(items, cols),
      size: 'small',
      pagination: isPaging,
      scroll: {x: true},
      onRowDoubleClick: this.onDoubleClick,
      onChange: this.onTableChange,
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

  shouldComponentUpdate(props, state) {
    const keys = ['cols', 'items', 'maxHeight', 'checkedRows', 'sortInfo', 'filterInfo'];
    return keys.some(key => props[key] !== this.props[key]) || state.filterVisibleKey !== this.state.filterVisibleKey;
  }

  componentDidMount() {
    this.setScroll();
  }

  componentDidUpdate() {
    this.setScroll();
  }

  render() {
    return <Table {...this.getProps()} />;
  }
}

export default withStyles(s)(SuperTable);
