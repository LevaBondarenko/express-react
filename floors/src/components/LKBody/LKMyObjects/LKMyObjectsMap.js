/**
 * LK Salesman component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import createFragment from 'react-addons-create-fragment';
import classNames from 'classnames';
import wss from '../../../stores/WidgetsStateStore';
import {size, map, sortBy} from 'lodash';

import {lkTemplate} from '../../../utils/yandex/defaultTemplate';
import {templateFactory} from '../../SearchMap/newhouseCard';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';
import ga from '../../../utils/ga';

/*global ymaps, myMap, createPlacemark, data*/
class LKMyObjectsMap extends Component {
  static propTypes = {
    saveItem: PropTypes.func,
    scrollTonext: PropTypes.func,
    clearItem: PropTypes.func,
    realtyType: PropTypes.string
  };
  constructor(props) {
    super(props);
    this.state = {
      cityId: 23,
      cityName: 'Тюмень',
      street: '',
      house: '',
      suggest: [],
      query: '',
      collapsed: false,
      suggestPosition: NaN,
      result: null,
      addressWasSaved: false,
      toNextClicked: false
    };
  }

  componentDidMount() {
    const {selectedCity} = wss.get();

    selectedCity && this.setState(() => ({
      cityId: selectedCity.city_id,
      cityName: selectedCity.name
    }));
    ymaps.ready(this.init);
  }

  componentWillUnmount() {
    myMap.destroy();
  }

  handleSubmit = (event) => {
    const {query} = this.state;

    this.yandexSearch(query);
    event.preventDefault();
  };

  handleCityChange = (event) => {
    const {value} = event.target;
    const {addressWasSaved} = this.state;

    this.setState(() => ({
      cityId: parseInt(value),
      cityName: data.collections.cities[parseInt(value)].name.split(',')[0],
      street: '',
      house: '',
      query: ''
    }));
    if(addressWasSaved) {
      this.props.clearItem();
      this.setState(() => ({
        addressWasSaved: false
      }));
    }
  }

  handleSubmitKey = (event) => {
    const {field} = event.target.dataset;
    const {query, suggest, collapsed, suggestPosition} = this.state;

    if(event.keyCode === 13) {
      this.setState({
        collapsed: false,
        suggestPosition: NaN
      });

      this.yandexSearch(query);
    }

    if(event.keyCode === 27) {
      this.setState({
        collapsed: false,
        suggestPosition: NaN
      });
    }

    if(event.keyCode === 40 && collapsed) {
      const position = suggestPosition < size(suggest) - 1 ?
        suggestPosition + 1 : 0;

      this.setState({
        suggestPosition: position
      });
      this.suggestToggle(position, field);
    }

    if(event.keyCode === 38 && collapsed) {
      const position = suggestPosition === 0 ?
        size(suggest) - 1 : suggestPosition - 1;

      this.setState({
        suggestPosition: position
      });
      this.suggestToggle(position, field);
    }
  };

  suggestToggle = (position, field) => {
    const {collapsed, suggest, street} = this.state;

    if(collapsed && size(suggest) > 0) {
      const selected = suggest[position];
      let title = '';

      if(field === 'street') {
        selected.district &&
          (title += `${selected.districtType} ${selected.district}`);
        size(title) && selected.punkt && (title += ', ');
        selected.punkt &&
          (title += `${selected.punktType} ${selected.punkt}`);
        size(title) && selected.street && (title += ', ');
        selected.street &&
          (title += `${selected.streetType} ${selected.street}`);
      } else if(field === 'house') {
        title = selected.house;
      }

      this.setState({
        street: field === 'street' ? title : street,
        house: field === 'house' ? title : '',
        query: selected.value
      });
    }
  };

  trackEventCity = (e) => {
    ga('combobox', 'lk_myobjects_add_gorod');
    e.stopPropagation();
  }

  trackEventStreet = (e) => {
    ga('input', 'lk_myobjects_add_ulitsa');
    e.stopPropagation();
  }

  trackEventHouse = (e) => {
    ga('input', 'lk_myobjects_add_nomer_doma');
    e.stopPropagation();
  }


  handleChange = event => {
    const {value} = event.target;
    const {field} = event.target.dataset;
    const {cityName, street, addressWasSaved} = this.state;
    const search = field === 'street' ? `${cityName}, ${value}` :
      (field === 'house' ? `${cityName}, ${street}, ${value}` : cityName);
    const newState = {
      street: field === 'street' ? value : street,
      house: field === 'house' ? value : '',
      query: search,
      collapsed: field,
      result: null
    };


    if(size(value.trim()) > 0) {
      ymaps.suggest(search).then(items => {
        this.setState({
          suggest: map(items, item => {
            return this.parseAddress(item.value);
          })
        });
      });
    } else {
      newState.suggest = [];
    }

    if(addressWasSaved) {
      this.props.clearItem();
      newState.addressWasSaved = false;
    }

    this.setState(newState);
  };

