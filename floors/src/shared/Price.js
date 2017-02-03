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
import {priceFormatter, priceCleanup} from '../utils/Helpers';
import {round} from 'lodash';
import {connect} from 'react-redux';

class Price extends Component {
  static propTypes = {
    children: PropTypes.any,
    price: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    shortRequest: PropTypes.bool,
    className: PropTypes.string,
    currency: PropTypes.object,
    needCurrency: PropTypes.number
  };

  static defaultProps = {
    shortRequest: true
  };

  constructor(props) {
    super(props);
  }

  calculatePrice = (price, course) => {
    return Math.round(parseFloat(priceCleanup(price)) * course);
  };

  priceFormatPostfix(price, digit) {
    if (price.toString().length <= digit || digit < 3) {
      return price;
    }
    const newPrice = (round(price / Math.pow(10, digit), 1))
      .toString().replace('.', ',');
    const postfixes = {
      3: 'тыс.',
      6: 'млн',
      9: 'млрд'
    };
    const postfix = postfixes[digit] ? postfixes[digit] : '';

    return `${newPrice} ${postfix}`;
  }

  get price() {
    return this.props.price ? this.props.price : '-1';
  }

  get newPrice() {
    const {currency, needCurrency} = this.props;
    const course = currency.nominal / currency.value;

    let newPrice;

    if(needCurrency === 1) {
      newPrice = currency ? this.calculatePrice(this.price, course) : '';
    } else {
      newPrice = this.calculatePrice(this.price, course);
    }

    return newPrice;
  }

  render() {
    const {children, shortRequest, className} = this.props;
    const {currency} = this.props.currency;

    const newPriceWithPostfix = currency && currency.digit >= 3 ?
      this.priceFormatPostfix(this.newPrice, currency.digit) : this.newPrice;

    return (
      <span>
        {this.price === '-1' ?
          (<span className={className}>
            {shortRequest ? 'по запросу' : 'цена по запросу'}
          </span>) :
          (<span className={className}>
            <span>{priceFormatter(newPriceWithPostfix)}</span>
            {children}
          </span>)
        }
      </span>
    );
  }
}


function mapStateToProps(state) {
  return {
    currency: state.ui.get('currency').toJS().current,
    needCurrency: state.settings.get('needCurrency')
  };
}

export default connect(mapStateToProps)(Price);
