/**
 * Searchform filter component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/*global data*/
/*global ymaps*/

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {size, each} from 'lodash';
import Helpers from '../../utils/Helpers';
import mediaHelpers from '../../utils/mediaHelpers';

import classNames from 'classnames';

import FilterSettingsStore from '../../stores/FilterSettingsStore';
import wss from '../../stores/WidgetsStateStore';
/*eslint camelcase: [2, {properties: "never"}]*/

const cardTemplate = '<a href="$[properties.location]">' +
'<h3 class="newhousecard--body__title"><b>$[properties.gp]</b></h3></a>' +
'<div class="newhousecard--body__imgwrap clearfix">' +
'<a href="$[properties.location]">' +
'<img src=$[properties.img] style="max-height: 150px"/>' +
'</a></div>' +
'<p class="newhousecard--body__district">' +
'Район: <b>$[properties.district]</b>' +
'</p>' +
'<p class="newhousecard--body__walls">' +
'Материал стен: <b>$[properties.wall]</b>' +
'</p>' +
'<p class="newhousecard--body__builder">' +
'Застройщик: ' +
'<a href="/zastr/builder/$[properties.builderSlug]">$[properties.builder]</a>' +
'</p>' +
'<div class="newhousecard--body__installment clearfix">' +
'<p class="newhousecard--body__price">' +
'от: <span>$[properties.min_price]</span>' +
'</p>' +
'<a href="$[properties.location]" ' +
'class="newhousecard--body__installment--more">' +
'Подробнее</a>' +
'</div>';


class FilterformMap extends Component {
  static propTypes = {
    housesResult: React.PropTypes.array
  };
  constructor(props) {
    super(props);
    this.state = {
      houseItems: props.housesResult,
      objects: [],
      perPage: 15,
      offset: 0,
      isLoading: false,
      currentPage: 1
    };
    this.myMap = {};
    this.init = this.init.bind(this);
    this.onChange = this.onChange.bind(this);
  }


  componentDidMount() {
    ymaps.ready(this.init);
    FilterSettingsStore.onChange(this.onChange);
  }

  shouldComponentUpdate(nextProps) {
    return size(nextProps.housesResult) > 0 ? true : false;
  }

  componentWillReceiveProps(nextProps) {
    this.setState(() => ({
      houseItems: nextProps.housesResult
    }));
  }

  componentDidUpdate() {
    const props = this.props;
    let firstPlacemark;
    const {perPage, offset, objects, houseItems} = this.state;
    const myMap = this.myMap;
    const placemarkImg = {
      red: 'c186b928592fd054b20178af0f05ae362262040f',
      green: '158fb207fdfbec45a3d85d8865354cd13d9d0940',
      grey: '764405b09ef912aa09a9809c400d9ac5aef7fae8'
    };

    objects.removeAll();
    each(houseItems, (item, key) => {
      // Создание макета балуна на основе Twitter Bootstrap.
      const MyBalloonLayout = ymaps.templateLayoutFactory.createClass(
        '<div class="newhousecard">' +
        '<a class="close" href="#">&times;</a>' +
        '<div class="newhousecard--body">' +
        '$[[options.contentLayout observeSize minWidth=315 maxWidth=315]]' +
        '</div>' +
        '</div>', {
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
        });
      const location = Helpers.locationUrl(item.id, props.dataUrl);
      const MyBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
        cardTemplate
      );
      let image = placemarkImg.grey;
      let zindex = 1;

      if(key === offset) {
        image = placemarkImg.green;
        zindex = 999;
      }

      if(key > offset && key <= (offset + perPage)) {
        image = placemarkImg.red;
        zindex = 999;
      }

      if (item.filterActive === false) {
        image = placemarkImg.grey;
      }
      const imgSymbols = image.toString().substr(0, 2);
      const myPlacemark = window.myPlacemark = new ymaps.Placemark(
        [item.la, item.lo],
        {
          gp: '',
          district: '',
          img: item.main_photo.replace('/photos/', ''),
          id: item.id,
          wall: '',
          photo: '',
          phone: '',
          fio: '',
          builder: '',
          builderId: '',
          min_price: '',
          location: location,
          // Свойства
          hintContent: item.gp,
          imgbal:
            `<img
              src="https://cdn-media.etagi.com/content/media/site/${imgSymbols[0]}/${imgSymbols}/${image}.png"
              width="31" height="39">`
        }, {
          balloonShadow: false,
          balloonLayout: MyBalloonLayout,
          balloonContentLayout: MyBalloonContentLayout,
          balloonPanelMaxMapArea: 0,
          iconLayout: 'default#image',
          iconImageHref:
            `https://cdn-media.etagi.com/content/media/site/${imgSymbols[0]}/${imgSymbols}/${image}.png`,
          iconImageSize: [31, 39],
          iconImageOffset: [-16, -45],
          zIndex: zindex,
          draggable: false
        }
      );

      myPlacemark.events.add('balloonopen', () => {
        $.ajax({
          type: 'GET',
          url: '/backend/',
          data: {
            action: 'get_info_gk',
            city_id: 23,
            id: item.id
          },
          success: data => {
            const {currency} = wss.get();
            const course = currency ? (currency.nominal / currency.value) : 1;
            const unit = currency ? currency.symbol : 'руб.';

            myPlacemark.properties.set('gp', data.name);
            myPlacemark.properties.set('district', data.district);
            myPlacemark.properties.set('wall', data.wall);
            myPlacemark
              .properties
              .set('builder', data.builder);
            myPlacemark
              .properties
              .set('builderId', data.builderId);
            myPlacemark
              .properties
              .set('builderSlug', data.builderSlug);
            myPlacemark
              .properties
              .set('min_price',
                `${Helpers.priceFormatter(Math.round(data.min_price * course))} ${unit}`); //eslint-disable-line max-len
          },
          dataType: 'json'
        });
      });
      if(key === 0) {
        firstPlacemark = myPlacemark;
      }
      objects.add(myPlacemark);
    });

