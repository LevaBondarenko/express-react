import request from 'superagent';
import api from '../api/apiLK';
import wss from '../stores/WidgetsStateStore';
import WidgetsActions from '../actions/WidgetsActions';
import {generateMortgageUrl, generateSearchUrl} from '../utils/Helpers';
import {
  clone, size, forEach, each, find, forIn, map, extend
} from 'lodash';

const DemandShowCase = {

  get excludeFields() {
    return [
      'collections',
      'items',
      'hasLoaded',
      'hasColsLoaded',
      'count',
      'cities',
      'streets',
      'districts',
      'checked',
      '_validationStatus',
      '_validationStates',
      '_validationMsgs',
      '_needValidate',
      '_orderResult',
      '_hidden',
      '_readonly',
      '_delayedOrderTrigger',
      'brokersCount',
      'brokers',
      'selectedBroker',
      'message',
      'house_found',
      'street_found',
      'showStats',
      'found_districts',
      'altPriceMin',
      'altPriceMax',
      'altPriceCount',
      'altSquareMin',
      'altSquareMax',
      'altSquareCount',
      'needAltUpdate',
      'altSumm',
      'roomsNumText',
      'district',
      'notFirstCall',
      'nearby_districts',
      'triggerCalc',
      'altDistrictsCount',
      'allDistrictsCount',
      'altDistrictsItems',
      'altSquareItems',
      'altPriceItems',
      'houseData',
      'itemsOption',
      'anglePos',
      'showTicketsTable',
      'emptyStreet',
      'totalCount',
      'sell',
      'realtyCount',
      'nhCount',
      'cottagesCount',
      'showAvgPrice',
      'avgPriceLoading',
      'doNotUseSquare',
      'up',
      'lo'
    ];
  },

  handleAction(dataModel, action) {
    const demandShowCase = clone(wss.get()['demandShowCase']) || {};
    const currentCityId = demandShowCase['city_id'];
    const currentStreetId = demandShowCase['street_id'];
    const currentHouse = demandShowCase['house'];

    if (action === 'set') {
      if (this.timeout2) {
        clearTimeout(this.timeout2);
      }

      forEach(dataModel, (value, key) => {
        demandShowCase[key] = value;
      });

      // sorry((
      this.timeout2 = setTimeout(() => {
        if (!demandShowCase.hasColsLoaded ||
            currentCityId !== demandShowCase['city_id']) {
          demandShowCase['street_id'] = '';
          this.getCollections();
        }
      }, 1);

      // если пользователь начинает заново вводить адрес, сбрасываем выбранный район
      if (currentStreetId !== demandShowCase['street_id']) {
        demandShowCase['district_id'] = '';
        demandShowCase['hideDistricts'] = true;
      }

      if (currentCityId !== demandShowCase['city_id']) {
        demandShowCase['hideDistricts'] = true;
      }

      if (currentHouse !== demandShowCase['house']) {
        demandShowCase['district_id'] = '';
      }

      if (!demandShowCase.city_id && !demandShowCase.hasColsLoaded) {//eslint-disable-line
          demandShowCase.city_id = demandShowCase.city_id ?//eslint-disable-line
            demandShowCase.city_id.toString() ://eslint-disable-line
            data.options.cityId.toString();
      }

      // делаем сообщение для заявки
      demandShowCase.message = this.getTicketMessage();
    }

    return action === 'set' ? demandShowCase : dataModel;
  },

  getCollections() {
    const params = {};
    const wssData = wss.get()['demandShowCase'];

    params.action = 'demand_showcase';
    params.subAction = 'collections';
    params.city_id = wssData['city_id'] ? // eslint-disable-line
      wssData['city_id'] : [data.options.cityId];
    const uri = generateMortgageUrl(params, '/msearcher_ajax.php?');

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
        } else if(!res.body.success) {
          WidgetsActions.set('notify',[{
            msg: `Ошибка получения данных с сервера: ${res.text}. Попробуйте обновить страницу`, // eslint-disable-line max-len
            type: 'dang'
          }]);
        } else {

          const cities = res.body.cities;
          const streets = res.body.streets;
          const districts = res.body.districts;
          const totalCount = res.body.totalCount;

          WidgetsActions.set('demandShowCase', {
            ['cities']: cities,
            ['streets']: streets,
            ['districts']: districts,
            ['totalCount']: totalCount,
            ['hasColsLoaded']: true
          });
        }
      });
  },

  getShowCaseData(model, cb) {
    const params = clone(model);

    /* global data */
    params.action = 'demand_showcase';
    params.limit = '100';

    // если пользователь уточняет район, то убираем из запроса улицу и номер дома
    if (params['district_id']) {
      params['street_id'] = '';
      params['house'] = '';
    }

    if (wss.get('demandShowCase').doNotUseSquare) {
      params['square_from'] = undefined;
      params['square_to'] = undefined;
      params.square = undefined;
    }

    const uri = generateMortgageUrl(params, '/msearcher_ajax.php?');

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
        } else if(!res.body.success) {
          WidgetsActions.set('notify',[{
            msg: `Ошибка получения данных с сервера: ${res.text}. Попробуйте обновить страницу`, // eslint-disable-line max-len
            type: 'dang'
          }]);
        } else {
          const {count, data} = res.body;
          let {house_found: houseFound} = res.body;
          const currentModel = wss.get('demandShowCase');

          currentModel.count = count;
          currentModel['house_found'] = houseFound;
          currentModel['street_found'] = res.body['street_found'];

          // подгоняем найденные районы к тому виду, в каком у нас все коллекции
          const foundDistricts = [];

          forIn(res.body.districts, (name, id) => {
            foundDistricts.push({
              name: name,
              id: id
            });
          });

          currentModel['found_districts'] = size(foundDistricts) ?
            foundDistricts : currentModel['found_districts'];

          currentModel['emptyStreet'] = size(foundDistricts) === 0 &&
            currentModel['street_found'] !== undefined;

          if (size(foundDistricts) === 1) {
            currentModel['district_id'] = foundDistricts[0]['id'];
            currentModel['house_found'] = true;
            houseFound = true;
          }

          currentModel.items = houseFound ||
            houseFound === undefined ?
            data : currentModel.items;

          currentModel['nearby_districts'] = map(
            res.body['nearby_districts'], distr => distr.toString()
          );
          currentModel['showStats'] = houseFound || houseFound === undefined ?
            '1' : '0';

          currentModel['showTicketsTable'] = count === 0;

          currentModel['needAltUpdate'] = !currentModel['needAltUpdate'];
          currentModel['altSumm'] = 0;
          currentModel['showAvgPrice'] = currentModel['house_found'] ||
            currentModel['district_id'];
          currentModel['avgPriceLoading'] = true;
          currentModel['houseData'] = res.body.house || {
            'wall_id': 12,
            'series_id': 47,
            'floors_cnt': 9
          };
          currentModel.hasLoaded = true;
          currentModel.hideDistricts = currentModel.emptyStreet;

          WidgetsActions.set('demandShowCase', currentModel);

          cb && cb(currentModel);
        }
      });
  },

  getTicketMessage() {
    const demandShowCase = wss.get()['demandShowCase'];
    let msg = '<p>';

    if (demandShowCase) {

      const street = find(
        demandShowCase.streets, {id: demandShowCase.street_id});

      msg += '<h4>Параметры заявки</h4>';
      msg += demandShowCase.price_from ?
        '<b>Цена (от):</b> ' + demandShowCase.price_from + '<br />' : ''; //eslint-disable-line
      msg += demandShowCase.price_to ?
        '<b>Цена (до):</b> ' + demandShowCase.price_to + '<br />' : ''; //eslint-disable-line
      msg += demandShowCase.square ?
        '<b>Площадь:</b> ' + demandShowCase.square + '<br />' : ''; //eslint-disable-line
      msg += demandShowCase.square_from ?
        '<b>Площадь (от):</b> ' + demandShowCase.square_from + '<br />' : ''; //eslint-disable-line
      msg += demandShowCase.square_to ?
        '<b>Площадь (до):</b> ' + demandShowCase.square_to + '<br />' : ''; //eslint-disable-line
      msg += street ?
        '<b>Улица:</b> ' + street.name + '<br />' : ''; //eslint-disable-line
      msg += demandShowCase.house ?
        '<b>Номер дома:</b> ' + demandShowCase.house + '<br />' : ''; //eslint-disable-line
      msg += demandShowCase.floor ?
        '<b>Этаж:</b> ' + demandShowCase.floor + '<br />' : ''; //eslint-disable-line

      msg += '<br /><b>ФИО риелтора</b>&nbsp;';
      msg += '<b>Номер заявки</b><br /><br />';

      each(demandShowCase.checked, ticketId => {
        const ticket = find(
          demandShowCase[demandShowCase.itemsOption || 'items'],
          {ticket_id: parseInt(ticketId)} //eslint-disable-line
        );

        msg += `<span>${ticket.staff.name}</span>&nbsp;`;
        msg += `<span>${ticketId}</span><br />`;
      });

    } else {
      msg = null;
    }

    msg += '</p>';

    return msg;
  },

  //TODO: в будущем провести рефакторинг, чтобы брать такой же метод из ModularSearcherActions
  getObjectCount(dataArr = null) {

    return new Promise((resolve) => {
      const demandShowCase = wss.get()['demandShowCase'];

      dataArr.action = 'modular_search';
      dataArr.subAction = 'count';

      /* global data */
      dataArr['city_id'] = demandShowCase['city_id'];

      const uri = generateSearchUrl(dataArr, '/msearcher_ajax.php?');

      request
        .get(uri)
        .set({
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'public, max-age=21600'
        })
        .end((err, res) => {

          if(!err && res.body.ok) {
            resolve(res.body.count);
          }

        });
    });
  },

  getPrice() {
    const obj = wss.get()['demandShowCase'];
    const data = extend(obj.houseData, {
      'action': 'user_get_analitic_prices',
      'city_id': obj['city_id'],
      'district_id': obj['district_id'],
      'area_total': obj['square'],
      'rooms_cnt': obj['rooms'],
      'floor_num': obj['floor'] || 5,
      'type': 'flat',
      'keep': 'cosmetic',
      'furniture': 'well'
    });

    return api.getPrice(data);
  }
};

export default DemandShowCase;
