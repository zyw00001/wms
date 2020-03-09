import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './SuperTab.less';
import {Tabs} from 'antd';
const TabPane = Tabs.TabPane;

/**
 * key: 唯一标识一个tab
 * title: 显示在tab上的标题
 * close: 为true则显示关闭按钮，默认为true
 */
const TabType = {
  key: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  close: PropTypes.bool
};

/**
 * activeKey: 处于活动状态tab的key值
 * onTabChange: 切换选项卡时触发，原型为function(key)
 * onTabClose: 关闭选项卡时触发，原型为funtion(key)
 */
class SuperTab extends React.Component {
  static propTypes = {
    activeKey: PropTypes.string.isRequired,
    tabs: PropTypes.arrayOf(PropTypes.shape(TabType)).isRequired,
    onTabChange: PropTypes.func,
    onTabClose: PropTypes.func
  };

  static PROPS = ['activeKey', 'tabs', 'onTabChange', 'onTabClose'];

  getEvent = (name) => {
    if (this.props[name]) {
      return this.props[name];
    } else if (this.props.callback) {
      return this.props.callback[name];
    } else {
      return null;
    }
  };

  callEvent = (name, key) => {
    const onEvent = this.getEvent(name);
    if (onEvent) {
      onEvent(key);
    }
  };

  onEdit = (key, action) => {
    if (action === 'remove') {
      this.callEvent('onTabClose', key);
    }
  };

  onChange = (key) => {
    this.callEvent('onTabChange', key);
  };

  toTab = ({key, title, close}) => {
    return <TabPane key={key} tab={title} closable={close} />;
  };

  getTabsProps = () => {
    return {
      className: s.root,
      activeKey: this.props.activeKey,
      type: 'editable-card',
      hideAdd: true,
      onEdit: this.onEdit,
      onChange: this.onChange
    }
  };

  render() {
    return (
      <Tabs {...this.getTabsProps()}>
        {this.props.tabs.map(this.toTab)}
      </Tabs>
    );
  }
}

export default withStyles(s)(SuperTab);
