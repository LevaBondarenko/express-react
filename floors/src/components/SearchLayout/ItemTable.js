
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

import {toArray, forEach} from 'lodash';

import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';

import {locationSlugUrl, locationUrl} from '../../utils/Helpers';

import {getMin} from  '../../utils/filterUtils';
import HouseTable from '../SearchLayout/HouseTable';
import ItemTableDescription from '../SearchLayout/ItemTableDescription';

import Image from '../../shared/Image';
import SearchSlider from './SearchSlider';
import mss from '../../stores/ModularSearcherStore';
/**
 * Bootstrap 3 elements
 */
import Col from 'react-bootstrap/lib/Col';

class ItemTable extends Component {
  static propTypes = {
    house: PropTypes.object.isRequired,
    dataUrl: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object
    ]),
    id: PropTypes.string,
    flatsData: PropTypes.object,
    favorites: PropTypes.number,
    source: PropTypes.number,
    hideFlatInfo: PropTypes.string,
    showSlider: PropTypes.bool,
    context: PropTypes.object,
    url: PropTypes.object
  };

  constructor(props) {
    super(props);
  }

  getFlatInfo = (priceMinItem, flatsData, locationUrl) => {
    let HouseTableData;
    let MinFlatPriceHTML = <span className='item--price pull-right' />;

    if (typeof this.props.hideFlatInfo === 'undefined' ||
        parseInt(this.props.hideFlatInfo) === 0) {
      MinFlatPriceHTML = (
          <span className='item--price pull-right'>
            <span>от </span><Price price={priceMinItem}> <PriceUnit/></Price>
          </span>
      );
      HouseTableData = (
          <HouseTable flats={flatsData} location={locationUrl}/>
      );
    }
    return {
      MinFlatPriceHTML: MinFlatPriceHTML,
      HouseTableData: HouseTableData
    };
  }

  getLocation() {
    const {house, id} = this.props;
    const dataUrl = [];
    const obj = mss.get();

    obj.rooms && forEach(obj.rooms, room => {
      dataUrl.push({
        rooms: room
      });
    });

    obj['square_min'] && dataUrl.push({
      'square_min': obj['square_min']
    });

    obj['square_max'] && dataUrl.push({
      'square_max': obj['square_max']
    });

    obj['price_min'] && dataUrl.push({
      'price_min': obj['price_min']
    });

    obj['price_max'] && dataUrl.push({
      'price_max': obj['price_max']
    });

    return house.slugUrl ?
      locationSlugUrl(house.slugUrl, dataUrl) :
      locationUrl(id, dataUrl);
  }

  render() {
    const {house, flatsData} = this.props;

    const sections = Object.keys(house.flats);
    const visual = house.flats[sections[0]][0].visual;
    const media = JSON.parse(house.flats[sections[0]][0].media);
    const imageProps = {
      image: house.main_photo.replace('/photos/', ''),
      visual: visual,
      width: 300,
      height: 267
    };

    const priceMinItem = getMin('price', toArray(flatsData), true);
    const textAction = {__html: house.action_description};
    // const location = house.slugUrl ?
    //   locationSlugUrl(house.slugUrl, this.props.dataUrl) :
    //   locationUrl(this.props.id, this.props.dataUrl);
    const location = this.getLocation();
    const {MinFlatPriceHTML, HouseTableData} =
        this.getFlatInfo(priceMinItem, flatsData, location);

    const photoCount = media ? media['photos'] : null;

    return (
      <Col xs={12}>
      <div className='objects--item__nomap clearfix' ref={house.id}>
        {(house.action_description ?
          <div className="objects--item__nomap--wrapper">
            <div className='objects--item__nomap--installment' />
            <div className="objects--item__nomap--installment__content">
              <div className="objects--item__nomap--installment__arrow" />
              <div dangerouslySetInnerHTML={textAction} />
            </div>
          </div> : null)}
        <Col xs={4}>
          <div className='objects--item__nomap--img'>
            {
              this.props.showSlider && photoCount > 1 ? (
                <SearchSlider imageProps={imageProps}
                              object={house}
                              media={media}
                              realtyClass="newhouses"
                              objectId={parseInt(house.id)}
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
          <div className='objects--item__nomap--title'>
              <h3 className='pull-left col-md-8'>
                <a href={location} target='_blank'>
                  <b>{house.gp ? house.gp.replace(/&quot;/g, '\"') : ''}</b>
                </a>
              </h3>
              {MinFlatPriceHTML}
          </div>
          <div className='objects--item__nomap--content'>
              <ItemTableDescription {...this.props} location={location}/>
              {HouseTableData}
          </div>
        </Col>
        <div className='item--controls nhFlats'>
          <a href={location} className='item--controls__more'
             target='_blank'>Подробнее</a>
        </div>
      </div>
      </Col>
    );
  }
}


export default ItemTable;
