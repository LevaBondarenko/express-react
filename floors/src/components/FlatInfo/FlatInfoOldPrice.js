import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import Price from '../../shared/Price';

class FlatInfoOldPrice extends Component {
  static propTypes = {
    oldPrice: PropTypes.number,
    price: PropTypes.number,
    priceFair: PropTypes.number,
    isSaleTrue: PropTypes.bool
  };

  getOldPrice = () => {
    const {oldPrice, price, priceFair, isSaleTrue} = this.props;
    const content = oldPrice !== 0 && oldPrice > price &&
     price > 0 && !isSaleTrue ?
      (<Price price={oldPrice}>
        <span className='object_oldPrice_diagonalBg' /></Price>
      ) : (priceFair !== 0  && isSaleTrue ? (<Price price={price}>
        <span className='object_oldPrice_diagonalBg' /></Price>
      ) : <div />);

    return content;
  };

  render() {

    return(
      <div className='object_oldPrice'>
        {this.getOldPrice()}
      </div>
    );
  }
}

export default FlatInfoOldPrice;
