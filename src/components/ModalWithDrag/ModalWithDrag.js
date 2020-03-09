import React from 'react';
import {Modal} from 'antd';
import drag from './drag';

const onLoad = (e) => {
  const dragElement = e.parentNode.parentNode;
  const targetElement = dragElement.parentNode.parentNode;
  drag(dragElement, targetElement);
};

const ModalWithDrag = ({children, title, ...props}) => {
  props.title = <div ref={(e) => e && onLoad(e)}>{title}</div>;
  return <Modal {...props}>{children}</Modal>;
};

export default ModalWithDrag;
