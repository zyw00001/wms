import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Login.less';
import {Carousel, Checkbox, Input, Icon, Button} from 'antd';
import helper from '../../common/common';

const URL_LOGIN = '/api/login';
const BANNER_ITEMS = [
  {h1: '运输环节全透明', h2: ['实时追踪', '卓越服务'], img: '/login_imgs/banner1.png'},
  {h1: '运营数据极准确', h2: ['丰富数据', '洞见利润'], img: '/login_imgs/banner2.png'},
  {h1: '快速响应易操作', h2: ['规则驱动', '轻松上手'], img: '/login_imgs/banner3.png'}
];

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {account: '', password: '', loading: false};
    this.onLogin = this.onLogin.bind(this);
  }

  toIcon = (type) => {
    return <Icon type={type} style={{fontSize: 14}} />;
  };

  userProps = () => {
    return {
      prefix: this.toIcon('user'),
      size: 'large',
      value: this.state.account,
      placeholder: '邮箱/手机号',
      name: 'account',
      onChange: (e) => this.setState({account: e.target.value})
    };
  };

  pwdProps = () => {
    return {
      type: 'password',
      prefix: this.toIcon('lock'),
      size: 'large',
      value: this.state.password,
      placeholder: '密码',
      name: 'password',
      onChange: (e) => this.setState({password: e.target.value})
    };
  };

  buttonProps = () => {
    return {
      type: 'primary',
      style: {width: '100%'},
      size: 'large',
      htmlType: 'submit',
      loading: this.state.loading
    };
  };

  renderBanner = (item, index) => {
    return (
      <div key={index}>
        <h1>{item.h1}</h1>
        <h2>
          <span>{item.h2[0]}</span>
          <span>{item.h2[1]}</span>
        </h2>
        <div>
          <img alt='banner' src={item.img} />
        </div>
      </div>
    );
  };

  async onLogin(e) {
    e.preventDefault();
    const {account, password} = this.state;
    if (!account || !password) {
      helper.showError('请输入用户名或密码');
      return;
    }

    this.setState({loading: {delay: 200}});
    const {returnCode, returnMsg} = await helper.fetchJson(URL_LOGIN, helper.postOption({account, password}));
    if (returnCode !== 0) {
      helper.showError(returnMsg);
    } else {
      window.location.href = '/';
    }
    this.setState({loading: false});
  };

  render() {
    return (
      <div className={s.root}>
        <header>
          <img src='/login_imgs/logo.png' alt='logo'/>
        </header>
        <section>
          <Carousel autoplay>
            {BANNER_ITEMS.map(this.renderBanner)}
          </Carousel>
          <form onSubmit={this.onLogin}>
            <h1>TMS运输管理系统</h1>
            <div>
              <Input {...this.userProps()} />
            </div>
            <div>
              <Input {...this.pwdProps()} />
            </div>
            <div>
              <Checkbox defaultChecked>记住密码</Checkbox>
              <a href='/password/find'>忘记密码</a>
            </div>
            <div>
              <Button {...this.buttonProps()}>登录</Button>
            </div>
          </form>
        </section>
        <footer>
          <span>Copyright ©2005 - 2013 深圳市云恋科技有限公司</span>
          <a href='http://www.miitbeian.gov.cn' target='_blank'>粤ICP备17104734号-1</a>
        </footer>
      </div>
    );
  }
}

export default withStyles(s)(Login);
