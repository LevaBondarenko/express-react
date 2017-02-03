/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
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


class RealtyOutItemTable extends Component {
  static propTypes = {
    house: PropTypes.object,
    favorites: PropTypes.number,
    source: PropTypes.number,
    showSlider: PropTypes.bool
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
    const {house, favorites} = this.props;
    const state = this.state;
    const imageProps = {
      image: house.main_photo,
      visual: house.visual,
      width: 300,
      height: 267
    };

    const location = `/realty_out/${house.object_id}`;
    const {trakt, district} = house;
    const textAction = {__html: house.action_description};
    const title = house.type_ru +
      (district && district !== '0' ? `, ${district}` : '');
    /* global data */
    const cityName = data.collections.cities[data.options.cityId].name;
    const adress = cityName === trakt ? 'В черте города' :
      trakt && trakt !== '0' ? trakt : '';

    const favButton = favorites ? (
      <FavButton
        key={house.class + house.object_id}
        style={{
          position: 'relative',
          display: 'inline-block',
          marginLeft: '1rem',
          marginTop: '-1rem',
          top: '-.3rem'
        }}
        oclass={house.class}
        oid={house.object_id}
      />
    ) : null;

    const distance = parseInt(house.tocenter) !== 0 ?
      `${Math.round(house.tocenter * 10) / 10} км от центра города` :
      'В черте города';

    const toCenter = (
      <span className='adress--tocenter'>
        ({distance})
      </span>);

    const media = JSON.parse(this.props.house.media);
    const photoCount = media ? media['photos'] : null;

    return (
      <Col xs={12}>
      <div className={(state.visible ?
        'objects--item__nomap clearfix object-active' :
        'objects--item__nomap clearfix')} ref={house.id}>
        {(house.action_description ?
          <div className="objects--item__nomap--wrapper">
            <div className='objects--item__nomap--installment'
            onClick={this.toggleVisibility.bind(this)}></div>
            <div className="objects--item__nomap--installment__content">
              <div className="objects--item__nomap--installment__arrow"/>
              <div dangerouslySetInnerHTML={textAction} />
            </div>
          </div> : null)}
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
              <span className={adress ? 'glyphicon glyphicon-map-marker' : ''}
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


export default RealtyOutItemTable;
