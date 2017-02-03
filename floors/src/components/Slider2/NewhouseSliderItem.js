import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {getAdress, shorten} from '../../utils/Helpers';
import Image from '../../shared/Image';
import FavButton from '../../shared/FavButton';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';


class NewhouseSliderItem extends Component {
  static propTypes = {
    favorites: React.PropTypes.number,
    discount: React.PropTypes.number,
    addrMode: React.PropTypes.string
  };

  render() {
    const props = this.props;
    let  address;
    const gp = props.slide.gp ? props.slide.gp.replace(/&quot;/g, '') : '';
    const mainPhoto = props.slide.main_photo ?
      props.slide.main_photo.replace('/photos/', '') : 'no_photo';
    const deadline = props.slide.ondeadline ? (
      <span className="nh-deadline">
        <span>Дом сдан</span>
      </span>
    ) : (
      <span className="nh-deadline">
        <span>Срок сдачи: </span>
        {props.slide.deadline_q}
        <span> квартал </span>
        {props.slide.deadline_y}
        <span> года </span>
      </span>
    );

    switch(props.addrMode) {
    case 'intersection':
      address = props.slide.street_intersection &&
        props.slide.street_intersection !== '0' ?
        props.slide.street_intersection : '';
      break;
    case 'address':
      address = getAdress(props.slide.district,
        props.slide.street,
        props.slide.house);
      break;
    case 'street':
      address = props.slide.street && props.slide.street !== '0' ?
        props.slide.street : '';
      break;
    case 'addrIntersec':
      address = props.slide.house ? getAdress(props.slide.district,
        props.slide.street, props.slide.house) :
        props.slide.street_intersection;
      break;
    default:
      address = '';
    }

    const action = props.discount && parseInt(props.slide.max_discount) > 0 ?
      <div className='objects--item__nomap--installment' /> : null;

    const href = props.slide.slugUrl ?
      props.slide.slugUrl :
      `/zastr/jk/?gk=${props.slide.id}`;

    const imageProps = {
      image: mainPhoto,
      visual: 'photos',
      width: 300,
      height: 267
    };

    props.slide.min_price = props.slide.min_price || 0; // eslint-disable-line camelcase
    const favButton = this.props.favorites ? (
      <FavButton
        style={{top: '1rem', left: '1rem'}}
        oclass={props.slide.class}
        oid={props.slide.id}
      />
    ) : '';

    return (
      <div className="newhouses-list-item">
          <p className="gp-name">
            <a target="_blank" href={href} title={gp}>{shorten(gp, 45)}</a>
          </p>
          <div className="obj-img">
            <a target="_blank" href={href}>
              <Image {...imageProps}/>
            </a>
            {favButton}
            {action}
          </div>
          <p className="nw-data" style={{minHeight: '6rem', height: '6rem'}}>
              <span className="nh-street">{address}</span>
              {deadline}
          </p>
          <p className="min-price">
            от <Price price={props.slide.min_price}> <PriceUnit/></Price>
          </p>
          <div className="btn-group btn-group-justified">
              <a className="btn btn-more" target="_blank"
                href={href} role="button">Подробнее
              </a>
          </div>
      </div>
    );
  }
}

export default NewhouseSliderItem;
