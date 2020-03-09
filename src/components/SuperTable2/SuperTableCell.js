import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Control from '../Control';

// 单元格的type只能取如下值：
// 'text', 'number', select', 'date', 'search', 'readonly'

const isInRegion = (target, {x, y}) => {
  const {left, right, top, bottom} = target.getBoundingClientRect();
  return !(x < left || x > right || y < top || y > bottom);
};

class SuperTableCell extends React.Component {
  static propTypes = {
    type: PropTypes.string.isRequired,
    value: PropTypes.any,
    options: PropTypes.array,
    props: PropTypes.object,
    onChange: PropTypes.func,
    onSearch: PropTypes.func,
    onBlur: PropTypes.func
  };

  onDateBlur = (value, event) => {
    if (!isInRegion(event.target, global.mousePos)) {
      this.props.onBlur();
    }
  };

  onOpenChange = (open) => {
    if (!open) {
      const targets = document.getElementsByClassName('ant-calendar-picker-container');
      if (!isInRegion(targets[0], global.mousePos)) {
        this.props.onBlur();
      }
    }
  };

  options = () => {
    return this.props.options || this.props.typeRelated || [];
  };

  getPopupContainer = () => {
    return ReactDOM.findDOMNode(this);
  };

  toTextComponent = (props) => {
    return <Control {...props} />;
  };

  toReadonlyComponent = (props) => {
    return <Control {...props} />;
  };

  toNumberComponent = (props) => {
    props.defaultValue = props.value;
    delete props.value;
    return <Control {...props}/>;
  };

  toDateComponent = (props) => {
    //props.getCalendarContainer = this.getPopupContainer;
    props.onBlur = this.onDateBlur;
    props.onOpenChange = this.onOpenChange;
    return <Control {...props}/>;
  };

  toSelectComponent = (props) => {
    props.options = this.options();
    props.dropdownMatchSelectWidth = false;
    //props.getPopupContainer = this.getPopupContainer;
    return <Control {...props} />;
  };

  toSearchComponent = (props) => {
    props.options = this.options();
    //props.getPopupContainer = this.getPopupContainer;
    props.onSearch = this.props.onSearch;
    props.dropdownMatchSelectWidth = false;
    return <Control {...props} />;
  };

  controlProps = ({type, value, props = {}}) => {
    const {width=100} = this.props;
    (type === 'readonly') && (props = {});
    return {
      ...props, type, value,
      size: 'default',
      autoFocus: this.props.error,
      style: {width: '100%', minWidth: width},
      onBlur: this.props.onBlur,
      onChange: this.props.onChange
    };
  };

  toSelectSearch = (props) => {
    props.options = this.options();
    props.onSearch = this.props.onSearch;
    props.dropdownMatchSelectWidth = false;
    return <Control {...props} />;
  };

  toSelectWriting = (props) => {
    return <Control {...props} />;
  };

  toSelect2 = (props) => {
    props.options = this.options();
    props.onSearch = this.props.onSearch;
    return <Control {...props} />;
  };

  render() {
    const props = this.controlProps(this.props);
    const className = this.props.error ? 'has-error' : '';
    switch (this.props.type) {
      case "text":
        return <div className={className}>{this.toTextComponent(props)}</div>;
      case "number":
        return <div className={className}>{this.toNumberComponent(props)}</div>;
      case "select":
        return <div className={className}>{this.toSelectComponent(props)}</div>;
      case 'search':
        return <div className={className}>{this.toSearchComponent(props)}</div>;
      case "date":
        return <div className={className}>{this.toDateComponent(props)}</div>;
      case "selectSearch":
        return <div className={className}>{this.toSelectSearch(props)}</div>;
      case 'selectWriting' :
        return <div className={className}>{this.toSelectWriting(props)}</div>;
      case 'select2' :
        return <div className={className}>{this.toSelect2(props)}</div>;
      case 'readonly':
        return this.toReadonlyComponent(props);
      default:
        return <div>"error type"</div>;
    }
  }
}

export default SuperTableCell;
export {isInRegion};
