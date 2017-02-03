/**
 * Counter store
 *
 * @ver 0.0.1
 * @author Babitsyn Andrey
 */

import Dispatcher from '../core/Dispatcher';
import CounterTypes from '../constants/CounterTypes';
import AppStore from '../stores/AppStore';
import {getFromBack} from '../utils/requestHelpers';

/* global data */
class CounterStore extends AppStore {

  constructor() {
    super();
    this.finished = false;
    this.requestData = {};
    this.countData = {};
  }

  init(data) {
    if (!this.finished) {
      if (!this.requestData[data.widgetId]) {
        this.requestData[data.widgetId] = {
          type: data.type,
          subType: data.subType,
          period: data.period
        };
      }
    }
  }

  check() {
    /* global data */
    const widgetsLength = data.widget.ObjectCounter_Widget.length;

    if (widgetsLength === Object.keys(this.requestData).length) {
      this.finished = true;

      getFromBack({
        action: 'get_objects_counts',
        city_id: data.options.cityId.toString(), // eslint-disable-line
        data: JSON.stringify(this.requestData)
      }, 'get', '/msearcher_ajax.php').then((response) => {
        this.countData = response;
        this.emitChange();
      });
    }
  }

}


const counterStore = new CounterStore();

counterStore.dispatchToken = Dispatcher.register((payload) => {
  const action = payload.action;

  switch (action.actionType) {
  case CounterTypes.COUNTER_INIT:
    counterStore.init(action.data);
    break;

  case CounterTypes.COUNTER_CHECK:
    counterStore.check();
    break;

  default:
  // Do nothing
  }

});

export default counterStore;
