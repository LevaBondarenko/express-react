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
import {toArray} from 'lodash';

import {getMin} from  '../../utils/filterUtils';
import Helpers from '../../utils/Helpers';
import HouseTable from '../SearchLayout/HouseTable';
import ItemListDescription from '../SearchLayout/ItemListDescription';
import ItemListControls from '../SearchLayout/ItemListControls';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import Image from '../../shared/Image';
/**
 * Bootstrap 3 elements
 */
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';

class ItemList extends Component {
  static propTypes = {
    house: PropTypes.object,
    dataUrl: PropTypes.array,
    id: PropTypes.string,
    flatsData: PropTypes.object,
    active: PropTypes.bool,
    source: PropTypes.number,
    hideFlatInfo: PropTypes.string
  };

  getFlatInfo = (priceMinItem,flatsData,locationUrl) => {
    let HouseTableData;
    let MinFlatPriceHTML = <span className='item--price pull-right'></span>;

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

  render() {
    const {house, id, dataUrl, flatsData} = this.props;
    const imageProps = {
      image: house.main_photo.replace('/photos/', ''),
      visual: house.visual,
      width: 320,
      height: 240
    };

    const priceMinItem = getMin('price', toArray(flatsData), true);
    const textAction = {__html: house.action_description};
    const location = house.slugUrl ?
      Helpers.locationSlugUrl(house.slugUrl, dataUrl) :
      Helpers.locationUrl(id, dataUrl);
    const {MinFlatPriceHTML, HouseTableData} =
      this.getFlatInfo(priceMinItem,flatsData,location);

    return (
      <div className='objects--item'>
        <div className='objects--item__title clearfix'>
          <a href={location}>
            <h3 className='pull-left col-md-8'>
              <b>{house.gp.replace(/&quot;/g, '\"')}</b>
            </h3>
          </a>
          {MinFlatPriceHTML}
        </div>
        <div className='objects--item__content'>
            {(house.action_description ?
            <div className="objects--item__nomap--wrapper">
              <div className='objects--item__nomap--installment' />
              <div className="objects--item__nomap--installment__content">
                <div className="objects--item__nomap--installment__arrow" />
                <div dangerouslySetInnerHTML={textAction} />
              </div>
            </div> : null)}
          <Row className='row-eq-height clearfix'>
               <Col xs={5} className='item--img_wrap col-md-5'>
                <a href={location} target='_blank'>
                  <Image className='img-responsive'
                    {...imageProps}
                    alt={house.gp ? house.gp.replace(/&quot;/g, '\"') : ''} />
                </a>
              </Col>
              <Col xs={7} className='item--description clearfix'>
                <ItemListDescription {...this.props}/>
              </Col>
          </Row>
          {HouseTableData}
          <ItemListControls location={location}/>
        </div>
      </div>
    );
  }
}

export default ItemList;
