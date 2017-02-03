/**
 * MobileSearchResult widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';
import s from './MobileSearchResult.scss';
import {connect} from 'react-redux';
import Image from '../../shared/Image';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import JsonParametersBlock from '../../shared/JsonParametersBlock';
import FavButton2 from '../FavButton2/';
import ContextType from '../../utils/contextType';
import {size, toArray, difference, each} from 'lodash';
import {getMin} from  '../../utils/filterUtils';
import {locationSlugUrl} from '../../utils/Helpers';

class MobileSearchResult extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    parameters: PropTypes.array,
    objects: PropTypes.array,
    searcher: PropTypes.object,
    minRating: PropTypes.number
  };

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);

    this.typeTranslations = {
      room: 'Комната',
      malosem: 'Малосемейка',
      obshaga: 'Общежитие',
      pansion: 'Пансионат',
      garden: 'Дача',
      house: 'Дом',
      cottage: 'Коттедж',
      townhouse: 'Таунхаус',
      halfhouse: 'Полудом',
      land: 'Земельный участок',
      base: 'База',
      ferma: 'Ферма',
      busines: 'Готовый бизнес',
      office: 'Офис',
      dev: 'Производство',
      sklad: 'Склад',
      torg: 'Торговые',
      other: 'Свободного назначения',
      'dev_land': 'Земля под производство'
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  shouldComponentUpdate(nextProps) {
    const objectsChanged =
      size(this.props.objects) !== size(nextProps.objects) ||
      size(difference(
        this.props.objects.map(item => item.object_id || item.id),
        nextProps.objects.map(item => item.object_id || item.id)
      )) > 0;
    const paramsChanges =
      this.props.searcher.rooms != nextProps.searcher.rooms ||
      this.props.searcher.price_min != nextProps.searcher.price_min ||
      this.props.searcher.price_max != nextProps.searcher.price_max ||
      this.props.searcher.square_min != nextProps.searcher.square_min ||
      this.props.searcher.square_max != nextProps.searcher.square_max;

    return objectsChanged || paramsChanges;
  }

  getLocation(slugUrl, rooms) {
    const dataUrl = [];
    const obj = this.props.searcher;

    if (rooms) {
      obj.rooms && each(obj.rooms, room => {
        dataUrl.push({
          rooms: room
        });
      });
    }

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

    return locationSlugUrl(slugUrl, dataUrl);
  }

  getRatingText(overall) {
    let title = '';

    if (0 <= overall && overall <= 10) {
      if (overall >= 5 && overall < 6) {
        title = 'неплохо';
      } else if (overall >= 6 && overall < 7) {
        title = 'хорошо';
      } else if (overall >= 7 && overall < 8) {
        title = 'очень хорошо';
      } else if (overall >= 8 && overall < 9) {
        title = 'отлично';
      } else if (overall >= 9) {
        title = 'превосходно';
      }
    }
    return title;
  }

  getTitle(item) {
    if (item.class === 'nh_flats') {
      return item.gp;
    } else if (item.type === 'flat') {
      return `${item.rooms}-комнатная`;
    } else {
      return this.typeTranslations[item.type] || 'Объект';
    }
  }

  getItems = items => {
    const {context} = this.props;

    return Array.isArray(items) && items.length ? items.map((item, idx) => {
      const imageProps = {
        image: item.main_photo,
        visual: item.visual,
        width: 300,
        height: 267
      };
      const rating = parseFloat(item.rating);
      const oclass = (typeof item.gp === 'object') ? 'nh_flats' :
        (item.table === 'rent' ? 'rent' : item.class);
      const isNewhouse = oclass === 'nh_flats';
      const oid = isNewhouse ? item.id : item.object_id;

      let pageType;

      switch (oclass) {
      case 'rent':
        pageType = 'realty_rent';
        break;
      case 'cottages':
        pageType = 'realty_out';
        break;
      case 'offices':
        pageType = 'commerce';
        break;
      case 'nh_flats':
        pageType = 'zastr/jk';
        break;
      default:
        pageType = 'realty';
      }
      const location = isNewhouse ?
        this.getLocation(item.slugUrl, true) :
        `/${pageType}/${item.object_id}`;

      return (
        <div className={s.item} key={`object_${idx}`}>
          <div className={isNewhouse ? s.itemHeaderJk : s.itemHeader}>
            <div className={s.itemTitle}>{this.getTitle(item)}</div>
            {rating > this.props.minRating ? (
              <div className={s.itemRating}>
                <div className={s.ratingNum}>
                  {rating.toFixed(2).slice(0, -1)}
                </div>
                <div className={s.ratingText}>
                    {this.getRatingText(item.rating)}
                </div>
              </div>
            ) : null}
          </div>
          {/* slider */}
          <div className={s.dummySlider}>
            <a href={location}>
              <Image {...imageProps} />
            </a>
          </div>
          <div className={s.itemProps}>
            <div className={s.price}>
              <div className={s.curPrice}>
                {isNewhouse ?
                  <div>от&nbsp;
                    <Price price={getMin('price', toArray(item.flats), true)}>
                      &nbsp;<PriceUnit />
                    </Price>
                  </div> :
                  <Price price={item.price}>
                    &nbsp;<PriceUnit />
                  </Price>}
              </div>
              {item['old_price'] > item.price ? (
                <div className={s.oldPrice}>
                  <Price price={item['old_price']}>
                    &nbsp;<PriceUnit />
                  </Price>
                </div>
              ) : null}
            </div>
            <JsonParametersBlock
              parameters={this.props.parameters}
              source={item}
              location={this.getLocation(item.slugUrl)} />
          </div>
          <div className={s.itemButtons}>
            {isNewhouse ? null :
              <div className={s.fav}>
                <FavButton2
                  context={context}
                  label='В избранное'
                  addedLabel='В избранном'
                  oid={oid}
                  oclass={oclass}/>
              </div>}
            <div className={s.more}>
              <button onClick={event => {
                event.preventDefault();

                window.location.href = location;
              }}>Подробнее</button>
            </div>
          </div>
        </div>
      );
    }) : (
      <div className={s.nothing}>
        Ни один объект не соответствует условиям отображения
      </div>
    );
  }

  render() {
    return (
      <div className={s.root}>
        <div className={s.items}>
          {this.getItems(this.props.objects)}
        </div>
      </div>
    );
  }
}

export default connect(
  (state, ownProps) => {
    const {objects: existObjs} = ownProps;
    const objects = existObjs ? existObjs : (
      state.objects.get('objects') ?
      state.objects.get('objects').get('list').toJS() : []
    );
    const searcher = state.objects.get('searcher') ?
      state.objects.get('searcher').toJS() : null;

    return {
      objects: objects.error ? [] : objects,
      searcher: searcher,
      minRating: state.settings.get('minRating')
    };
  }
)(MobileSearchResult);
