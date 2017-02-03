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
import Helpers from '../../utils/Helpers';

import FavButton from '../../shared/FavButton';
import CompareButton from '../../shared/CompareButton';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import {cutText} from 'etagi-helpers';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Popover from 'react-bootstrap/lib/Popover';
import Image from '../../shared/Image';
import SearchSlider from './SearchSlider';
/**
 * Bootstrap 3 elements
 */

/* global data */

class RealtyOutItemTableNew extends Component {
  static propTypes = {
    house: PropTypes.object,
    favorites: PropTypes.number,
    source: PropTypes.number,
    layoutType: PropTypes.string,
    showCity: PropTypes.bool,
    showSlider: PropTypes.bool
  };
  static defaultProps = {
    showSlider: true
  }
  constructor(props) {
    super(props);
    this.state = {
      showFullDesc: false
    };
  }

  toggleDescription(event) {
    event.preventDefault();
    this.setState(() => ({showFullDesc: !this.state.showFullDesc}));
  }

  render() {
    const {house, favorites, showCity, layoutType} = this.props;
    const imageProps = {
      image: house.main_photo,
      visual: house.visual,
      width: 255,
      height: 172
    };

    let notes = house.notes ? house.notes.split('.').join('. ') : '';

    notes = notes.split(',').join(', ');
    const shortText = cutText(notes, 135);

    const location = `/realty_out/${house.object_id}`;

    const title = house.type !== 'flat' ?
      (house.type_ru ? Helpers.capitalizeString(house.type_ru) : 'квартира') :
      Helpers.getTitle(house.rooms);

    let adress = Helpers.getAdress(
      house.district, house.street, house.house_num
    );

    if (showCity && data.collections.cities &&
    data.collections.cities[house.city_id]) {
      adress = `${data.collections.cities[house.city_id].name}, ${adress}`;
    }

    const favButton = favorites && parseInt(house.price) > 0 ? (
      <FavButton
        key={house.class + house.object_id}
        className='btn-fav-newsearch'
        oclass={layoutType === 'rent' ? 'rent' : house.class}
        oid={house.object_id}
        withTitle={true}
        titles={[' Сохранено', ' Сохранить']}
      />
    ) : null;

    const compareButton = favorites && parseInt(house.price) > 0 ? (
      <CompareButton
        key={`review${house.class}${house.object_id}`}
        className='btn-fav-newcompare'
        oclass={layoutType === 'rent' ? 'rent' : house.class}
        oid={house.object_id}
        withTitle={true}
        newBtn={true}
      />
    ) : null;

    const expanded = this.state.showFullDesc ? 'expanded' : '';
    const deviation = parseInt(this.props.house.deviation);
    const deviationDirection = deviation >= 0 ? 'up' : 'down';
    const deviationAbs = Math.abs(deviation);
    const deviationtext = (
      <p>Отклонение в процентах показывает разницу между
        средней стоимостью <strong>1&nbsp;квадратного метра &nbsp; </strong>
        аналогичных активных и проданных объектов и стоимостью
        &nbsp;<strong>1&nbsp;квадратного метра&nbsp;</strong> данного объекта.
        Показатель может меняться в течение периода нахождения объекта
        на продаже.</p>);

    const media = JSON.parse(this.props.house.media);
    const photoCount = media ? media['photos'] : null;

    return (
      <div className={`searchRealtyItemWrapper out ${expanded}`} ref={house.id}>
        <div className="searchRealtyItem_sliderWrapper">
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
        <div className="searchRealtyItem_lkButtons">
          <div className="searchRealtyItem_favBtn">
            {favButton}
          </div>
          <div className="searchRealtyItem_compareBtn">
            {compareButton}
          </div>
        </div>
        <div className="searchRealtyItem_objInfo">
          <a href={location}
             target="_blank"
             className="searchRealtyItem_objTitle">
            {title}
          </a>
          <div className='searchRealtyItem_objAddr'>
              <span className="glyphicon glyphicon-map-marker"
                    aria-hidden="true" />
            {adress}
          </div>
          {house.type === 'land' ? (
            <div className="searchRealtyItem_rentMainFeatures">
              <div className="searchRealtyItem_rentFeatureWr">
                <span className="searchRealtyItem_objFeatureTxt">
                  Площадь участка:&nbsp;
                </span>
                <span>
                  {`${house.area_land.toString().replace('.', ',')} сот.`}
                </span>
              </div>
              <div className="searchRealtyItem_rentFeatureWr">
                <span className="searchRealtyItem_objFeatureTxt">
                  Цена за сотку:&nbsp;
                </span>
                <span>
                    <Price price={house.price / house.area_land}>
                      &nbsp;<PriceUnit/>
                    </Price>
                </span>
              </div>
              <div className="searchRealtyItem_rentFeatureWr">
                <span className="searchRealtyItem_objFeatureTxt">
                  Межевание:&nbsp;
                </span>
                {house.survey === 't' ? 'Есть' : 'Нет'}
              </div>
            </div>
          ) : (
            <div className="searchRealtyItem_rentMainFeatures">
              <div className="searchRealtyItem_rentFeatureWr">
                <span className="searchRealtyItem_objFeatureTxt">
                  Площадь дома:&nbsp;
                </span>
                <span>
                  {`${house.area_house.toString().replace('.', ',')} м²`}
                </span>
              </div>
              <div className="searchRealtyItem_rentFeatureWr">
                <span className="searchRealtyItem_objFeatureTxt">
                  Площадь участка:&nbsp;
                </span>
                <span>
                  {`${house.area_land.toString().replace('.', ',')} сот.`}
                </span>
              </div>
              <div style={{width: '80%'}}
                   className="searchRealtyItem_rentFeatureWr">
                <span className="searchRealtyItem_objFeatureTxt">
                  Материал стен:&nbsp;
                </span>
                <span>
                  {house.walls}
                </span>
              </div>
            </div>
          )}
          {house.notes ? (
            <div className='searchRealtyItem_objNotes'>
              {this.state.showFullDesc ? `${shortText[0]} ${shortText[1]} ` :
                `${shortText[0]} `}
              {shortText[1] ? (
                <span>
                  {this.state.showFullDesc ? (
                    <a href="#" onClick={this.toggleDescription.bind(this)}>
                      Скрыть
                    </a>
                  ) : (
                    <span>
                      <span>... </span>
                      <a href="#" onClick={this.toggleDescription.bind(this)}>
                        Читать полностью
                      </a>
                    </span>
                  )}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="searchRealtyItem_objPriceWrapper">
          <div className="searchRealtyItem_objPrice">
            <Price price={house.price}>
              &nbsp;<PriceUnit/>
            </Price>
          </div>
          {parseInt(house.old_price) ? (
            <div className="searchRealtyItem_objOldPrice">
              <Price price={house.old_price}>
                &nbsp;<PriceUnit/>
              </Price>
            </div>
          ) : null}
          {deviation ? (
            <div className="searchRealtyItem_objDeviation">
              {deviationDirection === 'up' ? (
                <span>
                <span>цена выше средней по рынку на</span>
                <span className="searchRealtyItem_deviationUp">
                  {`${deviationAbs}%`}
                </span>
              </span>
              ) : (
                <span>
                <span>цена ниже средней по рынку на</span>
                <span className="searchRealtyItem_deviationDown">
                  {`${deviationAbs}%`}
                </span>
              </span>
              )}
              <div className='liquidity_block_value'>
                <OverlayTrigger placement='right' overlay={
                <Popover id='devcontent' className="noticeFlat">
                  {deviationtext}
                </Popover>
              }>
                  <span className='tooltip_icon tooltip-icon__question'></span>
                </OverlayTrigger>
              </div>
            </div>
          ) : null}
          <a href={location}
             target="_blank"
             className="searchRealtyItem_objGoTo">
            Узнать больше
          </a>
        </div>
      </div>
    );
  }
}


export default RealtyOutItemTableNew;