  handleBlur = () => {
    setTimeout(() => {
      this.setState(() => ({collapsed: false}));
    }, 300);
  };

  handleSearch = (event) => {
    const {query, field, title} = event.target.dataset;
    const {street} = this.state;

    this.setState({
      street: field === 'street' ? title : street,
      house: field === 'house' ? title : '',
      query: query,
      collapsed: false
    });
    this.yandexSearch(query);
  };

  yandexSearch = query => {
    ymaps.geocode(query, {
      results: 1
    }).then(res => {

        // Выбираем первый результат геокодирования.
      const firstGeoObject = res.geoObjects.get(0),
        // Координаты геообъекта.
        coords = firstGeoObject.geometry.getCoordinates(),
        bounds = firstGeoObject.properties.get('boundedBy');

      myMap.setBounds(bounds, {
        checkZoomRange: true
      });
      myMap.setCenter(coords);

      if (myMap.geoObjects.getLength() === 1) {
        myMap.geoObjects.each(item => {
          item.geometry.setCoordinates(coords);
          item.balloon.open();
        });
        //myPlacemark.geometry.setCoordinates(coords);
      } else {
        const myPlacemark = createPlacemark(coords);

        myMap.geoObjects.add(myPlacemark);
        // Слушаем событие окончания перетаскивания на метке.
        myPlacemark.events.add('dragend', () => {
          this.getAddress(myPlacemark.geometry._coordinates);
        });
        myPlacemark.balloon.open();
      }
      this.getAddress(coords, query);
    });
  };
  // Определяем адрес по координатам (обратное геокодирование)
  getAddress = (coords, query = false) => {
    let myPlacemark;

    myMap.geoObjects.each(item => {
      myPlacemark = item;
    });


    myPlacemark.properties.set('iconContent', 'поиск...');
    ymaps.geocode(coords).then(res => {
      const firstGeoObject = res.geoObjects.get(0);

      this.setState(() => ({
        result: {
          coords: firstGeoObject.geometry._coordinates,
          address: firstGeoObject.properties.get('text')
        }
      }));
      if(this.state.toNextClicked && query) {
        this.props.saveItem(firstGeoObject.geometry._coordinates, query);
        this.props.scrollTonext();
        this.setState(() => ({
          addressWasSaved: true,
          toNextClicked: false
        }));
      }
    });
  };

  next = () => {
    const {result, query} = this.state;

    if(result) {
      this.props.saveItem(result.coords, query);
      this.props.scrollTonext();
      this.setState(() => ({
        addressWasSaved: true
      }));
    } else {
      this.setState(() => ({
        toNextClicked: true
      }));
      this.yandexSearch(query);
    }
    ga('button', 'lk_myobjects_add_step_1');
  }

  mapToggle = () => {
    console.log('mapToggle'); //eslint-disable-line no-console
  }

