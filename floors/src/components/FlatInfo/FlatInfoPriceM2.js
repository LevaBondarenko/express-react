import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';

class FlatInfoPriceM2 extends Component {
  static propTypes = {
    priceM2: PropTypes.number,
    actionSL: PropTypes.string,
    action: PropTypes.string,
    type: PropTypes.string,
    price: PropTypes.number,
    area: PropTypes.string,
    priceFair: PropTypes.number,
    isSaleTrue: PropTypes.bool,
    square: PropTypes.number
  };

  getPriceM2 = () => {
    const {priceM2, actionSL, action, type, price, area, priceFair, square,
    isSaleTrue} = this.props;
    const priceLand =  price / parseFloat(area);
    const priceM2Fair = isSaleTrue ? priceFair / square : priceM2;

    const content = (action === 'sale' && price > 0) ||
      (actionSL && actionSL === 'sale' && price > 0)  ? (
       type === 'cottages' && area >= '1' ? (<div>
       <div className="object_price_m2_text">
         Цена за сотку:
       </div>
       <div className="object_price_m2_value">
         <Price price={Math.round(priceLand)}> <PriceUnit/></Price>
       </div>
     </div>) : (<div>
       <div className="object_price_m2_text">
         Цена за м<sup>2</sup>:
       </div>
       <div className="object_price_m2_value">
         <Price price={Math.round(priceM2Fair)}> <PriceUnit/></Price>
       </div>
     </div>
   )) : <div />;

    return content;
  };

  render() {
    return(
      <div className='object_price_m2'>
        {this.getPriceM2()}
      </div>
    );
  }
}

export default FlatInfoPriceM2;
