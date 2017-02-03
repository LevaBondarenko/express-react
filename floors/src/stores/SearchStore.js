/**
 * Searchform store
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

import Dispatcher from '../core/Dispatcher';
import SearchTypes from '../constants/SearchTypes';
import EventEmitter from 'eventemitter3';
import {assign, filter, includes, without, isArray, isObject, has,
  omit, chain, extend, isString, isEmpty, each,
  mapValues} from 'lodash';
import Immutable, {List} from 'immutable';

/*eslint camelcase: [2, {properties: "never"}]*/

var CHANGE_EVENT = 'change';

var SearchStore = assign({}, EventEmitter.prototype, {

  model: {
    //city_id: '23',
    cities: [],
    whatisthat: 'new_zastr_sell',
    action: 'newsearch',
    districts: [],
    streets: [],
    // ф-ия на лету генерирует массив id улиц, которые соответствуют выбранным районам
    validStreets: function() {
      var model = SearchStore.model,
        activeStreets = SearchStore.activeStreets;

      return activeStreets && activeStreets.length ?
        filter(
          model.streets, strId => includes(activeStreets, parseInt(strId))
        ) : model.streets;
    },
    rooms: [],
    count: '',
    price_min: '',
    price_max: '',
    square_min: '',
    square_max: '',
    price_type: '1',
    deadline: 0,
    deadline_data: {},
    countHouse: '',
    countFlats: 11013
  },

  collections: {},
  activeStreets: [],
  isLoading: false,
  searchResult: new List(),
  filterSettings: {
    floor: [],
    floors: [],
    square: [],
    square_kitchen: [],
    noFirst: false,
    noLast: false,
    hasActions: false,
    hasInstallment: false,
    type: [],
    facing: []
  },
  filterResult: [],

  setResult(data) {
    data = data ? data : [];
    this.searchResult = Immutable.fromJS(data).toList();
  },

  getResult() {
    return this.searchResult.toJS();
  },

  getFilteredResult() {
    return [];
  },

  filterChange(type, value) {
    if (type === 'facing') {
      if (includes(this.filterSettings.facing, value)) {
        this.filterSettings.facing = without(
          this.filterSettings.facing, value
        );
      } else {
        this.filterSettings.facing.push(value);
      }
    } else if (type === 'type') {
      if (includes(this.filterSettings.type, value)) {
        this.filterSettings.type = without(this.filterSettings.type, value);
      } else {
        this.filterSettings.type.push(value);
      }
    } else {
      this.filterSettings[type] = value;
    }
  },

  getFilterSettings() {
    return this.filterSettings;
  },

  getStatus() {
    return this.isLoading;
  },

  setRooms(value) {
    if (includes(this.model.rooms, value)) {
      this.model.rooms = without(this.model.rooms, value);
    } else {
      this.model.rooms.push(value);
    }
  },

  setValue(type, value, isLoading) {
    let currentYear, currentQuarter;

    if (isArray(this.model[type])) {
      if (includes(this.model[type], value)) {
        this.model[type] = without(this.model[type], value);
      } else {
        this.model[type].push(value);
      }
    } else if (isObject(this.model[type]) && isObject(value)) {

      currentYear = chain(value).keys().first().value();

      if (has(this.model[type], currentYear)) {

        this.model[type] = omit(this.model[type], currentYear);

      } else {

        this.model[type] = extend(this.model[type], value);
      }

    } else if (isObject(this.model[type]) && isString(value)) {
      currentQuarter = value.split('/')[0];
      currentYear = value.split('/')[1];

      if (includes(this.model[type][currentYear], parseInt(currentQuarter))) {
        this.model[type][currentYear] = without(
          this.model[type][currentYear], parseInt(currentQuarter)
        );
        if (isEmpty(this.model[type][currentYear])) {
          this.model[type] = omit(this.model[type], currentYear);
        }
      } else {

        if (has(this.model[type], currentYear)) {
          this.model[type][currentYear].push(parseInt(currentQuarter));
        } else {
          this.model[type] = extend(this.model[type], {[currentYear]: []});
          this.model[type][currentYear].push(parseInt(currentQuarter));
        }

      }

    } else {
      this.model[type] = value;
    }

    this.isLoading = isLoading;
  },

  getModel() {
    return this.model;
  },

  getCleanModel() {
    let model = omit(
      this.model, ['validStreets', 'countHouse', 'countFlats',
        'cities', 'whatisthat', 'action', 'price_type']
    );

    model = omit(model, value => {
      return isEmpty(value);
    });
    return model;
  },

  fillCollection(data) {
    this.collections = data;
  },

  setUrlData(data) {
    const self = this;

    each(data, (parameter) => {
      mapValues(parameter, (value, type) => {
        switch (type) {
        case 'price-start': type = 'price_min'; break;
        case 'price-end': type = 'price_max'; break;
        case 'square-start': type = 'square_min'; break;
        case 'square-end': type = 'square_max'; break;
        case 'build-year-end':
          type = 'deadline_data';
          value = value.replace('_', '/');
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

  clearArray(type, value, isLoading) {
    this.model[type] = [];
    this.isLoading = isLoading;
  },

  setCount(house, flats, isLoading) {
    this.model.countHouse = house;
    this.model.countFlats = flats;
    this.isLoading = isLoading;
  },

  setActiveStreets(activeStreets) {
    this.activeStreets = activeStreets ? activeStreets : [];
  },

  /**
  * Emits change event to all registered event listeners.
  *
  * @returns {Boolean} Indication if we've emitted an event.
  * @return {void}
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

SearchStore.dispatcherToken = Dispatcher.register((payload) => {
  const action = payload.action;

  switch (action.actionType) {
  case SearchTypes.SEARCHFORM_CHANGE:
    if (action.value === 'clear') {
      SearchStore.clearArray(action.type, action.value, action.isLoading);
    } else {
      SearchStore.setValue(action.type, action.value, action.isLoading);
    }
    SearchStore.emitChange();
    break;

  case SearchTypes.SEARCHFORM_CHANGEREVERT:
    SearchStore.setValue(action.type, action.value, action.isLoading);
    SearchStore.setValue(action.type2, action.value2, action.isLoading);
    SearchStore.emitChange();
    break;

  case SearchTypes.SEARCHFORM_FILLCOLLECTIONS:
    SearchStore.fillCollection(action.data);
    SearchStore.emitChange();
    break;

  case SearchTypes.SEARCHFORM_SETURLDATA:
    SearchStore.setUrlData(action.data);
    break;

  case SearchTypes.SEARCHFORM_UPDATE:
    SearchStore.setCount(
      action.countHouse, action.countFlats, action.isLoading
    );
    const activeStreets = action.activeStreets;

    SearchStore.setActiveStreets(activeStreets);
    SearchStore.emitChange();
    break;

  case SearchTypes.SEARCHFORM_SETRESULT:
    SearchStore.setResult(action.data, action.isLoading);
    SearchStore.emitChange();
    break;

  case SearchTypes.SEARCHFORM_FILTERCHANGE:
    SearchStore.filterChange(action.type, action.value);
    SearchStore.emitChange();
    break;

  default:
  // Do nothing
  }

});

export default SearchStore;
