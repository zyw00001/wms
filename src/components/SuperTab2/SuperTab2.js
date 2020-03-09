import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './SuperTab2.less';
import {Tabs, Menu, Dropdown, Icon} from 'antd';
const TabPane = Tabs.TabPane;
const MenuItem = Menu.Item;

/**
 * key: 唯一标识一个tab
 * title: 显示在tab上的标题
 */
const TabType = {
  key: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
};

/**
 * activeKey: 处于活动状态tab的key值
 * menu: 是否需要右侧下拉列表，默认false
 * onTabChange: 切换选项卡时触发，原型为function(key)
 */
class SuperTab extends React.Component {
  static propTypes = {
    activeKey: PropTypes.string.isRequired,
    tabs: PropTypes.arrayOf(PropTypes.shape(TabType)).isRequired,
    menu: PropTypes.bool,
    onTabChange: PropTypes.func
  };

  onTabChange = (key) => {
    const {onTabChange, callback={}} = this.props;
    if (onTabChange) {
      onTabChange(key);
    } else if (callback.onTabChange) {
      // callback被废弃，只是为了兼容旧代码而已
      callback.onTabChange(key);
    }
  };

  toTab = (tab) => {
    return <TabPane key={tab.key} tab={tab.title} />;
  };

  toMenu = () => {
    const {tabs, activeKey} = this.props;
    return (
      <Menu style={{maxHeight: '450px', overflow: 'auto'}}>
        {tabs.map(tab => {
          const style = activeKey === tab.key ? {color: "#2196f3"} : {};
          return (
            <MenuItem key={tab.key}>
              <a onClick={this.onTabChange.bind(this, tab.key)} style={style}>{tab.title}</a>
            </MenuItem>
          );
        })}
      </Menu>
    );
  };

  getPopupContainer = () => {
    const {container} = this.props;
    if (typeof container === 'undefined') {
      return document.body;
    } else {
      return ReactDOM.findDOMNode(container);
    }
  };

  toDropdown = () => {
    return (
      <Dropdown overlay={this.toMenu()} getPopupContainer={this.getPopupContainer}>
        <Icon type="menu-unfold" style={{fontSize: 16, verticalAlign: -2}} />
      </Dropdown>
    );
  };

  render() {
    const {tabs, activeKey, menu = false} = this.props;
    return (
      <Tabs className={s.root} activeKey={activeKey} onChange={this.onTabChange} tabBarExtraContent={menu && tabs.length > 3 && this.toDropdown()}>
        {tabs.map(this.toTab)}
      </Tabs>
    );
  }
}

export default withStyles(s)(SuperTab);
