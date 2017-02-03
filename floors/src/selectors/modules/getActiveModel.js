/**
 * recomendedPrograms selector
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */
import {createSelector} from 'reselect';

const getSearcher = state => state.objects.get('searcher') ?
  state.objects.get('searcher').toJS() : {};
const getCityId = state => state.settings.toJS().cityId;

const getActiveModel = createSelector(
  [getSearcher, getCityId],
  (searcher, cityId) => {
    const {fields} = searcher;
    const model = {};

    fields.forEach(field => {
      const value = searcher[field];

      value !== undefined && value !== null && (model[field] = value);
    });

    model.city_id || (model.city_id = cityId);  //eslint-disable-line camelcase

    return model;
  }
);

export default getActiveModel;
