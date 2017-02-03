/**
 * MapAnalytics container component
 *
 * @ver 0.0.1
 *
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import emptyFunction from 'fbjs/lib/emptyFunction';
import Helpers from '../../utils/Helpers';
import {isEqual} from 'lodash';
import request from 'superagent';

import MapAnalyticsView from './MapAnalyticsView';

/**
 * React/Flux entities
 */
import mss from '../../stores/ModularSearcherStore';
import wss from '../../stores/WidgetsStateStore';

import WidgetsActions from '../../actions/WidgetsActions';

import withCondition from '../../decorators/withCondition';

/* global data */
@withCondition()
class MapAnalytics extends Component {
  static propTypes = {
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
    defaultZoomYa: React.PropTypes.string,
    maxZoomYa: React.PropTypes.string,
    minZoomYa: React.PropTypes.string,
    stepYa: React.PropTypes.string
  };

  static defaultProps = {
    defaultZoomYa: '11',
    maxZoomYa: '18',
    minZoomYa: '4',
    stepYa: '2'
  };

  static childContextTypes = {
    insertCss: PropTypes.func.isRequired
  };

  getChildContext() {
    const context = this.props.context;

    return {
      insertCss: context.insertCss || emptyFunction,
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      doneLoading: false,
      isLoading: true,
      mssLoaded: false,
      mssReady: false,
      typesAnalytics: [],
      typesAnalyticsOld: [],
      wssReady: false
    };
  }

  componentDidMount() {
    mss.onChange(this.onChangeMSS);
    wss.onChange(this.onChangeWSS);
  }

  componentWillUnmount() {
    mss.offChange(this.onChangeMSS);
    wss.offChange(this.onChangeWSS);
  }

  onChangeWSS = () => {
    const {
      realty_exchange: realtyExchange
    } = wss.get();

    this.setState({
      dataChartMap: realtyExchange ? realtyExchange.dataChartMap : {},
      wssReady: realtyExchange ? true : false
    });

    this.checkReadiness;
  }

  onChangeMSS = () => {
    const {
      city_id: cityId,
      collections: {
        district_id: collectionsDistricts
      },
      isLoading,
      typesAnalytics
    } = mss.get();
    const {
      distrIds: distrIdsOld,
      distrIdsUpdated: distrIdsUpdatedOld,
      mssLoaded,
      typesAnalytics: typesAnalyticsOld,
      typesAnalyticsUpdated: typesAnalyticsUpdatedOld
    } = this.state;
    const distrIds = Object.keys(collectionsDistricts)
      .map(key => collectionsDistricts[key].id);
    const mssLoadedNew = mssLoaded || distrIds.length;
    let typesAnalyticsUpdated = typesAnalyticsUpdatedOld;
    let distrIdsUpdated = distrIdsUpdatedOld;

    if (!typesAnalyticsUpdated) {
      typesAnalyticsUpdated = !isEqual(typesAnalytics, typesAnalyticsOld);
    }

    if (!distrIdsUpdated) {
      distrIdsUpdated = !isEqual(distrIdsOld, distrIds);
    }

    this.setState(() => ({
      cityId: cityId,
      distrIds: distrIds,
      distrIdsUpdated: distrIdsUpdated,
      isLoading: isLoading,
      mssLoaded: mssLoadedNew,
      mssReady: cityId && mssLoadedNew && (distrIdsUpdated ||
       typesAnalyticsUpdated) ?
        true :
        false,
      typesAnalytics: typesAnalytics,
      typesAnalyticsUpdated: typesAnalyticsUpdated
    }));

    this.checkReadiness;
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!this.state.doneLoading && nextState.doneLoading) {
      return true;
    }

