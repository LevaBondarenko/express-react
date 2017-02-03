/**
 * LK Objects Selector Item component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {capitalizeString, getTitle, getAdress, priceFormatter}
  from '../../../utils/Helpers';
import Price from '../../../shared/Price';
import PriceUnit from '../../../shared/PriceUnit';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

/*global data*/

class ObjectSelectorItem extends Component {
  static propTypes = {
    item: PropTypes.object
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {item} = this.props;
    const title = item.type !== 'flat' && item.type_ru ?
      capitalizeString(item.type_ru) : getTitle(item.rooms);
    const mortgagePay = priceFormatter(item.mortgage_pay);
    let address = getAdress(item.district, item.street, item.house_num);

    if (data.collections.cities && data.collections.cities[item.city_id]) {
      address = `${data.collections.cities[item.city_id].name}, ${address}`;
    }

    const toCenter = (item.la && item.lo && parseFloat(item.la) &&
      parseFloat(item.lo) && parseFloat(item.to_center)) ? (
        <span className='address--tocenter'>
          ({Math.round(item.to_center * 10) / 10} км от центра города)
        </span>
      ) : null;
    const priceM = priceFormatter(Math.ceil(item.price_m2));

    return (
      <div className='object-item-container' ref={item.id}>
        <div className='object-item-title clearfix'>
          <h3 className='pull-left col-xs-8'>
            <b>{title}</b>
          </h3>
          <Price price={item.price} shortRequest={false}
            className='item--price pull-right'>
            &nbsp;<PriceUnit/><br/>
          </Price>
          <p className='col-xs-12 address' style={{paddingLeft: 0}}>
            <span className="glyphicon glyphicon-map-marker"
              aria-hidden="true" />
            {address}
            {toCenter}
          </p>
        </div>
        <div className='object-item-content clearfix'>
          <Row>
            <Col xs={6}>
              {item.square ?
                <p><b>Площадь</b>: {item.square} м<sup>2</sup></p> : null}
              {item.area_land ?
                <p><b>Площадь участка</b>: {item.area_land} сот.</p> : null}
              {item.area_house ?
                <p><b>Площадь дома</b>: {item.area_house} м<sup>2</sup></p> :
              null}
              {(item.square && priceM &&
                item.class !== 'rent' && item.class !== 'cottages' ?
                <p><b>Цена за м<sup>2</sup></b>: {priceM} руб.</p> :
              null)}
              {(item.area_house && item.price &&
                item.class !== 'rent' && item.type !== 'land' ?
                <p><b>Цена за м<sup>2</sup></b>:&nbsp;
                  {priceFormatter(
                      Math.round(item.price / item.area_house))
                  } руб.
                </p> :
              null)}
              {(item.floor && item.floors && item.type !== 'land' ?
                <p><b>Этаж/Этажность</b>: {item.floor}/{item.floors}</p> :
              null)}
            </Col>
            <Col xs={6}>
              {(item.area_land && priceM && item.type === 'land' ? (
                <p><b>Цена за сотку</b>:&nbsp;
                  {priceFormatter(Math.round(item.price / item.area_land))} руб.
                </p>
              ) : null)}
              {(item.walls ? (
                <p><b>Материал стен:</b> {
                  item.walls.length > 15 ?
                    `${item.walls.substring(0, 12)}...` :
                    item.walls
                }</p>) : null)}
              {(item.floors && item.class === 'cottages' &&
                item.type !== 'land' ?
                <p><b>Этажность</b>: {item.floors}</p> :
              null)}
              {(item.rooms && item.class === 'cottages' &&
                item.type !== 'land' ?
                <p><b>Кол-во комнат</b>: {item.rooms}</p> :
              null)}
              {(item.series ?
                <p><b>Серия:</b> {item.series}</p> :
              null)}
              {(mortgagePay !== '0' && item.class !== 'rent' &&
                  item.class !== 'cottages' ?
                <p className='mortgagePay'>
                  <b>В ипотеку: {mortgagePay} руб./мес</b>
                </p> : null)}
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default ObjectSelectorItem;
