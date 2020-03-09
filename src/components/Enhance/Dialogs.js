import React from 'react';
import {getObjectExclude} from '../../common/common';

const Enhance = (Container, keys, Dialogs, noContainer=false) => class extends React.Component {
  toDialogs = () => {
    return keys.reduce((result, key, index) => {
      const Dialog = Dialogs[index];
      this.props[key] && result.push(<Dialog key={key} container={this} />);
      return result;
    }, []);
  };

  render() {
    const props = getObjectExclude(this.props, keys);
    return (
      <div className={noContainer ? null : 'modal-container'}>
        <Container {...props}/>
        {this.toDialogs()}
      </div>
    )
  }
};

export default Enhance;
