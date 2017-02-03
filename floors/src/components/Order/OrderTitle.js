/**
 * Created by tatarchuk on 15.10.15.
 */

import React, {Component} from 'react'; // eslint-disable-line no-unused-vars

class OrderTitle extends Component {
  render() {
    return (
      <h3 className="widget--title">{this.props.widgetTitle}</h3>
    );
  }
}

OrderTitle.propTypes = {
  widgetTitle: React.PropTypes.string
};

export default OrderTitle;
