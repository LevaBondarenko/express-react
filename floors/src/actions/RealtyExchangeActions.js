/**
 * Searchform widget actions
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
import {indexOf, size} from 'lodash';
import request from 'superagent';
import moment from 'moment/moment';
import WidgetsActions from '../actions/WidgetsActions';
import Helpers from '../utils/Helpers';

import wss from '../stores/WidgetsStateStore';

export default {
  getCollections(state) {
    /* формируем api запрос */
    const dataArr = {};

    dataArr.action = 'rialto';
    dataArr.city_id = state.urlSettings.cityId || '23';
    dataArr.district = state.urlSettings.districtsId || [];
    dataArr.date_to = state.urlSettings.dateTo ?
      state.urlSettings.dateTo :
      moment().format('YYYY-MM-DD');
    dataArr.date_from = state.urlSettings.dateFrom;
    dataArr.type = state.urlSettings.type ? state.urlSettings.type : null;
    dataArr.resolution = 100;
    dataArr.stacked_count = 12;
    dataArr.data = ['graph', 'stacked', 'districts'];

    /* генерируем api запрос */
    const serialize = function(obj, prefix) {
      const str = [];

      for(const p in obj) {
        if (obj.hasOwnProperty(p)) {
          const k = prefix ? `${prefix}[${p}]` : p;
          const v = obj[p];

          str.push(typeof v === 'object' ?
            serialize(v, k) :
            `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
        }
      }

      return str.join('&');
    };

    const query = `/backend/?${serialize(dataArr)}`;

    /* отправляем api запрос */
    request
      .get(query)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if(err || !res.body.data) {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка получения данных. Попробуйте обновить страницу',
            type: 'dang'
          }]);
        } else {
          const storeData =  res.body.data;
          const mergeArr = state.urlSettings.type;
          const typesArr = wss.get().typesAnalytics || {};
          const dataChart = {};
          const catalog = {};
          const dataChartSelected = {
            xAxis: [],
            yAxis: []
          };
          let fromMs = '';
          let toMs = '';

          Object.keys(storeData.graph).forEach(key => {
            const sDG = storeData.graph[key];

            dataChart[key] = [];

            fromMs = moment(sDG[0].date).format('x');
            toMs = moment(sDG[size(sDG) - 1].date).format('x');

            state.urlSettings.dateFrom = sDG[0].date;
            state.urlSettings.dateTo = sDG[size(sDG) - 1].date;

            Object.keys(sDG).map(key2lvl => {
              dataChart[key].push([parseInt(moment(sDG[key2lvl].date)
                .format('x')), sDG[key2lvl].price_meter]);
            });
          });

          Object.keys(typesArr).map(key => {
            Object.keys(typesArr[key]).map(key2lvl => {
              const catalogKey = indexOf(mergeArr, typesArr[key][key2lvl]);

              if (catalogKey > -1) {
                catalog[typesArr[key][key2lvl]] = {
                  color: Helpers.colorChart(key2lvl),
                  data: [],
                  name: Helpers.rusTypes(key2lvl)
                };
              }
            });
          });

          Object.keys(storeData.stacked).forEach(key => {
            const sDS = storeData.stacked[key];

            dataChartSelected.xAxis.push(key);
            Object.keys(catalog).map(key2lvl => {
              catalog[key2lvl].data.push(sDS[key2lvl] || 0);
            });
          });

          Object.keys(catalog).map(key => {
            dataChartSelected.yAxis.push(catalog[key]);
          });

          const dataChartMap = storeData.districts;
          const newState = {
            dataChart: dataChart,
            dataChartMap: dataChartMap,
            dataChartSelected: dataChartSelected,
            maxDate: toMs,
            minDate: fromMs,
            typeGraph: state.typeGraph,
            urlSettings: state.urlSettings
          };
          const data = {
            date_from: state.urlSettings.dateFrom,
            date_to: state.urlSettings.dateTo,
            realty_exchange: newState
          };

          WidgetsActions.set(null, data);
        }
      });
  },

  getTypes(cityId) {
    const query = `/backend/?action=rialto&city_id=${cityId}&data[]=types`;

    request
      .get(query)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if(err || !res.body.data) {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка получения данных. Попробуйте обновить страницу',
            type: 'dang'
          }]);
        } else {
          const storeData =  res.body.data.types ? res.body.data.types : 0;
          const typesFormat = {};

          if (storeData) {
            Object.keys(storeData).map(key => {
              if (storeData[key].action !== 'lease') {
                if (typesFormat[storeData[key].class]) {
                  typesFormat[storeData[key].class][storeData[key].type] = key;
                } else {
                  typesFormat[storeData[key].class] = {};
                  typesFormat[storeData[key].class][storeData[key].type] = key;
                }
              }
            });
          }

          WidgetsActions.set(null, {
            typesAnalytics: typesFormat,
            isLoading: false
          });
        }
      });
  }
};
