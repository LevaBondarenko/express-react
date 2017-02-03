/**
 * Price Component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {connect} from 'react-redux';

class PriceUnit extends Component {
  static propTypes = {
    field: PropTypes.string,
    children: PropTypes.any,
    className: PropTypes.string,
    unit: PropTypes.string,
    currency: PropTypes.object,
  };

  constructor(props) {
    super(props);
  }

  get unit() {
    const {currency} = this.props;

    return currency['symbol'];
  }

  render() {
    const {children, className} = this.props;

    return (
      <span className={className}>
        {this.unit}
        {children}
      </span>
    );
  }
}

function mapStateToProps(state) {
  return {
    currency: state.ui.get('currency').toJS().current
  };
}

export default connect(mapStateToProps)(PriceUnit);
