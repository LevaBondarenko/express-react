import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {getAdress} from '../../utils/Helpers';
import Image from '../../shared/Image';
import FavButton from '../../shared/FavButton';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';

class OfficesSliderItem extends Component {
  render() {
    const props = this.props;
    const {showMortgage} = this.props;

    const href = `/commerce/${props.slide.object_id}`;
    const mortgage = <span className="obj-mortgage btn" />;
    let title, area, discount, discountPerc;
    let address = '', price = '';

    if(props.slide.old_price &&
      parseInt(props.slide.old_price) > parseInt(props.slide.price)) {
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

    const imageProps = {
      image: props.slide.main_photo,
      visual: props.slide.visual,
      width: 300,
      height: 267
    };

    price =
      (<div className="obj-price">
        <Price className="obj-price-ammount" price={props.slide.price}/>
        <span>&nbsp;<PriceUnit/></span>
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
        props.slide.class === 'offices' ? props.slide.house : null);
      break;
    case 'street':
      address = props.slide.street && props.slide.street !== '0' ?
        props.slide.street : '';
      break;
    case 'addrIntersec':
      address = props.slide.house_num ? getAdress(props.slide.district,
        props.slide.street,
        props.slide.class === 'offices' ? props.slide.house_num : null) :
        props.slide.street_intersection;
      break;
    default:
      address = '';
    }

    switch(props.slide.type) {
    case 'dev' :
      title = 'ПРОИЗВОДСТВО';
      area = (<div className="obj-area">
        <span className="obj-area-ammount">{props.slide.square}</span>
        <span>&nbsp;м<sup>2</sup></span>
      </div>);
      break;
    case 'base' :
      title = 'БАЗА';
      area = (<div className="obj-area">
        <span className="obj-area-ammount">{props.slide.square}</span>
        <span>&nbsp;м<sup>2</sup></span>
      </div>);
      break;
    case 'busines' :
      title = 'ГОТОВЫЙ БИЗНЕС';
      area = (<div className="obj-area">
        <span className="obj-area-ammount">{props.slide.square}</span>
        <span>&nbsp;м<sup>2</sup></span>
      </div>);
      break;
    case 'office' :
      title = 'ОФИС';
      area = (<div className="obj-area">
        <span className="obj-area-ammount">{props.slide.square}</span>
        <span>&nbsp;м<sup>2</sup></span>
      </div>);
      break;
    case 'torg' :
      title = 'ТОРГОВОЕ';
      area = (<div className="obj-area">
        <span className="obj-area-ammount">{props.slide.square}</span>
        <span>&nbsp;м<sup>2</sup></span>
      </div>);
      break;
    case 'other' :
      title = 'СВОБОДНОЕ НАЗНАЧЕНИЕ';
      area = (<div className="obj-area">
        <span className="obj-area-ammount">{props.slide.square}</span>
        <span>&nbsp;м<sup>2</sup></span>
      </div>);
      break;
    case 'sklad' :
      title = 'СКЛАД';
      area = (<div className="obj-area">
        <span className="obj-area-ammount">{props.slide.square}</span>
        <span>&nbsp;м<sup>2</sup></span>
      </div>);
      break;
    case 'land' :
      title = 'ЗЕМЛЯ';
      area = (<div className="obj-area">
        <span className="obj-area-ammount">{props.slide.square}</span>
        <span>&nbsp;м<sup>2</sup></span>
      </div>);
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

OfficesSliderItem.propTypes = {
  favorites: React.PropTypes.number,
  showMortgage: React.PropTypes.string
};

export default OfficesSliderItem;
