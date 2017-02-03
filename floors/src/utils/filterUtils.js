/*
 * Etagi project
 * widget helpers constant
 * o.e.kurgaev@it.etagi.com
 */

/**
 * appComponents
 */
import {min, max, filter, sortBy, map, toArray} from 'lodash';
import {flattenObject} from './Helpers';
import Uri from 'jsuri';

const filterUtils = {
  /**
   * get min value from collection
   * @param {string} property name of property
   * @param {array} collection list of items
   * @param {boolean} notNull property must be not null
   * @return {string} return min value
   */
  getMin(property, collection, notNull = false) {
    collection = map(collection, item => {
      item = flattenObject(item);
      item = toArray(item);
      if(notNull) {
        item = filter(item, value => parseInt(value[property]) !== 0);
      }
      item = sortBy(item, (i) => {
        return parseInt(i[property]);
      });
      if (item.length > 0) {
        return parseFloat(item[0][property]);
      }

    });
    return Math.floor(min(collection));
  },
  /**
   * get max value from collection
   * @param {string} property name of property
   * @param {array} collection list of items
   * @return {string} return max value
   */
  getMax(property, collection) {
    collection = collection.map(item => {
      item = flattenObject(item);
      item = toArray(item);
      return parseFloat(max(item, property)[property]);
    });

    return Math.ceil(max(collection));
  },
  addParam(url, param, value) {
    const uri = new Uri(url);

    if(uri.getQueryParamValue(param)) {
      uri.replaceQueryParam(param, value);
    } else {
      uri.addQueryParam(param, value);
    }
    return uri.query();
  }
};

export default filterUtils;
