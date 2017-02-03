import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {getAdress} from '../../utils/Helpers';
import FavButton from '../../shared/FavButton';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import Image from '../../shared/Image';

class SaleSliderItem extends Component {
  static propTypes = {
    favorites: React.PropTypes.number,
    showMortgage: React.PropTypes.string
  };

  render() {
    const props = this.props;
    const {showMortgage} = this.props;

    const href = `/realty/${props.slide.object_id}`;
    let title, area, discount, discountPerc;
    let address = '', price = '', mortgage;

    if(props.slide.old_price &&
      parseInt(props.slide.old_price) > parseInt(props.slide.price) &&
    parseInt(props.slide.price) > 0) {
      const discountAmount = parseInt(props.slide.old_price);

      discount =
        (<div className='obj-discount'>
          <Price price={discountAmount}
            className='obj-discount-ammount discount-crossed'>
            &nbsp;<PriceUnit className='obj-discount-unit'/>
          </Price>
        </div>);
      discountPerc = <div className="objects--item__nomap--installment" />;
    } else {
      discount = (<div className='obj-discount'>
        <span className='obj-discount-ammount'>&nbsp;</span>
        <span>&nbsp;</span>
      </div>);
      discountPerc = '';
    }

    mortgage = <span className="obj-mortgage btn" />;

    const imageProps = {
      image: props.slide.main_photo,
      visual: props.slide.visual,
      width: 300,
      height: 267
    };

    price =
      (<div className="obj-price">
        <Price className="obj-price-ammount" price={props.slide.price}/>
        {parseInt(props.slide.price) > 0 ?
          <span>&nbsp;<PriceUnit/></span> : <span />}
      </div>);

    switch(props.addrMode) {
    case 'intersection':
      address = props.slide.street_intersection &&
        props.slide.street_intersection !== '0' ?
        props.slide.street_intersection : '';
      break;
    case 'address':
      address = getAdress(props.slide.district,
        props.slide.street,
        props.slide.class === 'flats' ? props.slide.house : null);
      break;
    case 'street':
      address = props.slide.street && props.slide.street !== '0' ?
        props.slide.street : '';
      break;
    case 'addrIntersec':
      address = props.slide.house_num ? getAdress(props.slide.district,
        props.slide.street,
        props.slide.class === 'flats' ? props.slide.house_num : null) :
        props.slide.street_intersection;
      break;
    default:
      address = '';
    }

    switch(props.slide.class) {
    case 'flats' :
      title = `${props.slide.rooms}-КОМНАТНАЯ КВАРТИРА`;
      area =
        (<div className="obj-area">
          <span className="obj-area-ammount">{props.slide.square}</span>
          <span>&nbsp;м<sup>2</sup></span>
        </div>);
      mortgage = parseInt(props.slide.price) > 0 ?
        (<span className="obj-mortgage btn">
        <span>В ипотеку:</span><br />
        <Price className="obj-mortgage-pay"
          price={props.slide.mortgage_pay}>&nbsp;
          <PriceUnit>/мес</PriceUnit>
        </Price>
      </span>) : <span className="obj-mortgage btn"/>;
      break;
    case 'cottages' :
      switch(props.slide.type) {
      case 'land' :
        title = 'УЧАСТОК';
        area = (<div className="obj-area">
          <span className="obj-area-ammount">{props.slide.area_land}</span>
          <span>&nbsp;сот.</span>
        </div>);
        break;
      case 'townhouse' :
        title = 'ТАУНХАУС';
        area = (<div className="obj-area">
          <span className="obj-area-ammount">{props.slide.area_house}</span>
          <span>&nbsp;м<sup>2</sup></span>
        </div>);
        break;
      case 'house' :
        title = 'ДОМ';
        area = (<div className="obj-area">
          <span className="obj-area-ammount">{props.slide.area_house}</span>
          <span>&nbsp;м<sup>2</sup></span>
        </div>);
        break;
      case 'garden' :
        title = 'ДАЧА';
        area = (<div className="obj-area">
          <span className="obj-area-ammount">{props.slide.area_house}</span>
          <span>&nbsp;м<sup>2</sup></span>
        </div>);
        break;
      case 'cottage' :
        title = 'КОТТЕДЖ';
        area = (<div className="obj-area">
          <span className="obj-area-ammount">{props.slide.area_house}</span>
          <span>&nbsp;м<sup>2</sup></span>
        </div>);
        break;
      default:
      //do nothing
      }
      break;
    case 'newhouses' :
      title = props.slide.gp_short;
      area = <span>Площадь: {props.slide.street_intersection}</span>;
      break;
    default:
    //do nothing
    }

    const favButton = this.props.favorites ? (
      <FavButton
        className='btn-fav-inslider'
        oclass={props.slide.class}
        oid={props.slide.object_id}
      />
    ) : '';

    const addressfull = address;

    if(address.length > 50) {
      address = `${address.slice(0, 50)}...`;
    }

    return (
      <div className="newhouses-list-item">
        <p className="obj-name">
          <a target="_blank" href={href}>{title}</a>
        </p>
        <div className="obj-img">
          <a target="_blank" href={href}>
            <Image {...imageProps}/>
          </a>
          {discountPerc}
          {favButton}
        </div>
        <div className="obj-data">
          <div className='obj-address' title={addressfull}>
            {address}
          </div>
          {area}
          {discount}
          {price}
        </div>
        <div className="btn-group btn-group-justified">
          {showMortgage === '1' ? mortgage : null}
          <a className="btn btn-more" target="_blank" href={href} role="button">
            Подробнее
          </a>
        </div>
        <div className="clear" />
      </div>
    );
  }
}

export default SaleSliderItem;
