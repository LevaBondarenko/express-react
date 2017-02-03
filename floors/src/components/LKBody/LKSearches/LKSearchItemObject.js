/**
 * LK Search Item Object component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */


/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import classNames from 'classnames';
import {toArray, size, values, keys, flatten} from 'lodash';
import {getMin} from  '../../../utils/filterUtils';

import Helpers from '../../../utils/Helpers';
import FavButton from '../../../shared/FavButton';
import Price from '../../../shared/Price';
import PriceUnit from '../../../shared/PriceUnit';
import Image from '../../../shared/Image';
/**
 * Bootstrap 3 elements
 */
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

/* global data */

class LKSearchItemObject extends Component {
  static propTypes = {
    object: PropTypes.object,
    class: PropTypes.string,
    disableFav: PropTypes.bool,
    disableLink: PropTypes.bool,
    address_meta: PropTypes.string //eslint-disable-line camelcase
  };

  constructor(props) {
    super(props);
    const {object} = props;
    let location;

    switch(props.class) {
    case 'flats':
      location = `/realty/${object.object_id}`;
      break;
    case 'nh_flats':
      location = `/zastr/jk/${object.slugUrl}`;
      break;
    case 'cottages' :
      location = `/realty_out/${object.object_id}`;
      break;
    case 'rent' :
      location = `/realty_rent/${object.object_id}`;
      break;
    case 'offices' :
      location = `/commerce/${object.object_id}`;
      break;
    default :
      location = `/realty/${object.object_id}`;
    }
    this.state = {
      object: props.object,
      location: location
    };
  }

  componentWillReceiveProps(nextProps) {
    const {object} = nextProps;
    let location;

    switch(nextProps.class) {
    case 'flats':
      location = `/realty/${object.object_id}`;
      break;
    case 'nh_flats':
      location = `/zastr/jk/${object.slugUrl}`;
      break;
    case 'cottages' :
      location = `/realty_out/${object.object_id}`;
      break;
    case 'rent' :
      location = `/realty_rent/${object.object_id}`;
      break;
    case 'offices' :
      location = `/commerce/${object.object_id}`;
      break;
    default :
      location = `/realty/${object.object_id}`;
    }
    this.setState(() => ({
      object: nextProps.object,
      location: location
    }));
  }

  get locationLink() {
    const {disableLink} = this.props;
    const {location} = this.state;

    const content = disableLink ? null : (
      <Row>
        <Col xs={12} className='objects--item__nomap--detaillink'>
          <a href={location} target='_blank'>Узнать больше >></a>
        </Col>
      </Row>
    );

    return content;
  }

  get cardTitle() {

    const {object, location} = this.state;
    const {disableLink, disableFav} = this.props;
    const title = object.class === 'nh_flats' ?
      object.gp.replace(/&quot;/g, '\"') :
      Helpers.getTitle(object.rooms, object.type_ru);
    const favButton = disableFav ||
      object.class === 'nh_flats' ||
      parseInt(object.price) < 0 ? null :
      (<FavButton
        key={object.class + object.object_id}
        className='btn-fav-insearchlayout'
        oclass={object.class}
        oid={object.object_id}
      />);
    const shortTitle = title.slice(0,55);
    const titleEnd = title.length > shortTitle.length ? `${shortTitle}...` :
    shortTitle;

    const content = disableLink ? (
      <h3 className='pull-left col-xs-7' title={title}>
        <b>{titleEnd}</b>{favButton}
      </h3>
    ) : (
      <h3 className='pull-left col-xs-7' title={title}>
        <a href={location} target='_blank'><b>{titleEnd}</b></a>
        {favButton}
      </h3>
    );

    return content;
  }

