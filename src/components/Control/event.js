import {getObjectExclude} from '../../common/common';

class EventHandler {
  constructor(props) {
    this.props = props;
  }

  toValue = (event='') => {
    if (event === null) {
      return '';
    } else {
      return event.nativeEvent ? event.target.value : event;
    }
  };

  onChange = (event) => {
    this.props.onChange(this.toValue(event));
  };

  onBlur = (event) => {
    this.props.onBlur(this.toValue(event), event);
  };

  onSearch = (event) => {
    this.props.onSearch(this.toValue(event));
  };
}

const replaceEvent = (props, handler) => {
  const events = ['onChange', 'onBlur', 'onSearch'];
  let callback = events.reduce((result, event) => {
    if (props[event]) {
      result[event] = handler[event];
    }
    return result;
  }, {});
  return Object.assign({}, getObjectExclude(props, events), callback);
};

const eventWrapper = (props) => {
  const handler = new EventHandler(props);
  return replaceEvent(props, handler);
};

export default eventWrapper
