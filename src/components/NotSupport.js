import React, { PropTypes } from 'react';

const isNotSupport = (userAgent) => {
  let result;
  if (userAgent.indexOf('compatible') !== -1) {
    result = userAgent.match(/MSIE (\d+)/);
    if (result && Number(result[1]) < 10) {
      return true;
    }
  } else if (userAgent.indexOf('Firefox') !== -1) {
    result = userAgent.match(/Firefox\/(\d+)/);
    if (result && Number(result[1]) < 45) {
      return true;
    }
  }

  return false;
};

const getSupport = (userAgent) => {
  if (userAgent.indexOf('compatible') !== -1) {
    if (userAgent.indexOf('BIDUBrowser') !== -1) {
      return '百度浏览器请采用极速模式';
    } else if (userAgent.indexOf('UBrowser') !== -1) {
      return 'UC浏览器请采用极速模式';
    } else if (userAgent.indexOf('MetaSr') !== -1) {
      return '搜狗浏览器请采用高速模式';
    } else if (userAgent.indexOf('QQBrowser') !== -1) {
      return 'QQ浏览器请采用极速模式';
    } else {
      return 'IE内核版本过低，需要IE10+，推荐使用谷歌浏览器；如果是双核浏览器，请采用极速模式';
    }
  } else if (userAgent.indexOf('Firefox') !== -1) {
    return '火狐浏览器版本过低，请安装最新版本';
  }
};

const style = {
  position: 'absolute',
  color: 'red',
  fontSize: 14,
  fontWeight: 'bold',
  top: '50%',
  left: 0,
  right: 0,
  textAlign: 'center'
};

const NotSupport = ({userAgent}) => {
  return (
    <html lang="zh">
      <head>
        <meta charSet="utf-8" />
        <meta name="renderer" content="webkit" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge,chrome=1" />
        <title>ePLD</title>
      </head>
      <body>
        <div style={style}>{getSupport(userAgent)}</div>
      </body>
    </html>
  );
};

export default NotSupport;
export {isNotSupport};
