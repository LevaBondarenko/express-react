/**
 * Created by tatarchuk on 15.10.15.
 */

import React, {Component} from 'react'; // eslint-disable-line no-unused-vars

class OrderNotice extends Component {
  render() {
    return (
      <div className="row">
        <p className="text-center notice--text">{this.props.notice_text}</p>
      </div>
    );
  }
}

OrderNotice.propTypes = {
  'notice_text': React.PropTypes.string
};

export default OrderNotice;