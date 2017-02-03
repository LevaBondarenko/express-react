/**
 * mortgage middleware
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */
import request from 'superagent';
import {omitBy, size, countBy, mapKeys, assignIn} from 'lodash';
import {generateMortgageUrl} from '../../utils/Helpers';
import mortgageHelpers from '../../utils/mortgageHelpers';

const updateKeys = [
  'years',
  'credit',
  'avanse',
  'id',
  'bank_id',
  'program_id',
  'city_id',
  'newhouses_id',
  'stage',
  'income',
  'employment',
  'program_types',
  'program_types_2',
  'program_types_strict',
  'program_rating',
  'bankProject'
];

const remapKeys = {
  stage: 'stage_les',
  bankProject: 'payroll_program_id'
};

const getPrograms = (params, dispatch) => {
  params.action = params.subAction = 'mortgage';
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
        //@todo replace with error handling
        /*WidgetsActions.set('notify',[{
          msg: 'Ошибка получения данных с сервера. Попробуйте обновить страницу', // eslint-disable-line max-len
          type: 'dang'
        }]);*/
      } else if(!res.body.ok) {
        //@todo replace with error handling
        /*WidgetsActions.set('notify',[{
          msg: `Ошибка получения данных с сервера: ${res.text}. Попробуйте обновить страницу`, // eslint-disable-line max-len
          type: 'dang'
        }]);*/
      } else {
        let mortgage = {};

        if (res.body.programs) {
          const programsCount = size(res.body.programs);
          const minProgram = mortgageHelpers.getMinProgram(res.body.programs);

          mortgage = {
            programs: res.body.programs,
            count: programsCount,
            countWithFilter: programsCount,
            banksCount: countBy(res.body.programs, 'bank_id'),
            minPercent: minProgram.percent,
            minPercent2: minProgram.percent2,
            minBank: minProgram.bank,
            banksFilter: [],
            isProgsLoading: false
          };
        }

        dispatch({
          type: 'OBJECTS.MASSUPDATEIN',
          path: ['mortgage'],
          object: mortgage
        });
      }
    });
};

const actionHandler = (action, prevState, dispatch, settings) => {
  const {path, updater} = action;
  const field = path[1];
  const value = updater(prevState[field]);
  const {
    price, avanse, extraRequest, isProgsLoading,
    delayTimer
  } = prevState;
  let needRequest = extraRequest || updateKeys.indexOf(path[1]) > -1;
  const cityId = field === 'city_id' ?
    value : (prevState.city_id || settings.cityId);
  const delayEnd = field === 'delayEnd' && value;
  const paramsToSet = {};

  switch(field) {
  case 'price':
    paramsToSet.credit = value - Math.round(value * avanse / 100);
    break;
  case 'avanse':
    if(parseFloat(price) > 0) {
      paramsToSet.credit = price - Math.round(value * price / 100);
    }
    break;
  case 'credit':
    if(parseFloat(price) > 0) {
      if(value < price) {
        paramsToSet.avanse = Math.round((price - value) / price * 100);
      } else {
        paramsToSet.price = value;
        if(avanse > 0) {
          paramsToSet.avanse = 0;
        }
      }
    }
    break;
  case 'extraRequest':
    if (value) {
      needRequest = true;
    }
    break;
  default:
    //do nothing
  }

  if(needRequest) {
    if(delayTimer) {
      clearTimeout(delayTimer);
    }
    paramsToSet.delayTimer = setTimeout(() => {
      dispatch({
        type: 'OBJECTS.UPDATEIN',
        path: ['mortgage', 'delayEnd'],
        updater: () => (true)
      });
    }, 1000);
  }

  if(delayEnd) {
    const params = mapKeys(omitBy(assignIn(
      prevState, paramsToSet, {[path[1]]: value}
    ), (item, key) => {
      return item === undefined || item === null || updateKeys.indexOf(key) < 0;
    }), (item, key) => {
      return remapKeys[key] ? remapKeys[key] : key;
    });

    params.city_id || (params.city_id = cityId); //eslint-disable-line camelcase
    if(!isProgsLoading) {
      getPrograms(params, dispatch);
      paramsToSet.isProgsLoading = true;
    } else {
      paramsToSet.extraRequest = true;
    }

    extraRequest && !paramsToSet.extraRequest &&
      (paramsToSet.extraRequest = false);
    paramsToSet.delayEnd = false;
    paramsToSet.delayTimer = null;
  }

  size(paramsToSet) && dispatch({
    type: 'OBJECTS.MERGEDEEP',
    object: {mortgage: paramsToSet}
  });
};

export default {
  actionHandler: actionHandler,
  actionTypes: ['OBJECTS.UPDATEIN']
};
