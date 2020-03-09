import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles'
import s from './SuperToolbar.less';
import {Button, Popconfirm, Icon, Dropdown, Menu} from 'antd';
const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;

/**
 * key: 用于标识菜单项
 * title: 菜单项上的文字
 * subMenu: [可选]，菜单项子列表，包含key和title的对象数组，此时点击菜单项不触发事件，只有点击子列表项才会触发onSubClick事件
 */
const MenuType = {
  key: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subMenu: PropTypes.array
};

/**
 * key: 用于标识按钮
 * title: 按钮上的文字
 * bsStyle: 按钮样式，与antd中Button的type取值一样
 * confirm: 触发按钮事件前，是否需要用户确认，以及确认的提示文字；为空串则不会触发确认提示
 * menu: [可选]，下拉菜单项，有此属性时点击按钮不触发事件，菜单项如果仅是包含key和title的对象，点击菜单项会触发onClick事件
 *                菜单项如果是包含key、title、subMenu的对象，则点击此菜单项不触发事件，必须点击子列表项时才会触发onSubClick事件
 */
const ButtonType = {
  key: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  bsStyle: PropTypes.string,
  confirm: PropTypes.string,
  disabled: PropTypes.bool,
  menu: PropTypes.arrayOf(PropTypes.shape(MenuType))
};

const ButtonEx = ({type, children, ...props}) => {
  props[type === 'primary-o' ? 'data-btn-type' : 'type'] = type;
  return <Button {...props}>{children}</Button>;
};

/**
 * onClick: 纯按钮点击时或按钮下拉项中无子菜单列表项点击触发，原型为function(key)
 * onSubClick: 按钮为下拉时下拉项子列表项点击时触发，原型为function(key, subKey)
 */
class SuperToolbar extends React.Component {
  static propTypes = {
    buttons: PropTypes.arrayOf(PropTypes.shape(ButtonType)).isRequired,
    size: PropTypes.oneOf(['small', 'default', 'large']),
    onClick: PropTypes.func,
    onSubClick: PropTypes.func
  };

  onClick = (e) => {
    const {onClick, onSubClick, callback={}} = this.props;
    const key = typeof e === 'object' ? e.key : e;
    if (typeof e === 'object' && e.keyPath.length === 2 && onSubClick) {
      onSubClick(e.keyPath[1], e.keyPath[0]);
    } else if (onClick) {
      onClick(key);
    } else if (callback.onClick) {
      // callback被废弃，只是为了兼容旧代码而已
      callback.onClick(key);
    }
  };

  toSubMenu = ({key, title, subMenu=[]}) => {
    return (
      <SubMenu key={key} title={title}>
        {subMenu.map(({key, title}) => <MenuItem key={key}>{title}</MenuItem>)}
      </SubMenu>
    );
  };

  toMenu = (menu) => {
    return (
      <Menu onClick={this.onClick}>
        {
          menu.map((item) => {
            const {key, title, subMenu} = item;
            if (subMenu) {
              return this.toSubMenu(item);
            } else {
              return <MenuItem key={key}>{title}</MenuItem>;
            }
          })
        }
      </Menu>
    );
  };

  toButton = ({key, title, bsStyle: type, confirm, menu, disabled}) => {
    const onClick = this.onClick.bind(this, key);
    const {size='default'} = this.props;
    if (menu && menu.length) {
      return (
        <Dropdown key={key} trigger={['hover']} overlay={this.toMenu(menu)}>
          <ButtonEx {...{size, type}}>{title}<Icon type='down'/></ButtonEx>
        </Dropdown>
      );
    } else if (!confirm) {
      return <ButtonEx {...{key, size, type, disabled, onClick}}>{title}</ButtonEx>;
    } else {
      return (
        <Popconfirm key={key} title={confirm} onConfirm={onClick}>
          <ButtonEx {...{size, type, disabled}}>{title}</ButtonEx>
        </Popconfirm>
      );
    }
  };

  render() {
    const {buttons, style={}} = this.props;
    return (
      <div className={s.root} role='toolbar' style={style}>
        {buttons.map(this.toButton)}
      </div>
    );
  }
}

export default withStyles(s)(SuperToolbar);
