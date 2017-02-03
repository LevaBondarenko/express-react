/**
 * Searchform house component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import Helpers from '../../utils/Helpers';
import Image from '../../shared/Image';

import FavButton from '../../shared/FavButton';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';

/**
 * Bootstrap 3 elements
 */
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
/* global data */

class RealtyItemList extends Component {
  static propTypes = {
    house: PropTypes.object,
    favorites: PropTypes.number,
    source: PropTypes.number,
    layoutType: PropTypes.string,
    showCity: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
  }

  render() {
    const {house, favorites, showCity, layoutType} = this.props;
    const imageProps = {
      image: house.main_photo,
      visual: house.visual,
      width: 300,
      height: 267
    };

    const pageType = layoutType !== 'rent' ? 'realty' : 'realty_rent';
    const location = `/${pageType}/${house.object_id}`;

    const title = house.type !== 'flat' ?
        Helpers.capitalizeString(house.type_ru) :
        Helpers.getTitle(house.rooms);

    let adress = Helpers.getAdress(
      house.district, house.street, house.house_num
    );



    if (showCity && data.collections.cities &&
    data.collections.cities[house.city_id]) {
      adress = `${data.collections.cities[house.city_id].name}, ${adress}`;
    }

    const favButton = favorites && parseInt(house.price) > 0 ? (
      <FavButton
        key={house.class + house.object_id}
        className='btn-fav-insearchlayout'
        oclass={house.class}
        oid={house.object_id}
      />
    ) : null;

    const toCenter = (house.la && house.lo &&
      parseFloat(house.la) && parseFloat(house.lo)) ? (
        <span className='adress--tocenter'>
          ({Math.round(house.to_center * 10) / 10} км от центра города)
        </span>
      ) : null;

    //later rewrite
    const priceM = Math.ceil(house.price_m2);
    const mortgagePay = house.mortgage_pay || '';

    return (
    <Col xs={12}>
      <div className='objects--item__map clearfix' ref={house.id}>
        {(parseInt(house.old_price) > 0 &&
            parseInt(house.old_price) > parseInt(house.price) ?
          <div className="objects--item__nomap--wrapper">
            <div className='objects--item__nomap--installment'/>
          </div> : null)}
        <Col xs={3}>
          <div className='objects--item__map--img'>
            <a href={location} target='_blank'>
              <Image className='img-responsive' {...imageProps}/>
            </a>
          </div>
        </Col>
        <Col xs={9}>
          <div className='objects--item__nomap--title clearfix'>
            <h3 className='pull-left col-xs-12'>
              <a href={location} target='_blank'>
                <b>{title}</b>
              </a>
              {favButton}
            </h3>
            <p className='col-xs-12 adress' style={{paddingLeft: 0}}>
              <span className="glyphicon glyphicon-map-marker"
                aria-hidden="true" />
              {adress}
              {toCenter}
            </p>
            <Row className='objects--item__map--content'>
              <Col xs={3} >
                <p className='item--price priceList'>
                  <Price price={house.price} shortRequest={false}>
                    &nbsp;<PriceUnit/>
                  </Price><br/>
                {(parseInt(house.old_price) > 0 &&
                  parseInt(house.old_price) > parseInt(house.price) &&
                  parseInt(house.price) > 0 ?
                  <Price className='item--oldprice priceList strikethrough'
                    price={house.old_price}>
                    &nbsp;<PriceUnit/>
                  </Price> : null)}
                </p>
                {(house.square && priceM && layoutType !== 'rent' &&
                  parseInt(house.price) > 0 ?
                <p className='item--priceSquare'>
                  <b>За м<sup>2</sup></b>:&nbsp;
                    <Price price={priceM}> <PriceUnit/></Price></p> : null)}
              </Col>
              <Col xs={3}>
                {(house.floor ?
                  <p><b>Этаж</b>: {house.floor}/{house.floors}</p> : null)}
                {(house.square ?
                  <p><b>Площадь</b>: {house.square} м<sup>2</sup></p> : null)}
                {(house.walls && house.walls !== '0' ?
                  <p><b>Cтены</b>: {house.walls}</p> : null)}
              </Col>
              <Col xs={3}>
                {(house.series && house.series !== '0' ?
                  <p><b>Серия</b>: {house.series}</p> : null)}
                {(mortgagePay && mortgagePay !== '0' && layoutType !== 'rent' &&
                    house.class !== 'cottages' && parseInt(house.price) > 0 ?
                  <p className='mortgagePay'>
                    <b>В ипотеку:</b><br/>
                    <Price className='mortgagePay colorCrimson'
                      price={mortgagePay}> <PriceUnit>/мес</PriceUnit>
                    </Price>
                  </p> : null)}
              </Col>
              <Col xs={3}>
                <div className='item--controls'>
                  <a href={location} className='item--controls__more'
                  target='_blank'>Подробнее</a>
                </div>
              </Col>
            </Row>
          </div>

        </Col>
      </div>
      </Col>
    );

  }
}


export default RealtyItemList;
