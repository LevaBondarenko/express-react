/**
 * demandShowCase middleware
 *
 */

import request from 'superagent';
import {generateMortgageUrl} from '../../utils/Helpers';
import {size} from 'lodash';

const getCollections = (cityId, settings, dispatch) => {
  const params = {};

  params.action = 'demand_showcase';
  params.subAction = 'collections';
  params.city_id = cityId; // eslint-disable-line camelcase
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
        // WidgetsActions.set('notify',[{
        //   msg: 'Ошибка получения данных с сервера. Попробуйте обновить страницу', // eslint-disable-line max-len
        //   type: 'dang'
        // }]);
      } else if(!res.body.success) {
        // WidgetsActions.set('notify',[{
        //   msg: `Ошибка получения данных с сервера: ${res.text}. Попробуйте обновить страницу`, // eslint-disable-line max-len
        //   type: 'dang'
        // }]);
      } else {
        const obj = {
          collections: {
            cities: res.body.cities,
            streets: res.body.streets,
            districts: res.body.districts,
          },
          totalCount: res.body.totalCount,
          isColsLoading: false
        };

        dispatch({
          type: 'OBJECTS.MASSUPDATEIN',
          path: ['demandShowCase'],
          object: obj
        });
      }
    });
};

const actionHandler = (action, prevState, dispatch, settings) => {
  const {path, updater} = action;
  const field = path[1];
  const {isColsLoading, city_id} = prevState; //eslint-disable-line camelcase
  const needCollections = prevState.needCollections || field === 'city_id';
  const paramsToSet = {};
  const value = updater(prevState[field]);
  const cityId = field === 'city_id' ?
    value : (prevState.city_id || settings.cityId);


  if (needCollections) {
    if (isColsLoading) {
      paramsToSet.needCollections = true;
    } else {
      getCollections(cityId, settings, dispatch);
      paramsToSet.isColsLoading = true;
    }
  }

  // если пользователь начинает заново вводить адрес, сбрасываем выбранный район
  if (field === 'street_id') { //eslint-disable-line camelcase
    paramsToSet.district_id = ''; //eslint-disable-line camelcase
    paramsToSet.hideDistricts = true;
  }

  if (city_id !== cityId) { //eslint-disable-line camelcase
    paramsToSet.hideDistricts = true;
    paramsToSet.district_id = ''; //eslint-disable-line camelcase
    paramsToSet.street_id = ''; //eslint-disable-line camelcase
  }

  if (field === 'house') {
    paramsToSet.district_id = ''; //eslint-disable-line camelcase
  }

  prevState.city_id || (paramsToSet.city_id = cityId); //eslint-disable-line camelcase

  size(paramsToSet) && dispatch({
    type: 'OBJECTS.MASSUPDATEIN',
    path: ['demandShowCase'],
    object: paramsToSet
  });
};

export default {
  actionHandler: actionHandler,
  actionTypes: ['OBJECTS.UPDATEIN']
};
