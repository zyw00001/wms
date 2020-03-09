import React from 'react';

function Indent({children, style={}, ...props}) {
  Object.assign(style, {paddingLeft: 15, paddingRight: 15});
  return (
    <div style={style} {...props}>
      {children}
    </div>
  );
}

export default Indent;
