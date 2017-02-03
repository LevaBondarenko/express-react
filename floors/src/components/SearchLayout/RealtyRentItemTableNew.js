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
import Image from '../../shared/Image';
import SearchSlider from './SearchSlider';
/**
 * Bootstrap 3 elements
 */

/* global data */

class RealtyRentItemTableNew extends Component {
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
    let allowed;

    if (house.allowed) {
      allowed = house.allowed
        .replace('{', '')
        .replace('}', '')
        .split(',');
    } else {
      allowed = [];
    }

    const allowedAnimals  = allowed.indexOf('animals') !== -1 ?
      'Разрешено' : 'Не разрешено';
    const allowedChildren = allowed.indexOf('children') !== -1 ?
      'Разрешено' : 'Не разрешено';
    const shortDuration = ['day', 'week', 'month']
        .indexOf(house.duration) !== -1 ? 'Да' : 'Нет';

    const media = JSON.parse(this.props.house.media);
    const photoCount = media ? media['photos'] : null;

    return (
      <div className={`searchRealtyItemWrapper ${expanded}`} ref={house.id}>
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
                Этаж/Этажность:&nbsp;
              </span>
              <span>
                {`${house.floor}/${house.floors}`}
              </span>
            </div>
            <div className="searchRealtyItem_rentFeatureWr">
              <span className="searchRealtyItem_objFeatureTxt">
                Дети:&nbsp;
              </span>
              <span>
                {allowedChildren}
              </span>
            </div>
            <div className="searchRealtyItem_rentFeatureWr">
              <span className="searchRealtyItem_objFeatureTxt">
                Животные:&nbsp;
              </span>
              <span>
                {allowedAnimals}
              </span>
            </div>
            <div className="searchRealtyItem_rentFeatureWr">
              <span className="searchRealtyItem_objFeatureTxt">
                Короткие сроки аренды:&nbsp;
              </span>
              {shortDuration}
            </div>
          </div>
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


export default RealtyRentItemTableNew;
