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
import Rating from '../../shared/Rating';
import ga from '../../utils/ga';
/**
 * Bootstrap 3 elements
 */

/* global data */

class RealtyItemTableNew extends Component {
  static propTypes = {
    house: PropTypes.object,
    favorites: PropTypes.number,
    ratings: PropTypes.number,
    source: PropTypes.number,
    layoutType: PropTypes.string,
    showCity: PropTypes.bool,
    showSlider: PropTypes.bool,
    context: PropTypes.object
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
    ga('button', 'site_description_search_card_show');
    this.setState(() => ({showFullDesc: !this.state.showFullDesc}));
  }

  render() {
    const {house, favorites, showCity, layoutType, ratings} = this.props;
    const imageProps = {
      image: house.main_photo,
      visual: house.visual,
      width: 255,
      height: 172
    };
    let notes = house.notes ? house.notes.split('.').join('. ') : '';

    notes = notes.split(',').join(', ');
    const shortText = cutText(notes, 130);

    const pageType = layoutType !== 'rent' ? 'realty' : 'realty_rent';
    const location = `/${pageType}/${house.object_id}`;

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
        &nbsp;<strong>&nbsp; 1&nbsp;квадратного метра&nbsp;</strong>
        данного объекта.Показатель может меняться в течение периода нахождения
        объекта на продаже.</p>);
    const media = JSON.parse(this.props.house.media);
    const photoCount = media ? media['photos'] : null;

    /* eslint-disable */
    return (
      <div className={`searchRealtyItemWrapper experimental ${expanded}`}
           ref={house.id}>
        <div className="searchRealtyItem_sliderWrapper ">
          {
            this.props.showSlider && photoCount > 1 ? (
              <SearchSlider imageProps={imageProps}
                            object={this.props.house}
                            location={location} />
            ) : (
              <div
                className={`searchRealtyItem_image ${!house.media ? 'empty' : ''}`}>
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
          <div>
            <a href={location}
               onClick={() => {
                 ga('link', 'site_search_card_detail');
               }
               }
               target="_blank"
               className="searchRealtyItem_objTitle">
              {title}
            </a>
            <Rating id={house.object_id}
                    content={house.ratings}
                    condition={data.options.minRating}
                    context={this.props.context}
                    showLink='1'
                    className='ratingLayout'
                    show={ratings} />
          </div>
          <div className='searchRealtyItem_objAddr'>
              <span className="glyphicon glyphicon-map-marker"
                    aria-hidden="true" />
            {adress}
          </div>
          <div className="searchRealtyItem_rentMainFeatures">
            <div className="searchRealtyItem_rentFeatureWr">
                <span className="searchRealtyItem_objFeatureTxt">
                  Площадь:&nbsp;
                </span>
                <span>
                  {`${house.square.toString().replace('.', ',')} м²`}
                </span>
            </div>
            <div className="searchRealtyItem_rentFeatureWr">
                <span className="searchRealtyItem_objFeatureTxt">
                  В ипотеку:&nbsp;
                </span>
              <Price price={house.mortgage_pay}>&nbsp;
                <PriceUnit/>/мес
              </Price>
            </div>
            <div className="searchRealtyItem_rentFeatureWr">
                <span className="searchRealtyItem_objFeatureTxt">
                  Этаж/этажность:&nbsp;
                </span>
                <span>
                    {`${house.floor}/${house.floors}`}
                </span>
            </div>
          </div>
          {notes ? (
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
          {parseInt(house.old_price) && parseInt(house.price) > 0 ? (
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
                <OverlayTrigger placement='top'
                                positionLeft={50}
                                overlay={
                <Popover id='devcontent' className="noticeFlat">
                  {deviationtext}
                </Popover>
              }>
                <span
                  onMouseOver={() => {
                    ga('help', 'site_liquidity_search_card', 'hover');
                  }}
                  className='tooltip_icon tooltip-icon__question' />
                </OverlayTrigger>
              </div>
            </div>
          ) : null}
          <a href={location}
             onClick={() => {
               ga('button', 'site_search_card_detail');
             }}
             target="_blank"
             className="searchRealtyItem_objGoTo">
            Узнать больше
          </a>
        </div>
      </div>
    );
  }
}


export default RealtyItemTableNew;
