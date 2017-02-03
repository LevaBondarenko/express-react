/**
 * FilterQuarter store
 *
 * @ver 0.0.1
 * @author tatarchuk.v.b@gmail.com
 */

import {assign, isArray, without, each,
    mapValues, map, includes, size, sample} from 'lodash';
import Dispatcher from '../core/Dispatcher';
import FilterQuarterTypes from '../constants/FilterQuarter';
import EventEmitter from 'eventemitter3';
import request from 'superagent';
import {generateSearchUrl} from '../utils/Helpers';

/*eslint camelcase: [2, {properties: "never"}]*/

var CHANGE_EVENT = 'change';

var FilterQuarterStore = assign({}, EventEmitter.prototype, {
  model: {
    rooms: [],
    count: '',
    price: [],
    priceInterval: [],
    square: [],
    squareInterval: []
  },
  floors: [],
  sections: [],
  myHouse: {},
  myFlat: {
    active: true
  },
  filterHouse: {},
  collections: {},
  comission: [],
  fullCollections: {},
  anyFlat: {},
  typeLayout: '1',
  typeBuild: '1',
  isLoading: false,
  currentCell: null,

  getStatus() {
    return this.isLoading;
  },

  arrayMin(array) {
    return Math.min.apply(Math, array);
  },

  setValue(type, value, isLoading) {
    if (isArray(this.model[type])) {

      if (type === 'rooms') {
        if (includes(this.model[type], value)) {
          this.model[type] = without(this.model[type], value);
          if (type === 'rooms' && +value === 4) {
            this.model.rooms = without(
                this.model.rooms, '5', '6', '7', '8', '9', '10'
            );
          }
        } else {
          this.model[type].push(value);
          if (type === 'rooms' && +value === 4) {
            this.model.rooms.push('5', '6', '7', '8', '9', '10');
          }
        }
      } else if (type === 'square') {
        this.model[type] = value;
      } else if (type === 'price') {
        this.model[type] = value;
      }
    } else {
      this.model[type] = value;
    }
    this.isLoading = isLoading;
  },

  setType(value) {
    this.typeBuild = value;
  },

  getModel() {
    return this.model;
  },

  filter(data) {
    this.fullCollections = data;
  },
  changeHouse(data) {
    this.myHouse = data;
  },

  setComission(data) {
    const arrData = {
      id: data.id,
      section: data.section,
      floor: data.floor,
      flats: data.rooms,
      comission: data.comission
    };

    this.comission.push(arrData);
  },

  setFlat(data, layout) {
    window.location.hash = `#${data.id}`;
    this.myFlat = data;

    if (data.dolshik) {
      this.typeLayout = '0';
    }

    this.myFlat.layout = layout;
  },

  getFlat() {
    return this.myFlat;
  },

  setUrlData(data) {
    const self = this;

    each(data, parameter => {
      mapValues(parameter, (value, type) => {
        switch (type) {
        case 'price-start':
          type = 'price_min';
          break;
        case 'price-end':
          type = 'price_max';
          break;
        default:
        }
        self.setValue(type, value, false);
      });
    });
  },

  getCollections() {
    return this.collections;
  },
  getFullCollections() {
    return this.fullCollections;
  },
  getMyHouse() {
    return this.myHouse;
  },

  layoutClick(data) {
    this.typeLayout = data;
  },

  clearArray(type, value, isLoading) {
    this.model[type] = [];
    this.isLoading = isLoading;
  },

  setCount(house, flats, isLoading) {
    this.model.countHouse = house;
    this.model.countFlats = flats;
    this.isLoading = isLoading;
  },
  countFlats(data) {
    let countFlats = 0;

    const dataEdit = JSON.parse(JSON.stringify(data));

    const model = this.model;
    const sections = this.sections;

    if (model.priceInterval.length === 0 || model.squareInterval.length === 0) {
      let minSquareVal = 1000,
        maxSquareVal = 0,
        minPriceVal = 100000000,
        maxPriceVal = 0;

      map(data.sections, (val, keySection) => {
        sections.push(keySection);
        map(val.floors, val2 => {
          map(val2.flats, val3 => {
            if (minSquareVal > val3.square) {
              minSquareVal = +val3.square;
            }
            if (maxSquareVal < val3.square) {
              maxSquareVal = +val3.square;
            }
            if (minPriceVal > val3.price_discount) {
              minPriceVal = +val3.price_discount;
            }
            if (maxPriceVal < val3.price_discount) {
              maxPriceVal = +val3.price_discount;
            }
          });
        });
      });
      minSquareVal = (+minSquareVal - 1).toFixed(0);

      maxSquareVal = (+maxSquareVal + 1).toFixed(0);
      model.priceInterval = [minPriceVal, maxPriceVal];
      model.price = [minPriceVal, maxPriceVal];
      model.squareInterval = [minSquareVal, maxSquareVal];
      model.square = [minSquareVal, maxSquareVal];
    }

    const rooms = this.model.rooms;
    const minPrice = this.model.price[0];
    const maxPrice = this.model.price[1];
    const minArea = this.model.square[0];
    const maxArea = this.model.square[1];
    const minPriceAr = [];
    let myFlat = this.myFlat;
    let hashId = false;
    let minimal = 0;
    const hash = window.location.hash ?
        parseInt(window.location.hash.replace('#', '')) : null;

    map(data.sections, (val, key) => {
      map(val.floors, (val2, key2) => {
        map(val2.flats, (val3, key3) => {
          if (val3.id === hash) {
            hashId =  val3;
          }
          /*фильтр квартир по дому*/
          if (minPrice <= +val3.price_discount &&
              +val3.price_discount <= maxPrice &&
              minArea <= +val3.square &&
              +val3.square <= maxArea &&
              (includes(model.rooms, val3.rooms.toString()) ||
              (includes(model.rooms, '4') &&
              (val3.rooms.toString() >= '4')) ||
              rooms.length === 0)) {
            val3.active = true;
          } else {
            val3.active = false;
            delete dataEdit.sections[key].floors[key2].flats[key3];
          }

          // выбираем квартиру с самой низкой стоимостью
          if (val3.active && +val3.price_discount) {
            minPriceAr.push(+val3.price_discount);
            minimal = this.arrayMin(minPriceAr);
            if (minimal >= parseInt(val3.price_discount)) {
              myFlat = val3;
            }
          }
        });
      });
    });
    this.myFlat = hashId ? hashId : myFlat;
    // получаем комиссию для выбранной квартиры
    if (!this.myFlat.comission) {
      const dataArr = {
        'action': 'get_comission',
        'id': this.myFlat.id,
        'class': this.myFlat.class
      };
      const uri = generateSearchUrl(dataArr, '/backend/?');

      request
          .get(uri)
          .set({
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'public, max-age=21600'
          }).end((err, res) => {
            if (res.body) {
              this.myFlat.comission = res.body[0] ? (
              res.body[0].comission ?
                  res.body[0].comission : 0
          ) : '';
            }
          });
    }

    map(dataEdit.sections, val => {
      map(val.floors, val3 => {
        countFlats += size(val3.flats);
      });
    });
    this.model.count = countFlats;
    this.filterHouse = dataEdit;
  },

  neighborFlat(section, floor, price, event) {
    let minPrice = 0.9 * price;
    let maxPrice = 1.1 * price;

    minPrice = minPrice.toFixed(0);
    maxPrice = maxPrice.toFixed(0);
    let dataFlat;
    let i = 0;

    if (event === 'up') {
      map(this.filterHouse.sections[section].floors, (val2, key2) => {
        map(val2.flats, val3 => {
          if (floor < key2 && (+val3.price_discount < maxPrice) &&
              (+val3.price_discount > minPrice) && i === 0) {
            dataFlat = val3;
            i = 1;
          }
        });
      });
    } else if (event === 'down') {
      map(this.filterHouse.sections[section].floors, (val2, key2) => {
        map(val2.flats, (val3) => {
          if (floor > key2 && (+val3.price_discount < maxPrice) &&
              (+val3.price_discount > minPrice) && i === 0) {
            dataFlat = val3;
            i = 1;
          }
        });
      });
    } else if (event === 'prev') {
      return (false);
    } else if (event === 'next') {
      return (false);
    }
    this.anyFlat = dataFlat;
  },
  setCurrentSection(id) {
    this.currentSection = id;
  },

  /**
   * Emits change event to all registered event listeners.
   *
   * @returns {Boolean} Indication if we've emitted an event.
   */
  emitChange() {
    return this.emit(CHANGE_EVENT);
  },

  /**
   * Register a new change event listener.
   *
   * @param {function} callback Callback function.
   * @return {void}
   */
  onChange(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  /**
   * Remove change event listener.
   *
   * @param {function} callback Callback function.
   * @return {void}
   */
  off(callback) {
    this.off(CHANGE_EVENT, callback);
  }

});

FilterQuarterStore.dispatcherToken = Dispatcher.register((payload) => {
  const action = payload.action;

  switch (action.actionType) {

  case FilterQuarterTypes.FILTERQUARTER_CHANGE:
    if (action.value === 'clear') {
      FilterQuarterStore.clearArray(
          action.type, action.value, action.isLoading
      );
    } else {
      FilterQuarterStore.setValue(action.type, action.value, action.isLoading);
      FilterQuarterStore.countFlats(FilterQuarterStore.myHouse);
    }

    FilterQuarterStore.emitChange();
    break;

  case FilterQuarterTypes.FILTERQUARTER_CLICK:
    FilterQuarterStore.setType(action.value);
    FilterQuarterStore.emitChange();
    break;

  case FilterQuarterTypes.FILTERQUARTER_FULLCOLLECTIONS:
    FilterQuarterStore.filter(action.gp);
    const firstHouse = sample(action.gp);

    FilterQuarterStore.changeHouse(firstHouse);
    FilterQuarterStore.countFlats(firstHouse);
    FilterQuarterStore.emitChange();
    break;

  case FilterQuarterTypes.FILTERQUARTER_SETURLDATA:
    FilterQuarterStore.setUrlData(action.data);
    break;

  case FilterQuarterTypes.FILTERQUARTER_SETFLAT:
    FilterQuarterStore.setFlat(action.data, action.layout);
    FilterQuarterStore.emitChange();
    break;

  case FilterQuarterTypes.FILTERQUARTER_SETCOMISSION:
    FilterQuarterStore.setComission(action.data);
    FilterQuarterStore.emitChange();
    break;

  case FilterQuarterTypes.FILTERQUARTER_GETFLAT:
    FilterQuarterStore.getFlat();
    break;

  case FilterQuarterTypes.FILTERQUARTER_MINMORTGAGE:
    FilterQuarterStore.setMinPrice(action.data);
    FilterQuarterStore.emitChange();
    break;

  case FilterQuarterTypes.FILTERQUARTER_LAYOUTCLICK:
    FilterQuarterStore.layoutClick(action.value);
    FilterQuarterStore.emitChange();
    break;
  case FilterQuarterTypes.FILTERQUARTER_NEIGHBORFLAT:
    FilterQuarterStore.neighborFlat(
        action.section, action.floor, action.price, action.event
    );
    break;

  case FilterQuarterTypes.FILTERQUARTER_UPDATE:
    FilterQuarterStore.setCount(
        action.countHouse, action.countFlats, action.isLoading
    );
    FilterQuarterStore.emitChange();
    break;

  case FilterQuarterTypes.FILTERQUARTER_SET_CURRENT_SECTION:
    FilterQuarterStore.setCurrentSection(action.section);
    FilterQuarterStore.emitChange();
    break;



  default:
    // Do nothing

  }

});

export default FilterQuarterStore;
