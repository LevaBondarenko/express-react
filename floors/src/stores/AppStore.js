/**
 * Master store
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

import EventEmitter from 'eventemitter3';
import {assignIn, union, filter, difference} from 'lodash';

const CHANGE_EVENT = 'change';

class AppStore extends EventEmitter {

  constructor() {
    super();
    this.data = {};
  }

  /**
  * Emits change event to all registered event listeners.
  *
  * @returns {Boolean} Indication if we've emitted an event.
  */
  emitChange() {
    return this.emit(CHANGE_EVENT);
  }

  /**
  * Register a new change event listener.
  *
  * @param {function} callback Callback function.
  * @returns {void}
  */
  onChange(callback) {
    this.on(CHANGE_EVENT, callback);
  }

  /**
  * Remove change event listener.
  *
  * @param {function} callback Callback function.
  * @returns {void}
  */
  offChange(callback) {
    this.off(CHANGE_EVENT, callback);
  }

  /**
  * Retrieving data from store
  *
  * @param {string} property - name of data
  * @returns {object} retrieved data value if exist
  * @throws exception if the key does not exist
  */
  get(property) {
    if(!property) {
      return this.data;
    } else if(property in this.data) {
      return this.data[property];
    } else {
      throw (`Unknown property ${property} in store!`);
    }
  }

  /**
  * Saving data in store
  *
  * @param {string} property - name of data
  * @param {object} data - value of data
  * @returns {void}
  * @todo checking for validity of input parameters
  */
  set(property, data) {
    if(property) {
      if(this.data[property] !== undefined) {
        if(Object.prototype.toString.call(data) === '[object Object]') {
          this.data[property] = assignIn(this.data[property], data);
        } else if (Object.prototype.toString.call(data) === '[object Array]' &&
          data.length) {
          this.data[property] = union(this.data[property], data);
        } else {
          this.data[property] = data;
        }
      } else {
        this.data[property] = data;
      }
    } else {
      this.data = assignIn(this.data, data);
    }
  }

  /**
  * Retrieving filtered data from store
  *
  * @param {string} property - name of data
  * @param {function} predicate - test function
  * @returns {void}
  */
  filter(property, predicate) {
    if(property in this.data) {
      return filter(this.data[property], predicate);
    } else {
      throw new Error(`Property ${property} not found!`);
    }
  }

  /**
  * Deleting data in store
  *
  * @param {string} property - name of data
  * @param {object} data - if property is array - data will be deleted from array
  * @returns {void}
  * @todo checking for validity of input parameters
  */
  del(property, data) {
    if(property) {
      if(Object.prototype.toString.call(data) === '[object Array]') {
        this.data[property] = difference(this.data[property], data);
      } else {
        delete this.data[property];
      }
    }
  }

  // Ф-я удаляет заданные св-ва из хранилища
  omit(properties) {
    for (let i = 0; i < properties.length; i++) {
      if (Object.prototype.toString.call(this.data[properties[i]]) === '[object Array]') { // eslint-disable-line max-len
        this.data[properties[i]] = [];
      } else {
        this.data[properties[i]] = null;
      }
    }
  }

  /**
  * cleaning the store
  *
  * @returns {void}
  */
  flush() {
    this.data = {};
  }
}

AppStore.dispatchToken = null;

export default AppStore;