    myMap.geoObjects.add(objects);

    if(props.doNotHighlight !== false) {
      firstPlacemark.balloon.open();
    }
  }

  onChange() {
    const {currentPage, perPage, offset, isLoading} = FilterSettingsStore.get();

    this.setState({
      perPage: perPage,
      offset: offset,
      isLoading: isLoading,
      currentPage: currentPage
    });

  }

  init() {
    let firstObject;
    const props = this.props;
    const $this = this;

    this.state.objects = new ymaps.GeoObjectCollection();
    const {objects, houseItems} = this.state;
    const placemarkImg = {
      red: 'c186b928592fd054b20178af0f05ae362262040f',
      green: '158fb207fdfbec45a3d85d8865354cd13d9d0940',
      grey: '764405b09ef912aa09a9809c400d9ac5aef7fae8'
    };

    each(houseItems, (item, key) => {
      if (key === 0) {
        firstObject = item;
      }

      // Создание макета балуна на основе Twitter Bootstrap.
      const MyBalloonLayout = ymaps.templateLayoutFactory.createClass(
        '<div class="newhousecard">' +
        '<a class="close" href="#">&times;</a>' +
        '<div class="newhousecard--body">' +
        '$[[options.contentLayout observeSize minWidth=315 maxWidth=315]]' +
        '</div>' +
        '</div>', {
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
        });
      // Создание вложенного макета содержимого балуна.
      const location = Helpers.locationSlugUrl(item.slugUrl, props.dataUrl);
      const MyBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
        cardTemplate
      );
      let image = placemarkImg.grey;

      if (item.filterActive === false) {
        image = placemarkImg.grey;
      }
      if (key === 0 && props.doNotHighlight !== false) {
        image = placemarkImg.green;
      }
      const imgFileName = (data.options.mediaSource ?
      mediaHelpers.getApiMediaUrl(
        '320240',
        'photos',
        item.main_photo,
        data.options.mediaSource) :
        `//media.etagi.com/photos/325/233/0/1/0/0/0/0/0/
        ${item.main_photo.replace('/photos/', '')}`);

      const imgSymbols = image.toString().substr(0, 2);
      const myPlacemark = window.myPlacemark = new ymaps.Placemark(
        [item.la, item.lo],
        {
          gp: '',
          district: '',
          img: imgFileName,
          id: item.id,
          wall: '',
          photo: '',
          phone: '',
          fio: '',
          builder: '',
          builderId: '',
          min_price: '',
          location: location,
          // Свойства
          hintContent: item.gp,
          imgbal:
            `<img
            src="https://cdn-media.etagi.com/content/media/site/${imgSymbols[0]}/${imgSymbols}/${image}.png"
            width="31" height="39">`
        }, {
          balloonShadow: false,
          balloonLayout: MyBalloonLayout,
          balloonContentLayout: MyBalloonContentLayout,
          balloonPanelMaxMapArea: 0,
          iconLayout: 'default#image',
          iconImageHref:
            `https://cdn-media.etagi.com/content/media/site/${imgSymbols[0]}/${imgSymbols}/${image}.png`,
          iconImageSize: [31, 39],
          iconImageOffset: [-16, -45],
          draggable: false
        }
      );

      myPlacemark.events.add('balloonopen',() => {
        $.ajax({
          type: 'GET',
          url: '/backend/',
          data: {
            action: 'get_info_gk',
            city_id: 23,
            id: item.id
          },
          success: function(data) {
            const {currency} = wss.get();
            const course = currency ? (currency.nominal / currency.value) : 1;
            const unit = currency ? currency.symbol : 'руб.';

            myPlacemark
              .properties
              .set('gp', data.name);
            myPlacemark
              .properties
              .set('district', data.district);
            myPlacemark
              .properties
              .set('wall', data.wall); $this.wall = data.wall;
            myPlacemark
              .properties
              .set('builder', data.builder);
            myPlacemark
              .properties
              .set('builderId', data.builderId);
            myPlacemark
              .properties
              .set('builderSlug', data.builderSlug);
            myPlacemark
              .properties
              .set('min_price',
                `${Helpers.priceFormatter(Math.round(data.min_price * course))} ${unit}`); //eslint-disable-line max-len

          },
          dataType: 'json'
        });
      });
      objects.add(myPlacemark);
    });
    this.myMap = new ymaps.Map('FilterformMap', {
      center: [firstObject.la, firstObject.lo],
      zoom: 12,
      controls: ['zoomControl']
    });

    this.myMap.options.set('minZoom', 10);
    this.myMap.options.set('maxZoom', 14);

    if (props.disableScroll) {
      this.myMap.behaviors.disable('scrollZoom');
    }

    this.myMap.geoObjects.add(objects);
  }

  render() {
    const divStyle = {
      width: '100%',
      height: '100%'
    };
    const props = this.props;
    const classSet = classNames({
      'search--result__map': true,
      'col-md-6': props.visibleFilter,
      'col-md-8': !props.visibleFilter
    });

    return (
      <div className={classSet}>
          <div id="FilterformMap" style={divStyle}/>
      </div>
    );
  }
}

export default FilterformMap;
