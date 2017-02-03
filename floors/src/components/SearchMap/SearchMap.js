/**
 * Searchform filter component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */


/*global ymaps*/
/*global data*/
/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react';
import {each, isEmpty, isEqual, toArray, merge} from 'lodash';
import {locationUrl, locationSlugUrl,
  priceFormatter, capitalizeString, getTitle,
  getAdress} from '../../utils/Helpers';
import {getMin} from '../../utils/filterUtils';

import FilterSettingsStore from '../../stores/FilterSettingsStore';
import SearchStore from '../../stores/SearchStore';
import {templateFactory} from './newhouseCard';
import {red} from '../../utils/yandex/placemarkImg';
import balloon from '../../utils/yandex/balloon';
import defaultTemplate from '../../utils/yandex/defaultTemplate';
import wss from '../../stores/WidgetsStateStore';
import Image from '../../shared/Image';
/*eslint camelcase: [2, {properties: "never"}]*/

/* global data*/
class SearchMap extends Component {
  static propTypes = {
    mountNode: PropTypes.string,
    dataUrl: PropTypes.array,
    disableScroll: PropTypes.bool,
    mediaSource: PropTypes.number
  };

  static defaultProps = {
    mediaSource: data.options.mediaSource
  };

  constructor(props) {
    super(props);
    this.state = {
      houseItems: data.objects.list,
      objects: [],
      perPage: 15,
      offset: 0,
      isLoading: false,
      currentPage: 1,
      realtyType: 'flats',
      layoutType: ''
    };
    this.myMap = {};
    this.init = this.init.bind(this);
    this.onChange = this.onChange.bind(this);
    this.generateObjects = this.generateObjects.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(nextState.houseItems, this.state.houseItems);
  }

  componentWillMount() {
    SearchStore.onChange(this.onChange);
    this.setState({
      houseItems: SearchStore.getResult(),
      realtyType: FilterSettingsStore.get('realtyType'),
      layoutType: FilterSettingsStore.get('layoutType')
    });
  }

  wssChange = () => {
    this.state.objects.removeAll();
    this.generateObjects();
  }

  componentWillUnmount() {
    wss.offChange(this.wssChange);
  }

  componentDidMount() {
    const {mountNode} = this.props;

    wss.onChange(this.wssChange);

    ymaps.ready(this.init);

    document.body.style.overflow = 'hidden';
    const el = document.getElementById(mountNode);
    const wrapper = el.parentElement.parentElement;
    const currentCollumn = el.parentElement;
    const height = window.innerHeight - wrapper.offsetTop;

    wrapper.style.height = `${height}px`;
    currentCollumn.style.width = `${currentCollumn.offsetWidth + wrapper.firstChild.offsetWidth}px`; // eslint-disable-line max-len
    currentCollumn.classList.add('mapAbsolute');
  }

