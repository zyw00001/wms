import React, { PropTypes } from 'react';
import {Pagination} from 'antd';

/**
 * maxRecords: 最大记录数
 * currentPage：当前页码
 * pageSize：页面大小
 * align: 分页组件的对齐方式，默认居右
 * pageSizeType: 字符串数组，页面大小规格
 * description：字符串描述，类似'共有{maxRecords}条记录'
 * onPageChange：跳转到新的一页时触发，原型func(pageNumber)
 * onPageSizeChange: 页大小改变时触发，原型func(pageSize, pageNumber)
 */
class SuperPagination extends React.Component {
  static propTypes = {
    maxRecords: PropTypes.number,
    currentPage: PropTypes.number,
    pageSize:  PropTypes.number,
    align: PropTypes.oneOf(['left', 'right', 'center']),
    pageSizeType: PropTypes.array,
    description: PropTypes.string,
    style: PropTypes.object,
    onPageNumberChange: PropTypes.func,
    onPageSizeChange: PropTypes.func
  };

  onChange = (page) => {
    const {callback = {}} = this.props;
    const onPageNumberChange = this.props.onPageNumberChange || callback.onPageNumberChange;
    onPageNumberChange && onPageNumberChange(page);
  };

  onShowSizeChange = (current, size) => {
    const {callback = {}} = this.props;
    const onPageSizeChange = this.props.onPageSizeChange || callback.onPageSizeChange;
    onPageSizeChange && onPageSizeChange(size, current || 1);
  };

  render() {
    const {currentPage, maxRecords, pageSize, pageSizeType, align, description, page={}, option={}, style={}} = this.props;
    const desp = description || (this.props.config || {}).pageDesp || '';
    const props = {
      current: currentPage || page.currentPage,
      total: maxRecords || page.maxRecords,
      pageSize: pageSize || page.pageSize,
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: pageSizeType || option.pageSizeType || [],
      onChange: this.onChange,
      onShowSizeChange: this.onShowSizeChange,
      showTotal: (total) => desp.replace('{maxRecords}', total),
      style: Object.assign({}, style, {
        display: 'inline-block',
        textAlign: 'left',
        verticalAlign: 'top'
      })
    };
    return <div style={{textAlign: align || 'right'}}><Pagination {...props} /></div>;
  }
}

export default SuperPagination;
