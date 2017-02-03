/**
 * Realty price chart widget container component
 *
 * @ver 0.0.1
 * @author tatarchuk
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import emptyFunction from 'fbjs/lib/emptyFunction';
import {clone, map, size} from 'lodash';
import Helpers from '../../utils/Helpers';

import wss from '../../stores/WidgetsStateStore';
import mss from '../../stores/ModularSearcherStore';

import ModularSearcherActions from '../../actions/ModularSearcherActions';
import RealtyExchangeAction from '../../actions/RealtyExchangeActions';

import RealtyPriceChartView from './RealtyPriceChartView';

/*global data*/
class RealtyPriceChart extends Component {
  static propTypes = {
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    })
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
      dataChart: {},
      categories: [],
      selectedPeriod: 1,
      typeGraph: 'graph',
      urlSettings: {
        cityId: '',
        classId: '',
        dateFrom: '',
        datePeriod: '',
        dateTo: '',
        districtsId: [],
        type: [],
        typeMSS: []
      }
    };
  }

  componentDidMount() {
    wss.onChange(this.onChangeWSS);
    mss.onChange(this.onChangeMSS);

    const cityId = data.options.cityId;

    RealtyExchangeAction.getTypes(cityId.toString());
    const mssData = {
      'city_id': cityId.toString(),
      class: 'flats'
    };

    ModularSearcherActions.set(null, mssData);
    ModularSearcherActions.getCollections();
  }

  componentWillUnmount() {
    wss.offChange(this.onChangeWSS);
    mss.offChange(this.onChangeMSS);
  }

  onChangeMSS = () => {
    const {
      city_id: cityId,
      class: classId,
      district_id: districtsId,
      typesAnalytics
    } = mss.get();
    const clState = clone(this.state);
    const typesAnalyticsData = wss.get().typesAnalytics || {
      flats: {
        pansion: '1',
        1: '2',
        2: '3',
        3: '4',
        '4+': '5'
      }
    };
    const modClassId = classId === 'nh_flats' ? 'newhousesflats' : classId;
    let getNewCollection = false;

    if (cityId !== clState.urlSettings.cityId) {
      clState.urlSettings.cityId = cityId;
      getNewCollection = true;
    }

    if (size(typesAnalytics) &&
     size(typesAnalytics) !== size(clState.urlSettings.typeMSS) &&
     classId === clState.urlSettings.classId) {
      clState.urlSettings.type = typesAnalytics;
      clState.urlSettings.typeMSS = typesAnalytics;
      getNewCollection = true;
    }

    if (classId !== clState.urlSettings.classId) {
      clState.urlSettings.classId = classId;
      getNewCollection = true;

      if (typesAnalyticsData) {
        const typesArr = [];

        map(typesAnalyticsData[modClassId], (v) => {
          typesArr.push(v);
        });

        clState.urlSettings.type = typesArr;
        clState.urlSettings.typeMSS = [];
      }
    } else if (!size(typesAnalytics) &&
     size(typesAnalytics) !== size(clState.urlSettings.typeMSS)) {
      const typesArr = [];

      map(typesAnalyticsData[modClassId], (v) => {
        typesArr.push(v);
      });

      clState.urlSettings.type = typesArr;
      clState.urlSettings.typeMSS = [];
      getNewCollection = true;
    }

    if (size(districtsId) !== size(clState.urlSettings.districtsId)) {
      if (!size(districtsId) &&
       !size(clState.urlSettings.districtsId)) {} else {
        clState.urlSettings.districtsId = districtsId;
        getNewCollection = true;
      }
    }

    if (getNewCollection) {
      RealtyExchangeAction.getCollections(clState);
    }
  }

  onChangeWSS = () => {
    const {
      date_from: dateFrom,
      date_to: dateTo,
      realty_exchange: realtyExchange,
      typeGraph
    } = wss.get();
    const clState = clone(this.state);
    const clRealtyExchange = clone(realtyExchange);
    let getNewCollection = false;

    if (dateFrom && dateFrom !== clState.urlSettings.dateFrom) {
      clState.urlSettings.dateFrom = dateFrom;
      getNewCollection = true;
    }

    if (dateTo && dateTo !== clState.urlSettings.dateTo) {
      clState.urlSettings.dateTo = dateTo;
      getNewCollection = true;
    }

    if (typeGraph !== clState.typeGraph) {
      clRealtyExchange.typeGraph = typeGraph;
    }

    if (getNewCollection) {
      RealtyExchangeAction.getCollections(clState);
    } else if (clRealtyExchange) {
      this.setState(clRealtyExchange);
    }
  }

  get chartsData() {
    const {dataChart, dataChartSelected, typeGraph} = this.state;
    const noData = !(typeGraph === 'graph' && size(dataChart) > 0 ||
     typeGraph !== 'graph');
    // Задаем русский перевод интерфейса графика
    const highchartsOptions = {
      lang: {
        rangeSelectorZoom: 'Маcштаб',
        rangeSelectorFrom: 'От',
        rangeSelectorTo: 'До',
        thousandsSep: ' ',
        months: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль',
          'Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
        shortMonths: ['янв.','фев.','мар','апр','май','июн','июл','авг',
          'сен','окт','ноя','дек'],
        weekdays: ['Вс.', 'Пн.', 'Вт.', 'Ср.', 'Чт.', 'Пт.', 'Сб.']
      }
    };
    const seriesChart = [];

    map(dataChart, (v, k) => {
      const units = k === 'land' ?
        ' руб./сотка' :
        ' руб./кв.м';

      seriesChart.push({
        color: Helpers.colorChart(k),
        data: v,
        marker: {
          enabled: false
        },
        name: Helpers.rusTypes(k),
        tooltip: {
          valueSuffix: units
        }
      });
    });

    const configChart = typeGraph === 'graph' ? {
      credits: {
        enabled: false
      },
      legend: {
        verticalAlign: 'top'
      },
      series: seriesChart,
      title: {
        text: null
      },
      tooltip: {
        shared: true
      },
      xAxis: {
        lineColor: '#494e58',
        minPadding: 0.08,
        startOnTick: false,
        type: 'datetime'
      },
      yAxis: {
        labels: {
          align: 'left',
          format: '{value:.,0f}',
          x: 3,
          y: 16
        },
        showFirstLabel: false,
        title: {
          text: 'стоимость'
        }
      }
    } : {
      chart: {
        type: 'column'
      },
      credits: {
        enabled: false
      },
      legend: {
        verticalAlign: 'top'
      },
      plotOptions: {
        column: {
          stacking: 'normal'
        }
      },
      series: dataChartSelected.yAxis,
      title: {
        text: null
      },
      tooltip: {
        pointFormat:
          '<span style="color:{series.color}">{series.name}</span>: ' +
          '<b>{point.y} шт.</b><br/>',
        shared: true
      },
      xAxis: {
        categories: dataChartSelected.xAxis,
        labels: {
          rotation: -45,
          y: 20
        },
        lineColor: '#494e58',
        type: 'category'
      },
      yAxis: {
        labels: {
          align: 'left',
          format: '{value:.,0f}',
          x: 3,
          y: 16
        },
        min: 0,
        showFirstLabel: false,
        title: {
          text: 'количество'
        }
      }
    };

    const highchartData = {
      configChart: configChart,
      highchartsOptions: highchartsOptions,
      noData: noData
    };

    return (highchartData);
  }

  render() {

    return (
      <RealtyPriceChartView
       highchartData={this.chartsData} />
    );
  }
}


export default RealtyPriceChart;
