/**
 * Modular Searcher actions
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */
/*eslint camelcase: [2, {properties: "never"}]*/
/*global data*/
import request from 'superagent';
import Dispatcher from '../core/Dispatcher';
import ModularSearcherTypes from '../constants/ModularSearcherTypes';
import WidgetsActions from '../actions/WidgetsActions';
import mss from '../stores/ModularSearcherStore';
import wss from '../stores/WidgetsStateStore';
import {clone, map, isArray, difference,
  size, includes, omit} from 'lodash';
import {generateSearchUrl, rusTypes, periodSet} from '../utils/Helpers';

export default {

  getCollections() {
    const dataArr = clone(mss.get());

    dataArr.action = 'modular_search';
    dataArr.subAction = 'collections';

    const mssHasCity = mss.get('city_id') && mss.get('city_id').length > 0;

    dataArr['city_id'] = mssHasCity ? mss.get('city_id') :
      data.options.cityId.toString();


    const uri = generateSearchUrl(dataArr, '/msearcher_ajax.php?');

    request
      .get(uri)
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'public, max-age=21600'
      })
      .end((err, res) => {
        if(err) {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка получения данных с сервера. Попробуйте обновить страницу', // eslint-disable-line max-len
            type: 'dang'
          }]);
        } else if(!res.body.ok) {
          WidgetsActions.set('notify',[{
            msg: `Ошибка получения данных с сервера: ${res.text}. Попробуйте обновить страницу`, // eslint-disable-line max-len
            type: 'dang'
          }]);
        } else {
          const colls = res.body.collections;

          try {
            const typesAnalyticsData = wss.get().typesAnalytics || {};

            if (typesAnalyticsData) {
              let className = mss.get('class');

              className = className === 'nh_flats' ? 'newhousesflats' :
                  className;

              const typesFormat = [];

              map(typesAnalyticsData[className], (v, k) => {
                typesFormat.push({id: v, name: rusTypes(k)});
              });

              colls.typesAnalytics = typesFormat;
            }
          } catch (err) {}

          const model = mss.get();
          const newmodel = {collections: colls, isLoading: false};
          let modelChanged = false;

          for(const i in colls) {
            if(colls[i] && model[i]) {
              const ids = map(colls[i], item => item.id.toString());

              if(isArray(model[i])) {
                const diffs = difference(model[i], ids);

                if(size(diffs) > 0) {
                  newmodel[i] = difference(model[i], diffs);
                  modelChanged = true;
                }
              } else {
                newmodel[i] = includes(ids, model[i]) ? model[i] : '';
              }
            }
          }
          Dispatcher.handleViewAction({
            actionType: ModularSearcherTypes.MSS_SET,
            property: null,
            data: newmodel
          });
          if(modelChanged) {
            this.getCount();
          }
        }
      });
  },

  getCount(model = null) {
    const dataArr = model ? model : clone(mss.get());

    dataArr.isLoading || Dispatcher.handleViewAction({
      actionType: ModularSearcherTypes.MSS_SET,
      property: 'isLoading',
      data: true
    });
    dataArr.action = 'modular_search';
    dataArr.subAction = 'count';

    const mssHasCity = mss.get('city_id') && mss.get('city_id').length > 0;

    dataArr['city_id'] = mssHasCity ? mss.get('city_id') :
      data.options.cityId.toString();
    dataArr['class'] = dataArr['class'] ?
      dataArr['class'] : dataArr['realtyType'];



    const uri = generateSearchUrl(dataArr, '/msearcher_ajax.php?');

    request
      .get(uri)
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'public, max-age=21600'
      })
      .end((err, res) => {
        if(err) {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка получения данных с сервера. Попробуйте обновить страницу', // eslint-disable-line max-len
            type: 'dang'
          }]);
        } else if(!res.body.ok) {
          WidgetsActions.set('notify',[{
            msg: `Ошибка получения данных с сервера: ${res.text}. Попробуйте обновить страницу`, // eslint-disable-line max-len
            type: 'dang'
          }]);
        } else {
          Dispatcher.handleViewAction({
            actionType: ModularSearcherTypes.MSS_SET,
            property: null,
            data: {
              count: res.body.count,
              count_houses: res.body.count_houses || 0,
              isLoading: false}
          });
        }
      });
  },

  set(id, data) {
    id || (data.isLoading = true);
    Dispatcher.handleViewAction({
      actionType: ModularSearcherTypes.MSS_SET,
      property: id,
      data: data
    });
    if(id === 'city_id') {
      Dispatcher.handleViewAction({
        actionType: ModularSearcherTypes.MSS_SET,
        property: null,
        data: {'district_id': [], 'street_id': [], 'trakt_id': [],
          'deadline_date': []}
      });
    }

    if (id === 'class') {
      Dispatcher.handleViewAction({
        actionType: ModularSearcherTypes.MSS_SET,
        property: null,
        data: {typesAnalytics: []}
      });
    }

    //TODO: придумать гибкий механизм определения необходимости пересчета
    if (id !== 'offset') {
      this.getCount();
    }
    if(id === 'district_id' || id === 'city_id' || id === 'builder_id' ||
      id === 'class' || id === 'street_id') {
      this.getCollections();
    }
  },

  toggle(id, data) {
    const dataModel = mss.get(id);

    if(includes(dataModel, data)) {
      Dispatcher.handleViewAction({
        actionType: ModularSearcherTypes.MSS_DEL,
        property: id,
        data: [data]
      });
    } else {
      Dispatcher.handleViewAction({
        actionType: ModularSearcherTypes.MSS_SET,
        property: id,
        data: [data]
      });
    }
    if(id === 'city_id') {
      Dispatcher.handleViewAction({
        actionType: ModularSearcherTypes.MSS_SET,
        property: null,
        data: {'district_id': [], 'street_id': [], 'trakt_id': [],
          'deadline_date': []}
      });
    }
    this.getCount();
    if(id === 'district_id' || id === 'city_id' || id === 'builder_id' ||
      id === 'class' || id === 'street_id') {
      this.getCollections();
    }
  },

  del(id, data) {
    Dispatcher.handleViewAction({
      actionType: ModularSearcherTypes.MSS_DEL,
      property: id,
      data: [data]
    });
    if(id === 'city_id') {
      Dispatcher.handleViewAction({
        actionType: ModularSearcherTypes.MSS_SET,
        property: null,
        data: {'district_id': [], 'street_id': [], 'trakt_id': [],
          'deadline_date': []}
      });
    }
    this.getCount();
    if(id === 'district_id' || id === 'city_id') {
      this.getCollections();
    }
  },

  omit(properties) {
    Dispatcher.handleViewAction({
      actionType: ModularSearcherTypes.MSS_OMIT,
      data: properties,
    });
    this.getCount();
  },

  flush() {
    Dispatcher.handleViewAction({
      actionType: ModularSearcherTypes.MSS_FLUSH,
    });
  },

  smartFlush() {
    Dispatcher.handleViewAction({
      actionType: ModularSearcherTypes.MSS_SMARTFLUSH,
    });
  },

  // migrated filter actions

  async getLimits(limit, offset) {
    const dataArr = clone(mss.get()) || {};

    dataArr.action = 'modular_search';
    dataArr.subAction = 'minmax';
    const mssHasCity = mss.get('city_id') && mss.get('city_id').length > 0;

    dataArr['city_id'] = mssHasCity ? mss.get('city_id') :
      data.options.cityId.toString();
    dataArr.limit = limit;
    dataArr.offset = offset;

    //выдача рендерится раньше, MSearcherSubmit, из за этого, когда выполняется
    //этот метод, хранилище еще не заполнено
    dataArr['class'] = dataArr['class'] ?
      dataArr['class'] : dataArr['realtyType'];

    const uri = generateSearchUrl(dataArr, '/msearcher_ajax.php?');

    request
      .get(uri)
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'public, max-age=21600'
      })
      .end((err, res) => {
        if(!err && res.ok) {
          const data = res.body.minmax[0];

          Dispatcher.handleViewAction({
            actionType: ModularSearcherTypes.MSS_SET,
            property: 'count',
            data: parseInt(data.count),
            isLoading: true
          });
          Dispatcher.handleViewAction({
            actionType: ModularSearcherTypes.MSS_SET,
            property: 'count_houses',
            data: parseInt(data.count_houses),
            isLoading: true
          });
          Dispatcher.handleViewAction({
            actionType: ModularSearcherTypes.MSS_SET,
            property: 'limits',
            data: omit(data, 'count'),
            isLoading: true
          });
        }
      });
  },

  async getCountPeriod(limit, offset, periodName, cb) {
    const dataArr = clone(mss.get()) || {};
    const property = periodName || 'countAll';
    const period = periodSet(
        property.replace('count', '').toLowerCase()
      ) || '';

    dataArr.action = 'modular_search';
    dataArr.subAction = 'count';
    dataArr.limit = limit;
    dataArr.offset = offset;
    dataArr['date_create_min'] = period;
    const mssHasCity = mss.get('city_id') && mss.get('city_id').length > 0;

    dataArr['city_id'] = mssHasCity ? mss.get('city_id') :
      data.options.cityId.toString();

    //выдача рендерится раньше, MSearcherSubmit, из за этого, когда выполняется
    //этот метод, хранилище еще не заполнено
    dataArr['class'] = dataArr['class'] ?
      dataArr['class'] : dataArr['realtyType'];

    const uri = generateSearchUrl(dataArr, '/msearcher_ajax.php?');

    request
      .get(uri)
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'public, max-age=21600'
      })
      .end((err, res) => {
        if(!err && res.ok) {
          Dispatcher.handleViewAction({
            actionType: ModularSearcherTypes.MSS_SET,
            property: property,
            data: parseInt(res.body.count),
            isLoading: true
          });
          cb && cb(parseInt(res.body.count));
        }
      });
  },

  getSearchResult(limit, offset) {
    const dataArr = clone(mss.get()) || {};

    dataArr.action = 'modular_search';
    dataArr.subAction = 'objects';

    dataArr.limit = limit;
    dataArr.offset = offset;
    const mssHasCity = mss.get('city_id') && mss.get('city_id').length > 0;

    dataArr['city_id'] = mssHasCity ? mss.get('city_id') :
      data.options.cityId.toString();

    const uri = generateSearchUrl(dataArr, '/msearcher_ajax.php?');

    request
      .get(uri)
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'public, max-age=21600'
      })
      .end((err, res) => {
        if(!err && res.ok) {
          Dispatcher.handleViewAction({
            actionType: ModularSearcherTypes.MSS_SET,
            property: 'objects',
            data: res.body.objects,
            isLoading: true
          });
        }
      });
  }

};
