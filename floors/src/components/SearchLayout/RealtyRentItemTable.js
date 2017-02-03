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
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import ItemDescription from '../SearchLayout/ItemDescription';
import SearchSlider from './SearchSlider';
import Rating from '../../shared/Rating';

import Image from '../../shared/Image';
/**
 * Bootstrap 3 elements
 */
import Col from 'react-bootstrap/lib/Col';

/* global data */

class RealtyRentItemTable extends Component {
  static propTypes = {
    house: PropTypes.object,
    favorites: PropTypes.number,
    source: PropTypes.number,
    realtyType: PropTypes.string,
    showCity: PropTypes.bool,
    showSlider: PropTypes.bool,
    ratings: PropTypes.number,
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    })
  };
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
  }

  toggleVisibility(event) {
    event.preventDefault();
    if (!this.state.visible) {
      this.setState(() => ({visible: true}));
    } else {
      this.setState(() => ({visible: false}));
    }
  }

  render() {
    const {house, favorites, showCity, realtyType} = this.props;
    const imageProps = {
      image: house.main_photo,
      visual: house.visual,
      width: 300,
      height: 267
    };

    const pageType = realtyType !== 'rent' ? 'realty' : 'realty_rent';
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
        oclass={realtyType === 'rent' ? 'rent' : house.class}
        oid={house.object_id}
      />
    ) : null;

    const toCenter = (house.la && house.lo &&
      parseFloat(house.la) && parseFloat(house.lo)) ? (
        <span className='adress--tocenter'>
          ({Math.round(house.to_center * 10) / 10} км от центра города)
        </span>
      ) : null;

    const media = JSON.parse(this.props.house.media);
    const photoCount = media ? media['photos'] : null;

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
        <Col xs={8}>
          <div className='objects--item__nomap--title clearfix'>
            <h3 className='pull-left col-xs-8'>
              <a href={location} target='_blank'>
                <b>{title}</b>
              </a>
              {favButton}
            </h3>
            <Price price={house.price} shortRequest={false}
              className='item--price pull-right'>
              &nbsp;<PriceUnit/><br/>
            {(parseInt(house.old_price) > 0 &&
              parseInt(house.old_price) > parseInt(house.price) ?
              <Price price={house.old_price}
                className='item--oldprice strikethrough'>
                &nbsp;<PriceUnit/>
              </Price> : null)}
            </Price>
            <Rating id={house.object_id}
                    content={house.ratings}
                    popoverContainer={this}
                    popoverPlacement='bottom'
                    context={this.props.context}
                    {...this.props}
                    showLink='1'
                    className='ratingLayout'
                    show={this.props.ratings}/>
            <p className='col-xs-9 adress' style={{paddingLeft: 0}}>
              <span className="glyphicon glyphicon-map-marker"
                aria-hidden="true" />
              {adress}
              {toCenter}
            </p>
          </div>
          <div className='objects--item__nomap--content clearfix'>
              <ItemDescription {...this.props} location={location}/>
          </div>
        </Col>
      </div>
      </Col>
    );
  }
}


export default RealtyRentItemTable;
