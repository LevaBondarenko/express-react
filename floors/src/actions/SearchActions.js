/**
 * Searchform widget actions
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/

import Dispatcher from '../core/Dispatcher';
import SearchTypes from '../constants/SearchTypes';
import SearchStore from '../stores/SearchStore';
import Helpers from '../utils/Helpers';
import request from 'superagent';
import mss from '../stores/ModularSearcherStore';
import {clone, isEmpty, each, intersection, difference, reject} from 'lodash';

export default {

  change(type, value) {
    Dispatcher.handleViewAction({
      actionType: SearchTypes.SEARCHFORM_CHANGE,
      type: type,
      value: value,
      isLoading: true
    });
    $.ajax({
      type: 'GET',
      url: '/backend/',
      data: {
        action: 'search_filter',
        count: true,
        data: SearchStore.getModel()
      },
      success: (data) => {
        Dispatcher.handleViewAction({
          actionType: SearchTypes.SEARCHFORM_UPDATE,
          countHouse: data.house,
          countFlats: data.flats,
          activeStreets: data.streets,
          isLoading: false
        });
      },
      dataType: 'json'
    });
  },
  changeRevert(type, value, type2, value2) {
    Dispatcher.handleViewAction({
      actionType: SearchTypes.SEARCHFORM_CHANGEREVERT,
      type: type,
      type2: type2,
      value: value,
      value2: value2,
      isLoading: true
    });
    $.ajax({
      type: 'GET',
      url: '/backend/',
      data: {
        action: 'search_filter',
        count: true,
        data: SearchStore.getModel()
      },
      success: (data) => {
        Dispatcher.handleViewAction({
          actionType: SearchTypes.SEARCHFORM_UPDATE,
          countHouse: data.house,
          countFlats: data.flats,
          activeStreets: data.streets,
          isLoading: false
        });
      },
      dataType: 'json'
    });
  },

  fillCatalog() {
    $.ajax({
      type: 'GET',
      url: '/backend/',
      data: {
        action: 'search_catalogs',
        data: {
          city_id: 23,
          catalog: 'all'
        }
      },
      success: function(data) {
        Dispatcher.handleViewAction({
          actionType: SearchTypes.SEARCHFORM_FILLCOLLECTIONS,
          data
        });
      },
      dataType: 'json'
    });
  },

  setDataFromUrl(urlData) {
    Dispatcher.handleViewAction({
      actionType: SearchTypes.SEARCHFORM_SETURLDATA,
      data: urlData,
      isLoading: true
    });
  },

  getCount(model) {
    $.ajax({
      type: 'GET',
      url: '/backend/',
      data: {
        action: 'search_filter',
        data: model
      },
      success: function(data) {
        Dispatcher.handleViewAction({
          actionType: SearchTypes.SEARCHFORM_UPDATE,
          countHouse: data.house,
          countFlats: data.flats,
          activeStreets: data.streets,
          isLoading: false
        });
      },
      dataType: 'json'
    });
  },

  setResult(dataResult) {
    Dispatcher.handleViewAction({
      actionType: SearchTypes.SEARCHFORM_SETRESULT,
      data: dataResult,
      isLoading: false
    });
  },

  filterChange(type, value) {
    Dispatcher.handleViewAction({
      actionType: SearchTypes.SEARCHFORM_FILTERCHANGE,
      type: type,
      value: value,
      isLoading: true
    });
  },

  getModel() {
    Dispatcher.handleViewAction({
      actionType: SearchTypes.SEARCHFORM_GETMODEL
    });
  },

  setRestResult() {
    const model = SearchStore.getModel();
    const order = model.order || false;
    const direction = model.order_direction || false;
    const url = Helpers.generateSearchUrl(
      model, '/backend/?', order, direction
    );

    $.ajax({
      type: 'GET',
      url: url,
      data: {
        action: 'get_all_houses',
        limit: 1000,
        offset: 15
      },
      success: (data) => {
        Dispatcher.handleViewAction({
          actionType: SearchTypes.SEARCHFORM_SETRESULT,
          data: data
        });
      },
      dataType: 'json'
    });
  },

  getSearchResult(type, limit, offset, ...args) {
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
            searchSettings['trakt_id'],t => t == traktId);
        }
      });
    }

    /*global data*/
    const mssHasCity = mss.get('city_id') && mss.get('city_id').length > 0;
    const cityId = mssHasCity ? mss.get('city_id') :
      data.options.cityId;

    request
      .get('/msearcher_ajax.php')
      .set({'Cache-Control': 'public, max-age=21600'})
      .type('form')
      .query({
        action: 'modular_search',
        subAction: 'objects',
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
            actionType: SearchTypes.SEARCHFORM_SETRESULT,
            data: res.body.objects || []
          });
        }
      });
  }

};