    return false;
  }

  get checkReadiness() {
    const {mssReady, wssReady} = this.state;

    if (wssReady && mssReady) {
      this.MDAData;

      this.setState({
        distrIdsUpdated: false,
        mssReady: false,
        typesAnalyticsUpdated: false,
        wssReady: false
      });
    }
  }

  get MDAData() {
    this.setState({
      doneLoading: false
    });

    const {
      cityId,
      dataChartMap,
      distrIds,
      typesAnalytics
    } = this.state;
    const {
      coords: cityCoords
    } = data.collections.cities[cityId];
    const coordsArr = cityCoords.split(',');
    const coords = Object.keys(coordsArr).map(key =>
     parseFloat(coordsArr[key]));
    const dataMapAnalytics = {};
    let maxPrice = 100000000;
    let minPrice = 0;

    if (dataChartMap && Object.keys(dataChartMap).length) {
      const priceArr = [];

      Object.keys(dataChartMap).map(key => {
        const val = dataChartMap[key];

        priceArr.push(val.price_meter);
        dataMapAnalytics[val.district_id] = val.price_meter;
      });
      priceArr.sort((a,b) => {return a - b;});

      while (priceArr[Object.keys(priceArr).length - 1] / priceArr[0] > 10) {
        priceArr.splice(Object.keys(priceArr).length - 1, 1);
        priceArr.splice(0, 1);
      }

      minPrice = priceArr[0] ? priceArr[0] : 0;
      maxPrice = priceArr[Object.keys(priceArr).length - 1] ?
        priceArr[Object.keys(priceArr).length - 1] :
        0;
    }

    const stepAnalytics = Math.ceil((maxPrice - minPrice) / 1020);
    const unit = Object.keys(typesAnalytics).length === 1 &&
     typesAnalytics[0] === '7' ?
      'руб./сотка' : 'руб./кв.м';
    const units = Object.keys(typesAnalytics).length === 1 &&
     typesAnalytics[0] === '7' ?
      'сотку' : 'кв.м';
    const step = [];

    step.push(`меньше ${Math.round(minPrice / 1000)} тыс. ${unit}`);
    for (let i = 0; i < 4; i++) {
      const priceMin = Math.round(
        (minPrice + (255 * i) * stepAnalytics) / 1000);
      const priceMax = Math.round(
        (minPrice + (255 * (i + 1)) * stepAnalytics) / 1000);

      step.push(`${priceMin} - ${priceMax} тыс. ${unit}`);
    }
    step.push(`больше ${Math.round((minPrice + 1020 * stepAnalytics) / 1000)} тыс. ${unit}`); // eslint-disable-line max-len

    const dataArr = [];

    if (distrIds.length) {
      const args = {
        action: 'get_map_areas',
        city: [cityId],
        districtsIds: distrIds,
        lvl: 2
      };

      /* отправляем api запрос */
      request
        .post('/backend/')
        .query(args)
        .set('Accept', 'application/json')
        .end((err, res) => {
          if(err || (!res || !res.ok || res.error)) {
            WidgetsActions.set('notify',[{
              msg: 'Ошибка получения данных. Попробуйте обновить страницу',
              type: 'dang'
            }]);
          } else {
            const districtsData = JSON.parse(res.text);

            Object.keys(districtsData).map(key => {
              const properties = {};
              const {
                balloonContent,
                coordinates,
                district_id: districtId,
                id,
                level,
                name,
                params: {
                  strokeStyle
                },
                parent_id: parentId,
                settings
              } = districtsData[key];
              const priceDistrict = dataMapAnalytics[districtId] || '';

              if (settings[0]) {
                properties.hintContent = `${name}
                  <br />Средняя цена за ${units}:
                  ${Helpers.priceFormatter(priceDistrict)} ${unit}`;
              }

              if (settings[1]) {
                properties.balloonContent = balloonContent;
              }

              const curStep = priceDistrict ?
                Math.ceil((priceDistrict - minPrice) / stepAnalytics) :
                false;
              const color = curStep !== false ?
               Helpers.shadeColor(curStep) :
               '#eeeeee';
              const styleProps = {
                fillColor: color,
                opacity: '0.6',
                strokeColor: '#fff',
                strokeStyle: strokeStyle,
                strokeWidth: '2'
              };

              const res = {
                cityId: cityId,
                coordinates: coordinates,
                districtId: districtId,
                id: id,
                level: level,
                name: name,
                parentId: parentId,
                properties: properties,
                settings: settings,
                styleProps: styleProps
              };

              dataArr.push(res);
            });

            const resData = {
              coords: coords,
              dataArr: dataArr,
              step: step
            };

            this.setState({
              doneLoading: true,
              mapData: resData
            });
          }
        });
    }
  }

  render() {
    const {doneLoading, mapData} = this.state;
    const hasData = mapData && Object.keys(mapData).length;

    return (
      <div>
        {doneLoading && hasData ?
          (<MapAnalyticsView
           mapData={mapData}
           {...this.props} />) :
          null
        }
      </div>
    );
  }
}

export default MapAnalytics;
