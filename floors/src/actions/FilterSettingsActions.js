/**
 * filtersettings actions
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

import Dispatcher from '../core/Dispatcher';
import FilterSettingsTypes from '../constants/FilterSettingsTypes';
import mss from '../stores/ModularSearcherStore';
import request from 'superagent';
import {omit, extend, isEmpty, each, intersection, reject, difference, clone}
  from 'lodash';

export default {
  async set(property, data) {
    Dispatcher.handleViewAction({
      actionType: FilterSettingsTypes.FILTER_SET,
      property: property,
      data: data,
      isLoading: true
    });
  },

  async getCount(type, limit, offset, ...args) {
    const searchSettings = clone(args[0]) || {};
    const filterSettings = clone(args[1]) || {};

    const counts = searchSettings.collections.districtsByTrakts;

    // отсекаем ненужные районы, если выбран целый тракт
    if (!isEmpty(counts)) {
      each(searchSettings.trakt_id, (traktId) => {
        const sel = intersection(searchSettings.district_id, counts[traktId])
          .length;
        const total = counts[traktId].length;

        if (sel === total || sel === 0) {
          searchSettings['district_id'] = difference(
            searchSettings['district_id'],counts[traktId]);
        } else {
          searchSettings['trakt_id'] = reject(
            searchSettings['trakt_id'], t => t == traktId);
        }
      });
    }

    /* global data */
    const mssHasCity = mss.get('city_id') && mss.get('city_id').length > 0;
    const cityId = mssHasCity ? mss.get('city_id') :
      data.options.city_id;

    request
      .get('/msearcher_ajax.php')
      .type('form')
      .query({
        action: 'modular_search',
        subAction: 'count',
        class: type,
        'city_id': cityId,
        limit: limit,
        offset: offset
      })
      .query(searchSettings)
      .query(filterSettings)
      .end((err, res) => {
        if(!err && res.ok) {
          Dispatcher.handleViewAction({
            actionType: FilterSettingsTypes.FILTER_SET,
            property: 'count',
            data: parseInt(res.body.count),
            isLoading: true
          });
          Dispatcher.handleViewAction({
            actionType: FilterSettingsTypes.FILTER_SET,
            property: 'count_houses',
            data: parseInt(res.body.count_houses),
            isLoading: true
          });
        }
      });
  },

  async getLimits(type, limit, offset, ...args) {
    /* global data */
    const searchSettings = clone(args[0]) || {};
    const filterSettings = clone(args[1]) || {};
    const mssHasCity = mss.get('city_id') && mss.get('city_id').length > 0;
    const cityId = mssHasCity ? mss.get('city_id') :
      data.options.city_id;

    request
      .get('/msearcher_ajax.php')
      .type('form')
      .query({
        action: 'modular_search',
        subAction: 'minmax',
        class: type,
        'city_id': cityId,
        limit: limit,
        offset: offset
      })
      .query(searchSettings)
      .query(filterSettings)
      .end((err, res) => {
        if(!err && res.ok) {
          const data = res.body.minmax[0];

          Dispatcher.handleViewAction({
            actionType: FilterSettingsTypes.FILTER_SET,
            property: 'count',
            data: parseInt(data.count),
            isLoading: true
          });
          Dispatcher.handleViewAction({
            actionType: FilterSettingsTypes.FILTER_SET,
            property: 'count_houses',
            data: parseInt(data.count_houses),
            isLoading: true
          });
          Dispatcher.handleViewAction({
            actionType: FilterSettingsTypes.FILTER_SET,
            property: 'limits',
            data: omit(data, 'count'),
            isLoading: true
          });
        }
      });
  },

  async getCountPeriod(type, limit, offset, ...args) {
    /* global data */
    const searchSettings = clone(args[0]) || {};
    const property = args[2] || 'countAll';
    const period = args[3] || '';
    let filterSettings = args[1] || {};
    const mssHasCity = mss.get('city_id') && mss.get('city_id').length > 0;
    const cityId = mssHasCity ? mss.get('city_id') :
      data.options.city_id;

    filterSettings = extend(filterSettings, {'date_create_min': period});
    request
      .get('/msearcher_ajax.php')
      .type('form')
      .query({
        action: 'modular_search',
        subAction: 'count',
        class: type,
        'city_id': cityId,
        limit: limit,
        offset: offset
      })
      .query(searchSettings)
      .query(filterSettings)
      .end((err, res) => {
        if(!err && res.ok) {
          Dispatcher.handleViewAction({
            actionType: FilterSettingsTypes.FILTER_SET,
            property: property,
            data: parseInt(res.body.count),
            isLoading: true
          });
        }
      });
  }
};
