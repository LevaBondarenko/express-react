/**
 * searcher middleware
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */
import request from 'superagent';
import {omitBy, size, mapKeys, assignIn, clone} from 'lodash';
import {generateSearchUrl} from '../../utils/Helpers';
import Url from '../../utils/Url';
import Immutable, {Iterable} from 'immutable';

const staticUpdateKeys = [
  'class', 'city_id', 'object_id', 'distance', 'order', 'limit', 'offset'
];
const staticResponseKeys = [
  'count', 'count_houses', 'fields', 'aggregates', 'collections'
];
const remapKeys = {};
const delayMS = 100;

const getData = (params, dispatch) => {
  params.action = 'modular_search';
  params.subAction = 'searcher';
  const uri = generateSearchUrl(params, '/msearcher_ajax.php?', true);

  request
    .get(uri)
    .set({
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cache-Control': 'public, max-age=21600'
    })
    .end((err, res) => {
      if(err || !res.body.ok) {
        //@todo replace with error handling
        /*WidgetsActions.set('notify',[{
          msg: 'Ошибка получения данных с сервера. Попробуйте обновить страницу', // eslint-disable-line max-len
          type: 'dang'
        }]);*/
        dispatch({
          type: 'OBJECTS.UPDATEIN',
          path: ['searcher', 'isLoading'],
          updater: () => (false)
        });
      } else {
        const object = {};

        staticResponseKeys.forEach(key => {
          object[key] = res.body[key] !== undefined ? res.body[key] : null;
        });

        dispatch({
          type: 'OBJECTS.MASSUPDATEIN',
          path: ['searcher'],
          object: object
        });
        dispatch({
          type: 'OBJECTS.UPDATEIN',
          path: ['searcher', 'isLoading'],
          updater: () => (false)
        });
        dispatch({
          type: 'OBJECTS.UPDATEIN',
          path: ['objects', 'list'],
          updater: () => (Immutable.fromJS(
            res.body.objects ? res.body.objects : []))
        });
      }
    });
};

const actionHandler = (action, prevState, dispatch, settings) => {
  if(!prevState) {
    return;
  }
  const {path, updater} = action;
  const field = path[1];
  const {
    extraRequest, isLoading, delayTimer, fields, preventUrlModification
  } = prevState;
  const updateKeys = assignIn(clone(fields), staticUpdateKeys);
  const updatingKey = updateKeys.indexOf(path[1]) > -1;
  let value = updater(prevState[field]);

  Iterable.isIterable(value) && (value = value.toJS());

  const delayEnd = field === 'delayEnd' && value;
  const needRequest = !delayEnd && (extraRequest || updatingKey);
  const cityId = field === 'city_id' ?
    value : (prevState.city_id || settings.cityId);
  const paramsToSet = {};

  updatingKey && !preventUrlModification &&
    Url.updateSearchParam(field, value || undefined);

  if(field === 'order' && prevState.offset) {
    paramsToSet.offset = 0;
  }

  if(field === 'class') {
    updateKeys.forEach(key => {
      if(['class', 'city_id'].indexOf(key) < 0) {
        paramsToSet[key] = undefined;
        preventUrlModification || Url.updateSearchParam(key, undefined);
      }
    });
  }

  if(needRequest) {
    if(delayTimer) {
      clearTimeout(delayTimer);
    }
    paramsToSet.delayTimer = setTimeout(() => {
      dispatch({
        type: 'OBJECTS.UPDATEIN',
        path: ['searcher', 'delayEnd'],
        updater: () => (true)
      });
    }, delayMS);
  }

  if(delayEnd) {
    if(!isLoading) {
      const params = mapKeys(omitBy(assignIn(
        prevState, paramsToSet, {[path[1]]: value}
      ), (item, key) => {
        return item === undefined || item === 0 ||
          item === null || updateKeys.indexOf(key) < 0;
      }), (item, key) => {
        return remapKeys[key] ? remapKeys[key] : key;
      });

      params.city_id || (params.city_id = cityId); //eslint-disable-line camelcase
      getData(params, dispatch);
      paramsToSet.isLoading = true;
    } else if(field !== 'isLoading') {
      paramsToSet.extraRequest = true;
    }

    extraRequest && !paramsToSet.extraRequest &&
      (paramsToSet.extraRequest = false);
    paramsToSet.delayEnd = false;
    paramsToSet.delayTimer = null;
  }

  size(paramsToSet) && dispatch({
    type: 'OBJECTS.MERGEDEEP',
    object: {searcher: paramsToSet}
  });
};

export default {
  actionHandler: actionHandler,
  actionTypes: ['OBJECTS.UPDATEIN']
};
