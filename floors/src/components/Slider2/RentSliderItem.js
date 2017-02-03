import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {getAdress} from '../../utils/Helpers';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import Image from '../../shared/Image';

class RentSliderItem extends Component {
  render() {
    const props = this.props;
    const href = `/realty_rent/${props.slide.object_id}`;
    let title, area;
    let address = '', price = '';

    const imageProps = {
      image: props.slide.main_photo,
      visual: props.slide.visual,
      width: 300,
      height: 267
    };

    price =
      (<div className="obj-price">
        <Price className="obj-price-ammount" price={props.slide.price}/>
        &nbsp;<PriceUnit> в мес.</PriceUnit>
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
        `ул. ${props.slide.street}` : '';
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

    switch(props.slide.type) {
    case 'flat' :
      title = `${props.slide.rooms}-КОМНАТНАЯ КВАРТИРА`;
      area =
        (<div className="obj-area">
          <span className="obj-area-ammount">{props.slide.square}</span>
          <span>&nbsp;м<sup>2</sup></span>
        </div>);
      break;
    default:
      title = props.slide.type_ru.toUpperCase();
      area =
        (<div className="obj-area">
          <span className="obj-area-ammount">{props.slide.square}</span>
          <span>&nbsp;м<sup>2</sup></span>
        </div>);
      break;
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
        </div>
        <div className="obj-data">
          <div className='obj-address' title={addressfull}>
            {address}
          </div>
          {area}
          <div className="obj-discount"></div>
          {price}
        </div>
        <div className="btn-group btn-group-justified btn-group-rent">
          <a className="btn btn-more"
             target="_blank"
             href={href}
             role="button">
            Подробнее
          </a>
        </div>
        <div className="clear" />
      </div>
    );
  }
}

export default RentSliderItem;
