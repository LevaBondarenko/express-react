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
import SearchSlider from './SearchSlider';
import FavButton from '../../shared/FavButton';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import ItemDescription from '../SearchLayout/ItemDescription';
/**
 * Bootstrap 3 elements
 */
import Col from 'react-bootstrap/lib/Col';
/* global data */

class CommerceLeaseItemTable extends Component {
  static propTypes = {
    house: PropTypes.object,
    favorites: PropTypes.number,
    source: PropTypes.number,
    showCity: PropTypes.bool,
    showSlider: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
  }

  render() {
    const {house, favorites, showCity} = this.props;
    const imageProps = {
      image: house.main_photo,
      visual: house.visual,
      width: 300,
      height: 267
    };

    const pageType = 'commerce';
    const location = `/${pageType}/${house.object_id}`;

    const title = house.type_ru ? Helpers.capitalizeString(house.type_ru) :
      'коммерческая недвижимость';


    let adress = Helpers.getAdress(
      house.district, house.street, house.house_num
    );

    if (showCity && data.collections.cities &&
    data.collections.cities[house.city_id]) {
      adress = `${data.collections.cities[house.city_id].name}, ${adress}`;
    }

    const favButton = favorites ? (
      <FavButton
        key={house.class + house.object_id}
        className='btn-fav-insearchlayout'
        oclass={house.class}
        oid={house.object_id}
      />
    ) : null;

    const media = JSON.parse(this.props.house.media);
    const photoCount = media ? media[`${house.visual}s`] : null;

    return (
      <Col xs={12}>
      <div className='objects--item__nomap clearfix' ref={house.id}>
        {(parseInt(house.old_price) > 0 &&
          parseInt(house.old_price) > parseInt(house.price) ?
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
            <Price price={house.price} className='item--price pull-right'>
              &nbsp;<PriceUnit/><br/>
            {(parseInt(house.old_price) > 0 &&
              parseInt(house.old_price) > parseInt(house.price) ?
              <Price price={house.old_price}
                className='item--oldprice strikethrough'>
                &nbsp;<PriceUnit/>
              </Price> : null)}
            </Price>
            <p className='col-xs-9 adress' style={{paddingLeft: 0}}>
              <span className="glyphicon glyphicon-map-marker"
                aria-hidden="true" />
              {adress}
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


export default CommerceLeaseItemTable;