  init = () => {
    let coords = wss.get().selectedCity.coords.split(',');
    const {saveItem, scrollTonext} = this.props;
    const {setState} = this;


    coords = coords.map(item => parseFloat(item));

    const myMap = window.myMap = new ymaps.Map('LKMapWidget', {
      center: [coords[1], coords[0]],
      zoom: 12,
      controls: ['zoomControl']
    }, {
      searchControlProvider: 'yandex#search'
    });

    myMap.controls.add('zoomControl', {
      zoomStep: 4,
      visible: true,
      left: 200,
      top: 200
    });

    myMap.options.set('minZoom', 10);

    // Слушаем клик на карте
    myMap.events.add('click', event => {
      const coords = event.get('coords');

      // Если метка уже создана – просто передвигаем ее
      if (myMap.geoObjects.getLength() === 1) {
        myMap.geoObjects.each(item => {
          item.geometry.setCoordinates(coords);
          item.balloon.open();
        });
      } else {
        const myPlacemark = createPlacemark(coords);

        myMap.geoObjects.add(myPlacemark);
        // Слушаем событие окончания перетаскивания на метке.
        myPlacemark.events.add('dragend', () => {
          getAddress(myPlacemark.geometry.getCoordinates());
        });
        myPlacemark.balloon.open();
      }
      getAddress(coords);
    });


    const layout = ymaps.templateLayoutFactory.createClass(
      lkTemplate,
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
          this.element = $('.lkcard', this.getParentElement());
          this.element.on('click', '#submitHandle', event => {
            myMap.geoObjects.each(item => {
              saveItem(
                item.geometry._coordinates,
                item.properties._data.balloonContent
              );
            });

            scrollTonext();
            setState(() => ({addressWasSaved: true}));
            event.preventDefault();
          });
          this.applyElementOffset();
        },

        /**
         * Метод будет вызван системой шаблонов АПИ при изменении размеров вложенного макета.
         * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
         * @function
         * @name onSublayoutSizeChange
         * @return {void}
         */
        onSublayoutSizeChange: function() {
          layout
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
         * Используется для автопозиционирования (balloonAutoPan).
         * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ILayout.xml#getClientBounds
         * @function
         * @name getClientBounds
         * @returns {array} Координаты левого верхнего и правого нижнего углов шаблона относительно точки привязки.
         */
        getShape: function() {
          if (!this.isElement(this.element)) {
            return layout.superclass.getShape.call(this);
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


    const content = ymaps.templateLayoutFactory.createClass(
      templateFactory('lk')
    );
    // Создание метки
    const createPlacemark = window.createPlacemark = (coords) => {
      return new ymaps.Placemark(coords, {
        iconContent: 'поиск...'
      }, {
        balloonLayout: layout,
        balloonContentLayout: content,
        balloonPanelMaxMapArea: 0,
        hideIconOnBalloonOpen: false,
        iconLayout: 'default#image',
        iconImageHref: '//cdn-media.etagi.com/static/site/5/54/547b2e43c74f2978232e671c7ef636c3123a4d6d.png', // eslint-disable-line max-len
        iconImageSize: [36, 45],
        draggable: true,
      });
    };

    // Определяем адрес по координатам (обратное геокодирование)
    const getAddress = window.getAddress = (coords) => {
      let myPlacemark;

      myMap.geoObjects.each(item => {
        myPlacemark = item;
      });
      myPlacemark.properties.set('iconContent', 'поиск...');
      ymaps.geocode(coords).then(res => {
        const firstGeoObject = res.geoObjects.get(0);

        myPlacemark.properties.set({
          iconDesc: firstGeoObject.properties.get('description'),
          iconContent: firstGeoObject.properties.get('name'),
          balloonContent: firstGeoObject.properties.get('text')
        });
      });
    };

  }

  get suggestStreet() {
    const {suggest, query, collapsed, suggestPosition} = this.state;

    return collapsed === 'street' && size(suggest) > 0 && size(query) > 0 ? (
      <div id='lkobjects--search__suggest'>
        <ul id='my-listbox'>
          {suggest.map((item, key) => {
            const classList = key === suggestPosition ?
              'suggest-item suggest-active' : 'suggest-item';
            let title = '';

            item.district &&
              (title += `${item.districtType} ${item.district}`);
            size(title) && item.punkt && (title += ', ');
            item.punkt &&
              (title += `${item.punktType} ${item.punkt}`);
            size(title) && item.street && (title += ', ');
            item.street &&
              (title += `${item.streetType} ${item.street}`);

            return size(title) ? (
              <li key={key}
                className={classList}
                data-query={item.value}
                data-field='street'
                data-title={title}
                onClick={this.handleSearch}>
                <a
                  data-query={item.value}
                  data-field='street'
                  data-title={title}
                  title={title}>
                  {title}
                </a>
              </li>
            ) : null;
          })}
        </ul>
      </div>
    ) : false;
  }

  get suggestHouse() {
    const {suggest, query, collapsed, suggestPosition} = this.state;

    return collapsed === 'house' && size(suggest) > 0 && size(query) > 0 ? (
      <div id='lkobjects--search__suggest'>
        <ul id='my-listbox'>
          {suggest.map((item, key) => {
            const classList = key === suggestPosition ?
              'suggest-item suggest-active' : 'suggest-item';

            return item.house ? (
              <li key={key}
                className={classList}
                data-query={item.value}
                data-field='house'
                data-title={item.house}
                onClick={this.handleSearch}>
                <a
                  data-query={item.value}
                  data-field='house'
                  data-title={item.house}
                  title={item.house}>
                  {item.house}
                </a>
              </li>
            ) : null;
          })}
        </ul>
      </div>
    ) : false;
  }

  parseAddress = addr => {
    const reHouse = /.*,\s+(.*)*\s*$/gi;
    const reHouseSkip = /(улица|проезд|микрорайон|район|садовое товарищество|село|поселок|деревня)/; //eslint-disable-line max-len
    const reS1 = /.*,\s+([а-яё.0-9-\s]+)\s+(улица|проезд)+,*\s+(.*)*\s*$/gi;
    const reS2 = /.*,\s+(улица|проезд)+\s+([а-яё.0-9-\s]+)(,{1}.*|\s+)$/gi;
    const reD1 = /.*,\s+([а-яё.0-9-\s]+)\s+(микрорайон|район|садовое товарищество)+,*\s+(.*)*\s*$/gi; //eslint-disable-line max-len
    const reD2 = /.*,\s+(микрорайон|район|садовое товарищество)+\s+([а-яё.0-9-\s]+)(,{1}.*|\s+)$/gi; //eslint-disable-line max-len
    const reP1 = /.*,\s+([а-яё.0-9-\s]+)\s+(село|поселок|деревня)+,*\s+(.*)*\s*$/gi; //eslint-disable-line max-len
    const reP2 = /.*,\s+(село|поселок|деревня)+\s+([а-яё.0-9-\s]+)(,{1}.*|\s+)$/gi; //eslint-disable-line max-len
    const result = {};
    let aArr = reS1.exec(addr);

    if(aArr) {
      result.street = aArr[1];
      result.streetType = aArr[2];
    } else if(aArr = reS2.exec(addr)) {
      result.street = aArr[2];
      result.streetType = aArr[1];
    }
    aArr = reD1.exec(addr);
    if(aArr) {
      result.district = aArr[1];
      result.districtType = aArr[2];
    } else if(aArr = reD2.exec(addr)) {
      result.district = aArr[2];
      result.districtType = aArr[1];
    }
    aArr = reP1.exec(addr);
    if(aArr) {
      result.punkt = aArr[1];
      result.punktType = aArr[2];
    } else if(aArr = reP2.exec(addr)) {
      result.punkt = aArr[2];
      result.punktType = aArr[1];
    }
    if(result.street && (result.house = reHouse.exec(addr))) {
      result.house = result.house[1];
      if(reHouseSkip.exec(result.house)) {
        result.house = null;
      }
    }
    result.value = addr;

    return result;
  }

  render() {
    const {street} = this.state;
    const getContinueDisabled = !size(street.trim());
    const sortedCities = sortBy(data.collections.cities, item => {
      return item.name;
    });
    let cities = map(sortedCities, (item, key) => {
      return item.office && item.office.should_have_site ? (
        <option value={item.id} key={key}>
          {item.name}
        </option>
      ) : null;
    });

    cities = size(cities) > 0 ?
      createFragment({cities: cities}) :
      createFragment({cities: <div/>});

    return (
      <Col xs={6} xsOffset={2}>
        <div className='form-group clearfix'>
          <label className='control-label col-xs-6'>
            Город
          </label>
          <Col xs={6}>
            <select type='select'
              value={this.state.cityId}
              onChange={this.handleCityChange}
              placeholder='Город'
              onClick={this.trackEventCity}
              className='form-control'>
              {cities}
            </select>
          </Col>
        </div>
        <div className='form-group clearfix'>
          <label className='control-label col-xs-6'>
            Улица/проезд/микрорайон
          </label>
          <Col xs={6} className="lkobjects--search__input">
            <input type="text" id="lkobjectSearch--input"
              data-field='street'
              className='form-control'
              onChange={this.handleChange}
              onKeyDown={this.handleSubmitKey}
              onBlur={this.handleBlur}
              value={this.state.street}
              onClick={this.trackEventStreet}
              placeholder='Улица/проезд/микрорайон'/>
            {this.suggestStreet}
          </Col>
        </div>
        <div className='form-group clearfix'>
          <label className='control-label col-xs-6'>
            Номер дома
          </label>
          <Col xs={6} className="lkobjects--search__input">
            <input type="text" id="lkobjectSearch--input"
              data-field='house'
              className='form-control'
              onChange={this.handleChange}
              onKeyDown={this.handleSubmitKey}
              onClick={this.trackEventHouse}
              onBlur={this.handleBlur}
              value={this.state.house}
              placeholder='Номер дома'/>
            {this.suggestHouse}
          </Col>
        </div>
        <div className='form-group clearfix lkobjects--btn-wrap'>
          <Col xs={6} xsOffset={6}>
            <Button
              disabled={getContinueDisabled}
              className={classNames(
                {getContine: !getContinueDisabled},
                {disabled: getContinueDisabled}
              )}
              onClick={this.next}
              bsStyle='success'>
              Продолжить
            </Button>
          </Col>
        </div>
        <div id='LKMapWidget' style={{display: 'none'}}/>
      </Col>
    );
  }
}

export default LKMyObjectsMap;
