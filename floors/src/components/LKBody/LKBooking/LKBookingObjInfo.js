/**
 * LK Booking Object Info component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {capitalizeString, getTitle, getAdress} from 'etagi-helpers';
import SearchSlider from '../../SearchLayout/SearchSlider';
import Image from '../../../shared/Image';
import Price from '../../../shared/Price';
import PriceUnit from '../../../shared/PriceUnit';
/**
 * Bootstrap 3 elements
 */
import Col from 'react-bootstrap/lib/Col';

import s from './style.scss';

/*global data*/

class LKBookingObjInfo extends Component {
  static propTypes = {
    obj: PropTypes.object,
    disableSlider: PropTypes.bool
  };

  static defaultProps = {
    disableSlider: false
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {obj} = this.props;
    const imageProps = {
      image: obj.main_photo,
      visual: obj.visual,
      width: 240,
      height: 160
    };
    const media = JSON.parse(obj.media);
    const photoCount = media ? media['photos'] : null;
    const location = `/realty_rent/${obj.object_id}`;
    const title = obj.type !== 'flat' ?
      (obj.type_ru ? capitalizeString(obj.type_ru) : 'квартира') :
      getTitle(obj.rooms);

    let address = getAdress(
      obj.district, obj.street, obj.house_num
    );

    address = `${data.collections.cities[obj.city_id].name}, ${address}`;
    obj.class = 'flats';

    return (
      <Col xs={5} className={s.bookingObjectInfo}>
        <Col xs={5}>
          {
            photoCount > 1 && !this.props.disableSlider ? (
              <SearchSlider imageProps={imageProps}
                            object={obj}
                            location={location} />
            ) : (
              <div>
                <a href={location} target='_blank'>
                  <Image className='searchRealtyItem_image' {...imageProps}/>
                </a>
              </div>
            )
          }
        </Col>
        <Col xs={7}>
          <h3 className={s.bookingObjTitle}>
            <a href={location} target='_blank'><b>{title}</b></a>
          </h3>
          <div className={s.bookingObjParams}>
            {(obj.price ? (
              <p>
                <b>Стоимость</b>:&nbsp;
                <Price price={obj.price}> <PriceUnit/>/мес.</Price>
              </p>
            ) : null)}
            {(obj.square ?
              <p><b>Площадь</b>: {obj.square} м<sup>2</sup></p> :
              null)}
            {(obj.floor && obj.floors ?
              <p><b>Этаж/Этажность</b>: {obj.floor}/{obj.floors}</p> :
              null)}
          </div>
          <p className={s.bookingObjAddress}>
            <i className="glyphicon glyphicon-map-marker"
              aria-hidden="true" />
            {address}
          </p>
        </Col>
      </Col>
    );
  }
}

export default withStyles(s)(LKBookingObjInfo);
