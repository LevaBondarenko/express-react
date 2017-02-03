/**
 * Modular searcher store
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/

import Dispatcher from '../core/Dispatcher';
import ModularSearcherTypes from '../constants/ModularSearcherTypes';
import AppStore from '../stores/AppStore';


class ModularSearcherStore extends AppStore {
  constructor() {
    super();
    this.data.count = 0;
    this.data.isLoading = false;
    this.data.perPage = 15;
    this.data.offset = 0;
    this.data.currentPage = 0;
    this.data.pageNum = 0;
    this.data.type = [];
    this.data.rooms = [];
    this.data.district_id = [];
    this.data.metro_station_id = [];
    this.data.street_id = [];
    this.data.trakt_id = [];
    this.data.typesAnalytics = [];
    this.data.wall_id = [];
    this.data.series_id = [];
    this.data.keep = [];
    this.data.type = [];
    this.data.builder_id = [];
    this.data.newcomplex_id = [];
    this.data.object_id = [];
    this.data.action_sl = [];
    this.data.deadline_date = [];
    this.data.collections = {
      streets_by_districts: [],
      districtsByTrakts: [],
      district_id: [],
      metro_station_id: [],
      street_id: [],
      trakt_id: [],
      wall_id: [],
      type: [],
      furniture: [],
      series_id: [],
      builder_id: [],
      newcomplex_id: [],
      keep: [],
      action_sl: [],
      deadlines: []
    };
  }

  /**
  * Retrieving data from store
  *
  * @param {string} property - name of data
  * @returns {object} retrieved data value if exist
  */
  get(property) {
    if(property === undefined) {
      return this.data;
    } else if(this.data[property] !== undefined) {
      return this.data[property];
    } else {
      return null;
    }
  }

  smartFlush() {
    const data = this.data;
    const flushedData = {};

    for (const item in data) {
      if (data.hasOwnProperty(item)) {
        const itemType = Object.prototype.toString.call(data[item]);

        switch (itemType) {
        case '[object String]':
          flushedData[item] = '';
          break;
        case '[object Boolean]':
          flushedData[item] = false;
          break;
        case '[object Array]':
          flushedData[item] = [];
          break;
        case '[object Object]':
          flushedData[item] = {};
          break;
        default:
          //
        }
      }
    }

    this.data = flushedData;
  }
}

const mss = new ModularSearcherStore();

mss.dispatchToken = Dispatcher.register((payload) => {
  const action = payload.action;

  switch (action.actionType) {
  case ModularSearcherTypes.MSS_SET:
    mss.set(action.property, action.data);
    mss.emitChange();
    break;

  case ModularSearcherTypes.MSS_DEL:
    mss.del(action.property, action.data);
    mss.emitChange();
    break;

  case ModularSearcherTypes.MSS_OMIT:
    mss.omit(action.data);
    mss.emitChange();
    break;

  case ModularSearcherTypes.MSS_FLUSH:
    mss.flush();
    mss.emitChange();
    break;

  case ModularSearcherTypes.MSS_SMARTFLUSH:
    mss.smartFlush();
    mss.emitChange();
    break;

  default:
  // Do nothing
  }

});

export default mss;