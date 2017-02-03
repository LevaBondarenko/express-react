import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';

class FlatInfoEconomy extends Component {
  static propTypes = {
    oldPrice: PropTypes.number,
    price: PropTypes.number,
    priceFair: PropTypes.number,
    isSaleTrue: PropTypes.bool
  };

  getEconomy = () => {
    const {oldPrice, price, isSaleTrue, priceFair} = this.props;

    const content = oldPrice !== 0 && oldPrice > price && price > 0 ?
      (<div>
        <div className="object_economy_text">
          Ваша экономия:
        </div>
        <div className="object_economy_value">
          <Price price={isSaleTrue && priceFair ? price - priceFair :
               oldPrice - price}> <PriceUnit/></Price>
        </div>
      </div>
      ) : <div />;

    return content;
  };

  render() {

    return(
      <div className='object_economy'>
        {this.getEconomy()}
      </div>
    );
  }
}

export default FlatInfoEconomy;
