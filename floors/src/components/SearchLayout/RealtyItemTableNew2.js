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

import FavButton from '../../shared/FavButton';
import CompareButton from '../../shared/CompareButton';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import ItemDescription from '../SearchLayout/ItemDescription';
import Image from '../../shared/Image';
import SearchSlider from './SearchSlider';
import Rating from '../../shared/Rating';
import ga from '../../utils/ga';
import moment from 'moment';
import classNames from 'classnames';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Popover from 'react-bootstrap/lib/Popover';
/**
 * Bootstrap 3 elements
 */
import Col from 'react-bootstrap/lib/Col';

/* global data */

class RealtyItemTableNew2 extends Component {
  static propTypes = {
    house: PropTypes.object,
    favorites: PropTypes.number,
    source: PropTypes.number,
    layoutType: PropTypes.string,
    showCity: PropTypes.bool,
    ratings: PropTypes.any,
    showSlider: PropTypes.bool,
    saleWhatIt: PropTypes.string,
    saleDate: PropTypes.string,
    saleHTML: PropTypes.string,
    saleBackground: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
  }

  toggleVisibility(event) {
    this.setState(() => ({visible: !this.state.visible}));

    event.preventDefault();
  }

  get housePrice() {
    const {house} = this.props;

    return house.price_m2_only ? house.price_m2 : house.price;
  }

  get priceOnly() {
    const {house} = this.props;

    return house.price_m2_only ? <span> / м<sup>2</sup></span> : null;
  }

  render() {
    const {house, favorites, showCity, layoutType, ratings,
       saleHTML, saleBackground, saleDate} = this.props;
    const imageProps = {
      image: house.main_photo,
      visual: house.visual,
      width: 300,
      height: 267
    };

    const pageType = layoutType !== 'rent' ? 'realty' : 'realty_rent';
    const location = `/${pageType}/${house.object_id}`;

    const title = house.type !== 'flat' ?
      (house.type_ru ? Helpers.capitalizeString(house.type_ru) : 'квартира') :
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
        oclass={layoutType === 'rent' ? 'rent' : house.class}
        oid={house.object_id}
      />
    ) : null;

    const compareButton = favorites && parseInt(house.price) > 0 ? (
      <CompareButton
        key={`review${house.class}${house.object_id}`}
        className='btn-fav-infavmodule'
        oclass={layoutType === 'rent' ? 'rent' : house.class}
        oid={house.object_id}
        withTitle={true}
      />
    ) : null;

    const toCenter = (house.la && house.lo &&
    parseFloat(house.la) && parseFloat(house.lo)) ? (
      <span className='adress--tocenter'>
        ({Math.round(house.to_center * 10) / 10} км от центра города)
      </span>
    ) : null;

    const media = JSON.parse(this.props.house.media);
    const photoCount = media ? media[`${house.visual}s`] : null;
    const priceFair = house.price_fair &&
     +house.price_fair < +house.price ? house.price_fair : false;
    const saleDateArr = saleDate ? saleDate.split('-') : false;
    let isSaleTrue, saleText, saleOverlay;

    if (saleDateArr.length > 0 && priceFair) {
      const saleMinDay = moment(saleDateArr[0], 'DD-MM-YYYY').isValid() ?
       moment(saleDateArr[0], 'DD-MM-YYYY').format('YYYY-MM-DD') : null;
      const saleMaxDay = saleDateArr[1] &&
       moment(saleDateArr[1], 'DD-MM-YYYY').isValid() ?
       moment(saleDateArr[1], 'DD-MM-YYYY').format('YYYY-MM-DD') : null;
      const now = moment().format('YYYY-MM-DD');

      // немного второпях
      if(saleDateArr.length === 1) {
        isSaleTrue = now === saleMinDay ?
         true : false;
      }else if(saleDateArr.length === 2) {
        isSaleTrue = now >= saleMinDay &&
          now <= saleMaxDay ? true : false;
      }
      saleText = {__html: saleHTML};
      saleOverlay = this.props.saleWhatIt !== '' &&
       this.props.saleWhatIt != null ? (
        <div className='liquidity_block_value'>
          <OverlayTrigger
            placement='right'
            ref='question'
            overlay={
              <Popover id='devcontent' className="noticeFlat">
                {this.props.saleWhatIt}
              </Popover>
            }>
            <span className='tooltip_icon tooltip-icon__question' />
          </OverlayTrigger>
        </div>
      ) : null;
    }

    return (
      <Col xs={12}>
        <div className='objects--item__nomap clearfix' ref={house.id}>
          {(parseInt(house.old_price) > 0 &&
          parseInt(house.old_price) > parseInt(house.price) &&
          parseInt(house.price) > 0  ?
            <div className="objects--item__nomap--wrapper">
              <div className='objects--item__nomap--installment' />
            </div> : null)}
          <Col xs={4}>
            <div className='objects--item__nomap--img'>
              {
                this.props.showSlider && photoCount > 1 ? (
                  <SearchSlider imageProps={imageProps}
                                object={this.props.house}
                                location={location} />
                ) : (
                  <div className="searchRealtyItem_image">
                    <a href={location} target='_blank'>
                      <Image {...imageProps}/>
                    </a>
                  </div>
                )
              }
            </div>
            <div className='objects--item__nomap--mortgage' />
          </Col>
          <Col xs={8}> {isSaleTrue && saleDateArr ?
              (<div className='objects--item__sale'
                style={{
                  background: `url(${saleBackground}) no-repeat 100% 100%`}}>
                <span className='objects--item__sale_html'
                  dangerouslySetInnerHTML={saleText}>
                </span>
                {saleOverlay}
              </div>) : null}
              <div style={{position: 'relative'}}>
            <div className='objects--item__nomap--title clearfix'>
              <h3 className='pull-left col-xs-8'>
                <a href={location} target='_blank' onClick={() => {
                  ga('link', 'site_search_card_detail');
                }}>
                  <b>{title}</b>
                </a>
                {favButton}
                {compareButton}
              </h3>
              <Price price={
                        priceFair && isSaleTrue ? priceFair : this.housePrice}
                     shortRequest={false}
                     className={classNames(
                         {'red': priceFair && isSaleTrue ? true : false},
                       'item--price', 'pull-right')}>
                &nbsp;<PriceUnit/>{this.priceOnly}<br/>
                {(parseInt(house.old_price) > 0 &&
                parseInt(house.old_price) > parseInt(house.price) ?
                  <Price price={ house.old_price}
                         className='item--oldprice strikethrough'>
                    &nbsp;<PriceUnit/>
                </Price> : (priceFair && isSaleTrue ?
                  <Price price={house.price}
                         className='item--oldprice ultra-black strikethrough'>
                    &nbsp;<PriceUnit/>
                </Price> : null))}
              </Price>
              <Rating id={house.object_id}
                      content={house.ratings}
                      popoverContainer={this}
                      popoverPlacement='bottom'
                      showLink='1'
                      className='ratingLayout'
                      {...this.props}
                      show={ratings} />
              <p className='col-xs-9 adress' style={{paddingLeft: 0}}>
              <span className='glyphicon glyphicon-map-marker'
                    aria-hidden='true' />
                {adress}
                {toCenter}
              </p>
            </div>
            <div className='objects--item__nomap--content clearfix'>
              <ItemDescription {...this.props}
                priceFair={priceFair}
                isSaleTrue={isSaleTrue}
                container={this}
                location={location}/>
            </div>
            </div>
          </Col>
        </div>
      </Col>
    );
  }
}


export default RealtyItemTableNew2;
