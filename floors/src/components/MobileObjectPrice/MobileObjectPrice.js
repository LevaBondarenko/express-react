/**
 * MobileObjectPrice widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';

import s from './MobileObjectPrice.scss';
import ContextType from '../../utils/contextType';
import {connect} from 'react-redux';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import {map} from 'lodash';

class MobileObjectPrice extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    price: PropTypes.oneOfType([
      PropTypes.string, PropTypes.number
    ]),
    oldPrice: PropTypes.oneOfType([
      PropTypes.string, PropTypes.number
    ]),
    flatsData: PropTypes.object
  };

  static defaultProps = {};

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  getflatsData(data) {
    const dataTable = map(data, (price, flat) => {
      return (
        <div key={flat} className={s.flatsRow}>
          <div className={s.flat}>{flat}-комнатные</div>
          <div className={s.priceFlat}>
              от <Price price={price}/>&nbsp;<PriceUnit />
          </div>
        </div>
      );
    });

    return dataTable;
  }

  render() {
    const {price, oldPrice, flatsData} = this.props;

    return (flatsData ?
      <div className={s.flatsWrapper}>
        {this.getflatsData(flatsData)}
      </div> :
      <div className={s.root}>
        <div className={s.price}>
          <Price price={price}> <PriceUnit/></Price>
        </div>
        {oldPrice > price ? (
          <div className={s.oldPrice}>
            <Price price={oldPrice}> <PriceUnit/></Price>
          </div>
        ) : null}
      </div>
    );
  }

}

export default connect(
  state => {
    const objectInfo = state.objects.get('object') ?
        state.objects.get('object').toJS().info : {};

    return {
      price: objectInfo.price,
      oldPrice: objectInfo.old_price,
      flatsData: objectInfo.flats ? objectInfo.flats : {}
    };
  }
)(MobileObjectPrice);
