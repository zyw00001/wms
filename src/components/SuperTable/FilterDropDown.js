import React, { PropTypes } from 'react';
import {Button, Input} from 'antd';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './FilterDropDown.less';

class FilterDropDown extends React.Component {
  static propTypes = {
    value: PropTypes.string,
    onSearch: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {value: props.value || ''};
  }

  componentWillReceiveProps(newProps) {
    this.setState({value: newProps.value || ''});
  }

  componentDidMount() {
    if (this.input) {
      this.input.focus();
    }
  }

  componentDidUpdate() {
    if (this.input) {
      this.input.focus();
    }
  }

  onChange = (e) => {
    this.setState({value: e.target.value});
  };

  onSearch = () => {
    const {onSearch} = this.props;
    onSearch && onSearch(this.state.value);
  };

  render() {
    const props = {
      size: 'small',
      value: this.state.value,
      onChange: this.onChange,
      onPressEnter: this.onSearch,
      ref: (e) => this.input = e
    };
    return (
      <div className={s.root}>
        <Input {...props} />
        <Button onClick={this.onSearch} size='small' type='primary'>搜索</Button>
      </div>
    );
  }
}

export default withStyles(s)(FilterDropDown);