  generateObjects() {
    const {objects, houseItems, realtyType, layoutType} = this.state;
    const {myMap, props} = this;
    let firstPlacemark;

    const template = templateFactory(realtyType);

    each(houseItems, (item, key) => {
      if(!item.la && !item.lo) {
        return false;
      }
      let location = locationUrl(item.id, props.dataUrl);
      const MyBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
        template
      );

      const MyBalloonLayout = ymaps.templateLayoutFactory.createClass(
        defaultTemplate,
        {
          /**
           * Строит экземпляр макета на основе шаблона и добавляет его в родительский HTML-элемент.
           * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#build
           * @function
           * @name build
           * @return {void}
           */
          build: function() {
            this.constructor.superclass.build.call(this);
            this.element = $('.newhousecard', this.getParentElement());
            this.applyElementOffset();
            this.element.find('.close')
                .on('click', $.proxy(this.onCloseClick, this));
          },

          /**
           * Удаляет содержимое макета из DOM.
           * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#clear
           * @function
           * @name clear
           * @return {void}
           */
          clear: function() {
            this.element.find('.close').off('click');
            this.constructor.superclass.clear.call(this);
          },
          /**
           * Метод будет вызван системой шаблонов АПИ при изменении размеров вложенного макета.
           * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
           * @function
           * @name onSublayoutSizeChange
           * @return {void}
           */
          onSublayoutSizeChange: function() {
            MyBalloonLayout
              .superclass
              .onSublayoutSizeChange
              .apply(this, arguments);
            if (!this.isElement(this.element)) {
              return;
            }
            this.applyElementOffset();
            this.events.fire('shapechange');
          },

          /**
           * Сдвигаем балун, чтобы "хвостик" указывал на точку привязки.
           * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
           * @function
           * @name applyElementOffset
           * @return {void}
           */
          applyElementOffset: function() {
            this.element.css({
              left: -(this.element[0].offsetWidth / 2),
              top: -(this.element[0].offsetHeight)
            });
          },
          /**
           * Закрывает балун при клике на крестик, кидая событие "userclose" на макете.
           * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
           * @function
           * @name onCloseClick
           * @param {object} e std event object
           * @return {void}
           */
          onCloseClick: function(e) {
            e.preventDefault();
            this.events.fire('userclose');
          },

          /**
           * Используется для автопозиционирования (balloonAutoPan).
           * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ILayout.xml#getClientBounds
           * @function
           * @name getClientBounds
           * @returns {array} Координаты левого верхнего и правого нижнего углов шаблона относительно точки привязки.
           */
          getShape: function() {
            if (!this.isElement(this.element)) {
              return MyBalloonLayout.superclass.getShape.call(this);
            }

            var position = this.element.position();

            return new ymaps.shape.Rectangle(
              new ymaps.geometry.pixel.Rectangle([
              [position.left, position.top], [
                position.left + this.element[0].offsetWidth,
                position.top + this.element[0].offsetHeight
              ]
              ])
            );
          },

          /**
           * Проверяем наличие элемента (в ИЕ и Опере его еще может не быть).
           * @function
           * @private
           * @name isElement
           * @param {jQuery} [element] Элемент.
           * @returns {Boolean} Флаг наличия.
           */
          isElement: function(element) {
            return element && element[0];
          }
        },
      );

      const imageProps = {
        image: item.main_photo,
        visual: item.visual,
        width: 320,
        height: 240
      };

      let title, adress, objectId, oldPrice;

      if(realtyType === 'flats') {
        title = item.type !== 'flat' ?
          capitalizeString(item.type_ru) :
          getTitle(item.rooms);
        location = layoutType !== 'rent' ?
          `/realty/flat/?id=${item.object_id}` :
          `/realty_rent/flat/?id=${item.object_id}`;

        adress = getAdress(
          item.district, item.street, item.house_num
        );
        objectId = item.object_id;
        oldPrice = item.old_price;
      } else {
        title = item.gp;
        adress = item.district;
        objectId = item.id;
      }

      const {currency} = wss.get();
      const course = currency ? (currency.nominal / currency.value) : 1;
      const unit = currency ? currency.symbol : 'руб.';
      const priceInRubles = item.flats ?
        getMin('price', toArray(item.flats)) : item.price;
      const mortgagePay = parseInt(item.price) > 0 ? `${priceFormatter(Math.round(item.mortgage_pay * course))} ${unit}/мес` : 'цена по запросу'; // eslint-disable-line max-len
      const priceInCurrency = Math.round(priceInRubles * course);
      const price = parseInt(item.price) > 0 ?
        `${priceFormatter(priceInCurrency)} ${unit}` : 'цена по запросу';
      const imgSymbols = red.toString().substr(0, 2);
      const myPlacemark = window.myPlacemark = new ymaps.Placemark(
        [item.la, item.lo],
        merge(item, {
          title: title,
          district: adress,
          img: new Image(imageProps).imageSrc,
          id: objectId,
          mortgagePay: mortgagePay,
          oldPrice: oldPrice,
          location: item.slugUrl || location,
          price: price,
          // Свойства
          hintContent: title,
          imgbal: `<img src="//cdn-media.etagi.com/content/media/site/${imgSymbols[0]}/${imgSymbols}/${red}.png" width="31" height="39">` // eslint-disable-line max-len
        }),
        balloon(MyBalloonLayout, MyBalloonContentLayout)
      );

      if(key === 0) {
        firstPlacemark = myPlacemark;
      }
      objects.add(myPlacemark);
    });
    if(!typeof objects === 'undefined') {
      myMap.geoObjects.add(objects);
    }
    if(firstPlacemark) {
      firstPlacemark.balloon.open();
    }

  }

  componentDidUpdate(prevProps, prevState) {
    if(!isEmpty(this.state.houseItems) ||
      !isEqual(this.state.houseItems, prevState.houseItems)) {
      this.state.objects.removeAll();
      this.generateObjects();
    }
  }

  onChange() {
    const {currentPage, perPage, offset, isLoading,
      visibleFilter} = FilterSettingsStore.get();

    this.setState({
      perPage: perPage,
      offset: offset,
      isLoading: isLoading,
      currentPage: currentPage,
      houseItems: SearchStore.getResult(),
      visibleFilter: visibleFilter
    });

  }

  init() {
    let firstObject, firstPlacemark;

    const {dataUrl, disableScroll} = this.props;

    this.state.objects = new ymaps.GeoObjectCollection();
    const {objects, realtyType, layoutType} = this.state;
    const template = templateFactory(realtyType);

    each(data.objects.list, (item, key) => {
      if(!item.la && !item.lo) {
        return false;
      }
      if (key === 0) {
        firstObject = item;
      }

      let location = locationSlugUrl(item.slugUrl, dataUrl);
      const MyBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
        template
      );

      const MyBalloonLayout = ymaps.templateLayoutFactory.createClass(
        defaultTemplate,
        {
          /**
           * Строит экземпляр макета на основе шаблона и добавляет его в родительский HTML-элемент.
           * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#build
           * @function
           * @name build
           * @return {void}
           */
          build: function() {
            this.constructor.superclass.build.call(this);
            this.element = $('.newhousecard', this.getParentElement());
            this.applyElementOffset();
            this.element.find('.close')
                .on('click', $.proxy(this.onCloseClick, this));
          },

          /**
           * Удаляет содержимое макета из DOM.
           * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#clear
           * @function
           * @name clear
           * @return {void}
           */
          clear: function() {
            this.element.find('.close').off('click');
            this.constructor.superclass.clear.call(this);
          },
          /**
           * Метод будет вызван системой шаблонов АПИ при изменении размеров вложенного макета.
           * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
           * @function
           * @name onSublayoutSizeChange
           * @return {void}
           */
          onSublayoutSizeChange: function() {
            MyBalloonLayout
              .superclass
              .onSublayoutSizeChange
              .apply(this, arguments);
            if (!this.isElement(this.element)) {
              return;
            }
            this.applyElementOffset();
            this.events.fire('shapechange');
          },

          /**
           * Сдвигаем балун, чтобы "хвостик" указывал на точку привязки.
           * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
           * @function
           * @name applyElementOffset
           * @return {void}
           */
          applyElementOffset: function() {
            this.element.css({
              left: -(this.element[0].offsetWidth / 2),
              top: -(this.element[0].offsetHeight)
            });
          },
          /**
           * Закрывает балун при клике на крестик, кидая событие "userclose" на макете.
           * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
           * @function
           * @name onCloseClick
           * @param {object} e std event object
           * @return {void}
           */
          onCloseClick: function(e) {
            e.preventDefault();
            this.events.fire('userclose');
          },

          /**
           * Используется для автопозиционирования (balloonAutoPan).
           * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ILayout.xml#getClientBounds
           * @function
           * @name getClientBounds
           * @returns {array} Координаты левого верхнего и правого нижнего углов шаблона относительно точки привязки.
           */
          getShape: function() {
            if (!this.isElement(this.element)) {
              return MyBalloonLayout.superclass.getShape.call(this);
            }

            var position = this.element.position();

            return new ymaps.shape.Rectangle(
              new ymaps.geometry.pixel.Rectangle([
              [position.left, position.top], [
                position.left + this.element[0].offsetWidth,
                position.top + this.element[0].offsetHeight
              ]
              ])
            );
          },

          /**
           * Проверяем наличие элемента (в ИЕ и Опере его еще может не быть).
           * @function
           * @private
           * @name isElement
           * @param {jQuery} [element] Элемент.
           * @returns {Boolean} Флаг наличия.
           */
          isElement: function(element) {
            return element && element[0];
          }
        },
      );

      const imageProps = {
        image: item.main_photo,
        visual: item.visual,
        width: 320,
        height: 240
      };

      let title, adress, objectId, oldPrice;

      if(realtyType === 'flats') {
        title = item.type !== 'flat' ?
          capitalizeString(item.type_ru) :
          getTitle(item.rooms);
        location = layoutType !== 'rent' ?
          `/realty/flat/?id=${item.object_id}` :
          `/realty_rent/flat/?id=${item.object_id}`;

        adress = getAdress(
          item.district, item.street, item.house_num
        );
        objectId = item.object_id;
        oldPrice = item.old_price;
      } else {
        title = item.gp;
        adress = item.district;
        objectId = item.id;
      }

      const {currency} = wss.get();
      const course = currency ? (currency.nominal / currency.value) : 1;
      const unit = currency ? currency.symbol : 'руб.';
      const priceInRubles = item.flats ?
        getMin('price', toArray(item.flats)) : item.price;
      const priceInCurrency = Math.round(priceInRubles * course);
      const mortgagePay = `${priceFormatter(Math.round(item.mortgage_pay * course))} ${unit}/мес`; // eslint-disable-line max-len
      const price = `${priceFormatter(priceInCurrency)} ${unit}`;
      const imgSymbols = red.toString().substr(0, 2);
      const myPlacemark = window.myPlacemark = new ymaps.Placemark(
        [item.la, item.lo],
        merge(item, {
          title: title,
          district: adress,
          img: new Image(imageProps).imageSrc,
          id: objectId,
          mortgagePay: mortgagePay,
          oldPrice: oldPrice,
          location: item.slugUrl || location,
          price: price,
          // Свойства
          hintContent: title,
          imgbal: `<img src="//cdn-media.etagi.com/content/media/site/${imgSymbols[0]}/${imgSymbols}/${red}.png" width="31" height="39">` // eslint-disable-line max-len
        }),
        balloon(MyBalloonLayout, MyBalloonContentLayout)
      );

      if(key === 0) {
        firstPlacemark = myPlacemark;
      }

      objects.add(myPlacemark);
    });

    if(typeof firstObject !== 'undefined') {
      this.myMap = new ymaps.Map('SearchMap', {
        center: [firstObject.la, firstObject.lo],
        zoom: 12,
        controls: ['zoomControl']
      });

      this.myMap.options.set('minZoom', 10);
      this.myMap.options.set('maxZoom', 14);
      this.myMap.controls.get('zoomControl').options.set('position', {
        right: 15,
        top: 108
      });
      if (disableScroll) {
        this.myMap.behaviors.disable('scrollZoom');
      }

      this.myMap.geoObjects.add(objects);
      if(firstPlacemark) {
        firstPlacemark.balloon.open();
      }
    }

  }

  render() {
    const divStyle = {
      width: '100%',
      height: '100%'
    };

    return (
      <div className="search--result__map">
          <div id="SearchMap" style={divStyle}/>
      </div>
    );
  }
}

export default SearchMap;
