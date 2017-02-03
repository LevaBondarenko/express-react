import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {declOfNum} from '../../utils/Helpers';
import Image from '../../shared/Image';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';

class CottagesSliderItem extends Component {
  render() {
    const props = this.props;
    const href = `/realty_out/${props.slide.object_id}`;
    let price = '';

    const imageProps = {
      image: props.slide.main_photo,
      visual: props.slide.visual,
      width: 300,
      height: 267
    };

    price =
      (<div className="obj-price">
        <Price price={props.slide.price} className="obj-price-out-ammount"/>
        <span>&nbsp;<PriceUnit/></span>
      </div>);

    const title = props.slide.district;
    const area =
      (<div className="obj-area-out">
        <span
          className="obj-area-ammount realty_out">
          {Math.round(props.slide.area_land)}
          &nbsp;
          {declOfNum(props.slide.area_land, ['сотка', 'сотки', 'соток'])}
        </span>
      </div>);

    const toCenter = parseInt(props.slide.tocenter) !== 0 ? (
      <div>До города:&nbsp;
              <span className='realty-out-address-black'>
                {props.slide.tocenter} км
              </span>
      </div>
    ) : (
      <div></div>
    );
    const trakt = parseInt(props.slide.trakt) !== 0 ? (
      <div>Тракт:&nbsp;
                  <span className='realty-out-address-black'>
                    {props.slide.trakt}
                  </span>
      </div>
    ) : <div/>;

    return (
      <div className="newhouses-list-item">
        <p className="obj-name-realty-out">
          <a target="_blank" href={href}>{title}</a>
        </p>
        <div className="obj-img">
          <a target="_blank" href={href}>
            <Image {...imageProps}/>
          </a>
        </div>
        <div className="obj-data">
          <div className='realty-out-address'>
            {trakt}
            {toCenter}
            <div>
              За сотку:&nbsp;
              <Price
                price={Math.round(props.slide.price / props.slide.area_land)}
                className='realty-out-address-black'>&nbsp;
                <PriceUnit/>
              </Price>
            </div>
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

export default CottagesSliderItem;
