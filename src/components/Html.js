import React, { PropTypes } from 'react';
import { analytics } from '../config';

const sendStateToBrowser = () => {
  const currentState = {}/*global.store.getState()*/;
  return {__html: `window.initState = ${JSON.stringify(currentState)};`};
};

class Html extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    style: PropTypes.string,
    scripts: PropTypes.arrayOf(PropTypes.string.isRequired),
    children: PropTypes.string
  };

  render() {
    const { title, description, style, scripts, children } = this.props;
    return (
      <html className="no-js" lang="zh">
        <head>
          <meta charSet="utf-8" />
          <meta name="renderer" content="webkit" />
          <meta httpEquiv="x-ua-compatible" content="ie=edge,chrome=1" />
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link href="http://api.map.baidu.com/library/TrafficControl/1.4/src/TrafficControl_min.css" rel="stylesheet" type="text/css" />
          <link rel="stylesheet" type="text/css" href="/assets/index.css" />
          {style && <style id="css" dangerouslySetInnerHTML={{ __html: style }} />}
          <script dangerouslySetInnerHTML={sendStateToBrowser()} />
        </head>
        <body>
          <div id="app" dangerouslySetInnerHTML={{ __html: children }} style={{height:'100%'}}/>
          {scripts && scripts.map(script => <script key={script} src={script} />)}
        </body>
      </html>
    );
  }
}

export default Html;
