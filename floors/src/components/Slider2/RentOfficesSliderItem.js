import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {getAdress} from '../../utils/Helpers';
import Image from '../../shared/Image';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';

class RentOfficesSliderItem extends Component {
  render() {
    const props = this.props;
    const href = `/commerce/${props.slide.object_id}`;
    let title, area, discountPerc;
    let address = '', price = '';

    const imageProps = {
      image: props.slide.main_photo,
      visual: props.slide.visual,
      width: 300,
      height: 267
    };

    price =
      (<div className="obj-price-rent">
        <Price className="obj-price-rent-ammount" price={props.slide.price}/>
        &nbsp;<PriceUnit className='obj-price-rent-text'> в мес.</PriceUnit>
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
        `ул. ${props.slide.street}` : '';
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
      area = (<div className="obj-area-rent">
        <span className="obj-area-rent-ammount">{props.slide.square}</span>
        <span>&nbsp;м<sup>2</sup></span>
      </div>);
      break;
    case 'base' :
      title = 'БАЗА';
      area = (<div className="obj-area-rent">
        <span className="obj-area-rent-ammount">{props.slide.square}</span>
        <span>&nbsp;м<sup>2</sup></span>
      </div>);
      break;
    case 'busines' :
      title = 'ГОТОВЫЙ БИЗНЕС';
      area = (<div className="obj-area-rent">
        <span className="obj-area-rent-ammount">{props.slide.square}</span>
        <span>&nbsp;м<sup>2</sup></span>
      </div>);
      break;
    case 'office' :
      title = 'ОФИС';
      area = (<div className="obj-area-rent">
        <span className="obj-area-rent-ammount">{props.slide.square}</span>
        <span>&nbsp;м<sup>2</sup></span>
      </div>);
      break;
    case 'torg' :
      title = 'ТОРГОВОЕ';
      area = (<div className="obj-area-rent">
        <span className="obj-area-rent-ammount">{props.slide.square}</span>
        <span>&nbsp;м<sup>2</sup></span>
      </div>);
      break;
    case 'other' :
      title = 'СВОБОДНОЕ НАЗНАЧЕНИЕ';
      area = (<div className="obj-area-rent">
        <span className="obj-area-rent-ammount">{props.slide.square}</span>
        <span>&nbsp;м<sup>2</sup></span>
      </div>);
      break;
    case 'sklad' :
      title = 'СКЛАД';
      area = (<div className="obj-area-rent">
        <span className="obj-area-rent-ammount">{props.slide.square}</span>
        <span>&nbsp;м<sup>2</sup></span>
      </div>);
      break;
    case 'land' :
      title = 'ЗЕМЛЯ';
      area = (<div className="obj-area-rent">
        <span className="obj-area-rent-ammount">{props.slide.square}</span>
        <span>&nbsp;м<sup>2</sup></span>
      </div>);
      break;
    default:
    //do nothing
    }

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
        </div>
        <div className="obj-data-rent">
          <div className='obj-address-rent' title={addressfull}>
            {address}
          </div>
          {area}
          {price}
        </div>
        <div className="btn-group btn-group-justified">
          <a className="btn btn-more" target="_blank" href={href} role="button">
            Подробнее
          </a>
        </div>
        <div className="clear" />
      </div>
    );
  }
}

export default RentOfficesSliderItem;
