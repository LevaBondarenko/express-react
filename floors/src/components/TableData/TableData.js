/**
 * Created by tatarchuk on 30.04.15.
 * TableData widget container component
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import emptyFunction from 'fbjs/lib/emptyFunction';
import {priceFormatter, rusTypes} from '../../utils/Helpers';
import {map, isEqual, keyBy, size, find, take, uniq, isNaN} from 'lodash';

import TableDataGraphView from './TableDataGraphView';
import TableDataMapView from './TableDataMapView';

import mss from '../../stores/ModularSearcherStore';
import wss from '../../stores/WidgetsStateStore';


class TableData extends Component {
  static propTypes = {
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
    select: PropTypes.string.isRequired
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
      distName: [],
      districtsId: [],
      template: props.select,
      typeGraph: 'chart',
      types: []
    };
  }

  componentDidMount() {
    mss.onChange(this.onChangeMSS);
    wss.onChange(this.onChangeWSS);
  }

  componentWillUnmount() {
    mss.off(this.onChangeMSS);
    wss.off(this.onChangeWSS);
  }

  onChangeMSS = () =>  {
    const {distName, template} = this.state;
    const {district_id: districtId} = mss.get()['collections'];

    if (!isEqual(distName, districtId) && size(districtId) > 0 &&
     template === 'map') {
      this.setState({
        distName: districtId
      });
    }
  }

  onChangeWSS = () => {
    const {template} = this.state;
    const typesAnalytics = wss.get()['typesAnalytics'] ?
      wss.get().typesAnalytics.cottages.land :
      null;

    if (wss.get()['realty_exchange']) {
      const {
        realty_exchange: {
          dataChart,
          dataChartMap,
          dataChartSelected,
          urlSettings: {
            districtsId,
            typeMSS
          }
        },
        typeGraph
      } = wss.get();
      let realtExchange = {};

      if (template === 'graph') {
        realtExchange.graph = dataChart;
        realtExchange.selected = dataChartSelected;
      } else if (template === 'map') {
        realtExchange = dataChartMap;
      }

      this.setState({
        dataChart: realtExchange,
        districtsId: districtsId,
        typeGraph: typeGraph,
        types: typeMSS,
        typesAnalytics: typesAnalytics
      });
    }
  }

  get mapData() {
    const {dataChart, districtsId, types, typesAnalytics} = this.state;
    const sortObj = keyBy(dataChart, 'price_meter');
    const countDistricts = size(sortObj);
    const activeDist = {};
    const activeObj = [];
    const percentDist = [];
    let averageCount = 0;
    let averagePrice = 0;
    let priceDesc = [];
    let summary = [];

    map(sortObj, (val, key) => {
      priceDesc.push(key);
    });

    if (size(districtsId) > 0) {
      map(districtsId, val => {
        const activeObj = find(sortObj, {'district_id': parseInt(val)});

        if (activeObj) {
          activeDist[activeObj.price_meter] = activeObj;
        }
      });
    }

    priceDesc.sort((a, b) => (b - a));

    map(priceDesc, val => {
      const objCount = sortObj[parseInt(val)].objects;

      averagePrice = parseInt(val) + averagePrice;
      averageCount = averageCount + objCount;
    });

    averagePrice = Math.round(averagePrice / countDistricts);
    averageCount = Math.round(averageCount / countDistricts);

    if (size(activeDist) === 1) {
      map(activeDist, val => {
        percentDist[0] =
          Math.round(100 * (val['price_meter'] / averagePrice)) - 100;
        percentDist[1] = Math.round(100 * (val.objects / averageCount)) - 100;
      });

      summary = this.computeSummary(10, size(types), 1, percentDist[0],
       percentDist[1], true);
    }

    priceDesc = take(priceDesc, 10);

    let countActive = size(activeDist);

    if (countActive > 0) {
      countActive = countActive > 10 ?
        0 :
        10 - countActive;

      priceDesc = take(priceDesc, countActive);
      map(activeDist, val => {
        priceDesc.push(val['price_meter'].toString());
        activeObj[val['district_id']] = 1;
      });

      priceDesc = uniq(priceDesc);
      priceDesc.sort((a, b) => {return b - a;});
    }

    const {distName} = this.state;
    const distNameArr = keyBy(distName, 'id');
    const unit = size(types) === 1 && typesAnalytics === types[0] ?
      'руб./сотка' :
      'руб./кв.м.';

    const mapData = map(priceDesc, (val/*, key*/) => {
      const distId = sortObj[parseInt(val)].district_id;
      const objCount = sortObj[parseInt(val)].objects;
      const distNameStr = distNameArr[distId] ?
        distNameArr[distId].name :
        '';

      const res = {
        active: activeObj[distId] === 1,
        count: `${objCount} шт.`,
        district: distNameStr,
        price: `${priceFormatter(val)} ${unit}`
      };

      return res;
    });

    const mapDataResult = {
      districtsData: mapData,
      summary: summary
    };

    return mapDataResult;
  }

  get chartData() {
    const {dataChart, districtsId, types, typeGraph} = this.state;
    const {graph: dCGraph} = dataChart;
    const typesPercent = {};

    let mainPCount = 0;
    let mainPPrice = 0;
    let defaultSummary = false;

    const itemsGraphData =  map(dCGraph, (val, key) => {
      const startPrice = val[0][1];
      const endPrice = val[size(val) - 1][1];
      const percent = Math.round(100 / (startPrice / endPrice)) - 100;

      mainPPrice = mainPPrice + percent;

      const nameType = rusTypes(key);

      typesPercent[nameType] = percent;

      const unit = nameType === 'Земельный участок' ?
        'руб./сотка' :
        'руб./кв.м.';

      const res = {
        countable: `${priceFormatter(endPrice)} ${unit}`,
        name: nameType,
        percent: percent
      };

      return res;
    });

    const itemChartData = map(dataChart.selected.yAxis, (val) => {
      const firstElem = val.data[0];
      const lastElem = val.data[size(val.data) - 1] || 1;
      const desc = firstElem / lastElem || 1;
      const percentSelected = Math.round(100 / desc) - 100;

      mainPCount = percentSelected + mainPCount;

      const res = val.name ? {
        countable: `${priceFormatter(val.data[size(val.data) - 1])} шт.`,
        name: val.name,
        percent: percentSelected
      } :
      null;

      return res;
    });

    mainPCount = mainPCount / size(dataChart.selected.yAxis);
    mainPPrice = mainPPrice / size(dataChart.graph);
    mainPPrice = isNaN(mainPPrice) ? 0 : mainPPrice;

    const arrPercent = [];

    const summary = this.computeSummary(5, size(types), size(districtsId),
     mainPPrice, mainPCount, false);

    if (!size(summary)) {
      map(typesPercent, val => {
        arrPercent.push(val);
      });

      arrPercent.sort();

      const commonComment = 'Данные представлены совокупно по типам и районам. Являясь обобщенным индикатором движения цены данные могут не отражать реальной картины по конкретному типу недвижимости или району'; // eslint-disable-line max-len
      const compositeComment = `В заданном временном периоде максимальную динамику по средней цене предложения за квадратный метр на уровне ${arrPercent[size(arrPercent) - 1]}% к началу периода демонстрируют объекты: `; // eslint-disable-line max-len

      summary.push({
        header: 'Внимание!!! У вас выбрано несколько Типов недвижимости и Районов', // eslint-disable-line max-len
        comment: commonComment
      });
      summary.push({
        header: 'Справочно',
        comment: compositeComment
      });

      defaultSummary = true;
    }

    const graphDataResult = {
      defaultSummary: defaultSummary,
      itemChartData: itemChartData,
      itemsGraphData: itemsGraphData,
      summary: summary,
      typeGraph: typeGraph
    };

    return graphDataResult;
  }

  computeSummary = (param, types, districts, percentPrice, percentCount = 0,
   typeMap) => {
    const singleTypeSelected = types === 1;
    const singleDistrictSelected = districts === 1;
    const priceLevel = percentPrice > param ?
      0 :
      (percentPrice < -param ?
        2 :
        1);
    const supplyLevel = percentCount > param ?
      0 :
      (percentCount < -param ?
        2 :
        1);
    const summary = [];

    if (typeMap) {
      const mapArr = [
        [
          'как высоко востребованный с перспективами развития, т.к. относительно других цены в данном районе выше и большое количество предложения', // eslint-disable-line max-len
          'как высоко востребованный, характеризующийся среднерыночным уровнем предложения и самыми высокими ценами', // eslint-disable-line max-len
          'как востребованный район, характеризующийся относительно высокими ценами по сравнению с другими районами, но отличающийся достаточно низким предложением' // eslint-disable-line max-len
        ],

        [
          'как район с хорошей востребованностью, характеризующийся среднерыночной ценой по городу и самым большим количеством предложения', // eslint-disable-line max-len
          'как район с хорошей востребованностью, характеризующийся среднерыночными показателями по цене и предложению', // eslint-disable-line max-len
          'как район с хорошей востребованностью, характеризующийся среднерыночной ценой по городу и самым малым количеством предложения' // eslint-disable-line max-len
        ],

        [
          'как низковостребованный, т.к. характеризуется относительно большим количеством предложения с достаточно низкими ценами', // eslint-disable-line max-len
          'как слабо востребованный район, отличающийся по отношению к другим районам самой низкой ценой и среднерыночным уровнем предложения', // eslint-disable-line max-len
          'как слабо востребованный район, отличающийся по отношению к другим районам самой низкой ценой и самым малым количеством предложения' // eslint-disable-line max-len
        ]
      ];

      summary.push({
        header: 'Комментарий',
        comment: `В сравнении с другими районами города, выбранный оценивается ${mapArr[priceLevel][supplyLevel]}` // eslint-disable-line max-len
      });
    } else {
      if (singleDistrictSelected || singleTypeSelected) {
        const placeSelected = singleDistrictSelected ?
          'и выбранном районе' :
          'на рынке';
        const typeSelected = singleTypeSelected ?
          ' по выбранному типу недвижимости,' :
          ',';
        const multipleComments = (!priceLevel && supplyLevel === 2) ||
         (priceLevel === 2 && !supplyLevel);
        const graphArr = [
          [
            `наблюдается рост предложения с параллельным ростом цены${typeSelected} что в краткосрочной перспективе будет обеспечивать дальнейший рост предложения, а в долгосрочной приведет к неминуемому снижению цен`, // eslint-disable-line max-len
            `наблюдается явный рост цены${typeSelected} что формирует условия для роста предложений в краткосрочной перспективе`, // eslint-disable-line max-len
            [
              `существует явный дефицит предложения${typeSelected} что в перспективе будет способствовать дальнейшему повышению цены`, // eslint-disable-line max-len
              `сформировались оптимальные условия для продажи${typeSelected} в краткосрочной перспективе дальнейший рост цены приведет к росту предложения` // eslint-disable-line max-len
            ]
          ],

          [
            `наблюдается рост предложения${typeSelected} что в краткосрочной перспективе будет способствовать снижению цены и сформирует оптимальные условия для покупки`, // eslint-disable-line max-len
            `сформировалось равновесие между предложением и спросом${typeSelected} в данных условиях оптимальными будут как операции продажи, так и покупки`, // eslint-disable-line max-len
            `ярко выражено снижение предложения в совокупности со стабильной ценой${typeSelected} что создает предпосылки к росту цены в краткосрочной перспективе` // eslint-disable-line max-len
          ],

          [
            [
              `сформировались оптимальные условия для покупки${typeSelected} в краткосрочной перспективе дальнейшее снижение цены приведет к сокращению предложения`, // eslint-disable-line max-len
              `сформировался явный переизбыток предложения${typeSelected} что в краткосрочной перспективе будет оказывать дальнейшее давление на цену в сторону снижения` // eslint-disable-line max-len
            ],
            `наблюдается снижение цены${typeSelected} что создает предпосылки для снижения количества предложений в краткосрочной перспективе`, // eslint-disable-line max-len
            `наблюдается снижение предложений с параллельным снижением цены${typeSelected} что создает предпосылки для дальнейшего снижения предложения в краткосрочной перспективе, что, в свою очередь, приведет к росту цены в долгосрочной перспективе` // eslint-disable-line max-len
          ]
        ];

        if (!multipleComments) {
          summary.push({
            header: 'Комментарий',
            comment: `В заданном периоде ${placeSelected} ${graphArr[priceLevel][supplyLevel]}` // eslint-disable-line max-len
          });
        } else {
          summary.push({
            header: 'Комментарий для покупателя',
            comment: `В заданном периоде ${placeSelected} ${graphArr[priceLevel][supplyLevel][0]}` // eslint-disable-line max-len
          });
          summary.push({
            header: 'Комментарий для продавца',
            comment: `В заданном периоде ${placeSelected} ${graphArr[priceLevel][supplyLevel][1]}` // eslint-disable-line max-len
          });
        }
      }
    }

    return summary;
  }

  render() {
    const {dataChart, template} = this.state;
    const resData = template === 'graph' && dataChart.graph &&
     dataChart.selected ?
      this.chartData :
      (template === 'map' ?
        this.mapData :
        null);

    return (
      <div>
        {resData ?
          (template === 'graph' ?
            <TableDataGraphView
             resData={resData} /> :
            <TableDataMapView
             resData={resData} />) :
          null
        }
      </div>
    );
  }
}

export default TableData;
