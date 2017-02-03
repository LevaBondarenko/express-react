/**
 * FilterSettings store
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */
/*eslint camelcase: [2, {properties: "never"}]*/
import Dispatcher from '../core/Dispatcher';
import AppStore from '../stores/AppStore';
import FilterSettingsTypes from '../constants/FilterSettingsTypes';

class FilterSettingsStore extends AppStore {
  constructor() {
    super();
    this.data = {
      visibleFilter: true,
      layoutType: 0,
      realtyType: 'flats',
      filterFields: {},
      isLoading: false,
      perPage: 15,
      offset: 0,
      currentPage: 0,
      curPage: null,
      pageNum: 0,
      count: 0,
      count_houses: 0,
      limits: {},
      countAll: 0,
      countMonth: 0,
      countWeek: 0,
      countDay: 0,
      incity: 0
    };
  }
}

const storeInstance = new FilterSettingsStore();

storeInstance.dispatchToken = Dispatcher.register(payload => {
  const action = payload.action;

  switch (action.actionType) {
  case FilterSettingsTypes.FILTER_SET:
    storeInstance.set(action.property, action.data);
    storeInstance.emitChange();
    break;

  case FilterSettingsTypes.FILTER_FLUSH:
    storeInstance.flush();
    storeInstance.emitChange();
    break;

  default:// Do nothing
  }

});

export default storeInstance;
