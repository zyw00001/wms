import React, { PropTypes } from 'react';
import history from '../../core/history';

function isLeftClickEvent(event) {
  return event.button === 0;
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

function jump(url) {
  if (history.location.pathname !== url) {
    history.push(url);
  } else {
    history.replace(url);
  }
}

class Link extends React.Component {
  static propTypes = {
    to: PropTypes.string,
    disabled: PropTypes.bool,
    children: PropTypes.node,
    onClick: PropTypes.func,
  };

  handleClick = (event) => {
    if (this.props.onClick) {
      this.props.onClick(event);
    }

    if (isModifiedEvent(event) || !isLeftClickEvent(event)) {
      return;
    }

    if (event.defaultPrevented === true) {
      return;
    }

    event.preventDefault();

    if (this.props.to) {
      jump(this.props.to);
    }
  };

  render() {
    const { to, children, disabled, ...props } = this.props;
    if (disabled) {
      return <a {...props}>{children}</a>;
    } else {
      return <a href={to} {...props} onClick={this.handleClick}>{children}</a>;
    }
  }
}

export default Link;
export {jump};