  render() {
    const {object, location} = this.state;
    const priceM = Helpers.priceFormatter(Math.ceil(object.price_m2));
    const mortgagePay = Helpers.priceFormatter(object.mortgage_pay);

    const imageProps = {
      image: object.main_photo && object.main_photo.replace('/photos/',''),
      visual: object.visual,
      width: 300,
      height: 267
    };

    const adress = !object.city_id || !object.district_id || !object.district ?
      object.address_meta :
      `${data.collections.cities[object.city_id].name}, ${Helpers.getAdress(
        object.district, object.street, object.house_num
      )}`;

    const toCenter = (object.la && object.lo && parseFloat(object.la) &&
      parseFloat(object.lo) && parseFloat(object.to_center)) ? (
        <span className='adress--tocenter'>
          ({Math.round(object.to_center * 10) / 10} км от центра города)
        </span>
      ) : null;
    const price = object.class === 'nh_flats' ?
      getMin('price', toArray(object.flats), true) :
      object.price;
    const squareMin = object.class === 'nh_flats' ?
      getMin('square', toArray(object.flats), true) : null;
    const countFlats = object.class === 'nh_flats' ?
      size(flatten(values(object.flats))) : null;
    const oldPricePercent = parseInt(object.old_price) ?
      (object.price - object.old_price) * 100 / object.old_price | 0 : 0;
    const dateUpdate = object.date_update ?
      `Последний раз цена изменилась ${object.date_update.split(' ')[0]}` : '';
    const walls = object.walls && object.walls.length > 24 ?
      `${object.walls.slice(0, 22)}...` :
      object.walls;
    let priceUnit;

    if(parseInt(object.price) > 0) {
      priceUnit = this.props.class !== 'rent' ?
       <PriceUnit/> : <PriceUnit>/мес</PriceUnit>;
    } else {
      priceUnit = <span />;
    }



    return (
      <Col xs={6}>
        <div
          className='objects--item__nomap clearfix'
          ref={object.id}>
          <Col xs={12}>
            <div className='objects--item__nomap--title clearfix'>
              {this.cardTitle}
              <span className={classNames(
                {'nh': object.class === 'nh_flats'},
                'pull-right',
                'item--price')}>
                {object.class === 'nh_flats' ? 'от ' : null}
                <Price price={price}/>&nbsp;
                {priceUnit}
              {(parseInt(object.old_price) > 0 && parseInt(object.price) > 0 ?
                <span>
                  <span
                    className={classNames(
                        'item--oldprice-percent',
                        {'red': oldPricePercent > 0 ? true : false}
                    )}
                    title={dateUpdate}>
                    {`${oldPricePercent > 0 ? '+' : ''}${oldPricePercent}%`}
                  </span>
                  <br/>
                  <span className='item--oldprice-withtitle'>
                      Старая цена &nbsp;
                    <Price className='item--oldprice strikethrough'
                      price={object.old_price}> <PriceUnit/>
                    </Price>
                  </span>
                </span> : <br/>)}
              </span>
              <p className='col-xs-12 adress' style={{padding: 0}}>
                {object.class === 'newhousesflats' ?
                  <span className='objects--item__nomap--title-jk'>
                    {object.gp.replace(/&quot;/g, '"')}<br/>
                  </span> : null
                }
                <span className="glyphicon glyphicon-map-marker"
                  aria-hidden="true" />
                {adress}
                {toCenter}
              </p>
            </div>
            <div className='objects--item__nomap--content clearfix'>
              <Col xs={7}
                className='item--description clearfix'>
                <Row>
                  <Col xs={12} className='objects--item__nomap--detail'>
                    {(object.square ?
                      <p><b>Площадь:</b> {object.square} м<sup>2</sup></p> :
                      null)}
                    {object.class === 'nh_flats' ?
                      <p><b>Площадь:</b>  от {squareMin} м<sup>2</sup></p> :
                      null}
                    {object.class === 'nh_flats' ?
                      <p><b>Подходящих квартир:</b> {countFlats}</p> :
                      null}
                    {object.class === 'nh_flats' ?
                      <p><b>Срок сдачи:</b> {object.deadline ? 'Дом сдан' :
                        `${object.deadline_q} кв. ${object.deadline_y}`}</p> :
                      null}
                    {parseInt(object.area_house) !== 0 &&
                              object.class === 'cottages' &&
                              object.type !== 'land' ?
                      (<p><b>Площадь дома:</b>&nbsp;
                        <span>{object.area_house}&nbsp;м<sup>2</sup></span>
                      </p>) :
                      null}
                    {parseInt(object.area_land) !== 0 &&
                              object.class === 'cottages' ?
                      (<p><b>Площадь участка:</b>&nbsp;
                        {object.area_land}&nbsp;сот.
                      </p>) :
                      null}
                    {(object.floor ?
                      <p><b>Этаж/Этажность:</b>&nbsp;
                        {object.floor}/{object.floors}</p> :
                        null)}
                    {(parseInt(object.floors) !== 0 &&
                               object.class === 'cottages' &&
                               object.type !== 'land' ? // для загородки
                      <p><b>Этажность</b>:&nbsp;
                        {object.floors}
                      </p> :
                      null)}
                    {(parseInt(object.rooms) !== 0 &&
                               object.class === 'cottages' &&
                               object.type !== 'land' ? // для загородки
                      <p><b>Кол-во комнат</b>:&nbsp;
                        {object.rooms}
                      </p> :
                      null)}
                    {object.class === 'nh_flats' ? // для загородки
                      <p><b>Кол-во комнат</b>:&nbsp;
                        {keys(object.flats).join(', ')}
                      </p> :
                      null}
                    {(object.series && object.series !== '0' ?
                      <p><b>Серия</b>: {object.series}</p> : null)}
                    {(object.square && priceM && this.props.class !== 'rent' &&
                      parseInt(object.price) > 0 ?
                      <p><b>Цена за м<sup>2</sup></b>:&nbsp;
                        <Price price={priceM}> <PriceUnit/></Price>
                      </p> : null)}
                    {parseInt(object.area_house) !== 0 &&
                              object.class === 'cottages' &&
                              object.type !== 'land' &&
                              parseInt(object.price) > 0 ?
                      (<p><b>Цена за м<sup>2</sup>:</b>&nbsp;
                        <Price
                          price={Math.round(object.price / object.area_house)}>
                          &nbsp;<PriceUnit/>
                        </Price>
                      </p>) :
                      null}
                    {object.type === 'land' && parseInt(object.price) > 0 ? // для загородки
                      (<p>
                        <b>Цена за сотку: </b>
                        <Price
                          price={Math.round(object.price / object.area_land)}>
                          &nbsp;<PriceUnit/>
                        </Price>
                      </p>) :
                      null}
                    {object.class === 'nh_flats' ?
                      <p>
                        <b>Застройщик</b>
                        : <span>{object.builder}</span>
                      </p> : null}
                    {(object.walls && object.walls !== '0' ?
                      <p><b>Материал стен: </b>
                        {walls}
                      </p> : null)}
                    {(object.keep_ru && this.props.class === 'rent' ?
                      <p><b>Ремонт</b>: {object.keep_ru}</p> :
                        null)}
                  {(mortgagePay && mortgagePay !== '0' &&
                    this.props.class !== 'rent' && parseInt(object.price) > 0 ?
                    <p className='mortgagePay'>
                      <b>В ипотеку</b>:&nbsp;
                      <Price className='mortgagePay'
                        price={mortgagePay}> <PriceUnit>/мес</PriceUnit>
                      </Price>
                    </p> : null)}
                  </Col>
                </Row>
                {this.locationLink}
              </Col>
              <Col xs={5}>
                <div className='objects--item__nomap--img'>
                  {object.status === 'active' ?
                    <a href={location} target='_blank'>
                      <Image draggable={false}
                        className='img-responsive' {...imageProps}/>
                    </a> :
                    <span>
                      <Image className='img-responsive' {...imageProps}/>
                    </span>
                  }
                </div>
              </Col>
            </div>
          </Col>
        </div>
      </Col>
    );
  }
}

export default LKSearchItemObject;
