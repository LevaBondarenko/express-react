/**
 * recomendedPrograms selector
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */
import {createSelector} from 'reselect';
import {generateSearchUrl} from '../../utils/Helpers';
import SeoHelpers from '../../utils/seoHelpers';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';

const getSearcher = state => state.objects.get('searcher') ?
  state.objects.get('searcher').toJS() : {};
const getCityId = state => state.settings.toJS().cityId;
const baseUris = {
  flats: '/realty/search/?',
  rent: '/realty_rent/search/?',
  nh_flats: '/zastr/search/?', //eslint-disable-line camelcase
  cottages: '/realty_out/search/?',
  offices: '/commerce/search/?'
};

const getSearcherUrl = createSelector(
  [getSearcher, getCityId],
  (searcher, cityId) => {
    const {fields} = searcher;
    const model = {};

    fields.forEach(field => {
      const value = searcher[field];

      value !== undefined && value !== null && (model[field] = value);
    });

    model.city_id || (model.city_id = cityId);  //eslint-disable-line camelcase
    const seoUrl = canUseDOM && SeoHelpers.getSeoUrl(model);

    return seoUrl ? seoUrl : generateSearchUrl(model, baseUris[model.class]);
  }
);

export default getSearcherUrl;
