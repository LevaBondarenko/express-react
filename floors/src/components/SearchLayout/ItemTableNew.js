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
import {getAdress} from '../../utils/Helpers';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';

import {locationSlugUrl, locationUrl} from '../../utils/Helpers';

import {getMin} from  '../../utils/filterUtils';
import HouseTableNew from '../SearchLayout/HouseTableNew';

import Image from '../../shared/Image';
import Col from 'react-bootstrap/lib/Col';

class ItemTableNew extends Component {
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
    hideFlatInfo: PropTypes.string
  };

  constructor(props) {
    super(props);
  }

  getFlatInfo = (priceMinItem, flatsData, locationUrl) => {
    let houseTableData;
    let minFlatPriceHTML;
    let priceMinMortgage;

    if (typeof this.props.hideFlatInfo === 'undefined' ||
        parseInt(this.props.hideFlatInfo) === 0) {
      minFlatPriceHTML = (
          <span>
            от <Price price={priceMinItem}> <PriceUnit/></Price>
          </span>
      );
      houseTableData = (
          <HouseTableNew flats={flatsData} location={locationUrl}/>
      );

      const priceMortgage = getMin('mortgage_pay', toArray(flatsData), true);

      priceMinMortgage = !isNaN(priceMortgage) ? (
        <p className='RealtyItemList_objZastrMortgage'>
          В ипотеку от <Price price={priceMortgage}> <PriceUnit/>/мес.</Price>
        </p>
      ) : null;
    }

    return {
      minFlatPriceHTML: minFlatPriceHTML,
      houseTableData: houseTableData,
      priceMinMortgage: priceMinMortgage

    };
  }

  get location() {
    const {house, dataUrl, id} = this.props;

    return house.slugUrl ?
      locationSlugUrl(house.slugUrl, dataUrl) : locationUrl(id, dataUrl);
  }

  get builder() {
    const {house} = this.props;

    return house.builder ?
      (<div className='searchRealtyItem_objBuilder'>
        <p><b>Застройщик:</b> <a href={`/zastr/builder/${house.builderSlug}`}
          target='_blank'>{`${house.builder}`}</a>
        </p>
      </div>) : null;
  }

  get deadlineTitle() {
    const {house} = this.props;
    let deadlineTitle;

    if (house.deadline_q &&
      house.deadline_y &&
      house.deadline_q !== '0') {
      deadlineTitle = `${house.deadline_q} кв. ${house.deadline_y}`;
    } else if(!house.deadline_q ||
      house.deadline_q === '0' &&
      house.deadline_y) {
      deadlineTitle = `${house.deadline_y} г.`;
    }

    return deadlineTitle;
  }

  render() {
    const {house, flatsData} = this.props;
    const imageProps = {
      image: house.main_photo.replace('/photos/', ''),
      visual: house.visual || 'photo',
      width: 255,
      height: 172
    };

    const priceMinItem = getMin('price', toArray(flatsData), true);
    const priceSqrMinItem = getMin('price_m2', toArray(flatsData), true);

    const {minFlatPriceHTML, houseTableData, priceMinMortgage} =
        this.getFlatInfo(priceMinItem, flatsData, this.location);

    return (
      <div className='searchRealtyItemWrapper clearfix'
        style={{minHeight: '222px', maxHeight: 'none'}}
        ref={house.id}>
        <div>
            <div className="searchRealtyItem_image">
              <a href={this.location} target='_blank'>
                <Image className='img-responsive'
                  {...imageProps}
                  alt={house.gp ? house.gp.replace(/&quot;/g, '\"') : ''} />
              </a>
            </div>
          {priceMinMortgage}
        </div>
        <div className="searchRealtyItem_objInfo" style={{width: '510px'}}>
          <a href={this.location}
             target="_blank"
             className="searchRealtyItem_objTitle">
              {house.gp ? house.gp.replace(/&quot;/g, '\"') : ''}
          </a>
          <div className='searchRealtyItem_objAddr'>
              <span className="glyphicon glyphicon-map-marker"
                    aria-hidden="true" />
            {getAdress(house.district, house.street, house.house_num)}
          </div>
          <div className="searchRealtyItem_objZastr row">
            <Col xs={6}>
              {(house.district ?
                <p><b>Район</b>: {house.district}</p> : null)}
              {(house.deadline === true ?
                  <p><b>Дом сдан</b></p> : <p>
                    <b>Срок сдачи:</b> {this.deadlineTitle}</p>)}
            </Col>
            <Col xs={6}>
              {(house.walls && house.walls !== '0' ?
                <p><b>Материал стен:</b> {house.walls}</p> : null)}
            </Col>
          </div>
          {houseTableData}
        </div>
        <div className="searchRealtyItem_objPriceWrapper">
          <div className="searchRealtyItem_objPrice">
            {minFlatPriceHTML}
          </div>
          <div className="searchRealtyItem_objPriceSqr">
            от <Price price={priceSqrMinItem}> <PriceUnit/>/м²</Price>
          </div>
          {this.builder}
          <a href={this.location}
             target="_blank"
             className="searchRealtyItem_objGoTo">
            Узнать больше
          </a>
        </div>
      </div>
    );
  }
}


export default ItemTableNew;
