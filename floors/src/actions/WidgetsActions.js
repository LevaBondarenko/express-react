/**
 * Widgets actions
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

import Dispatcher from '../core/Dispatcher';
import Mortgage from '../core/Mortgage';
import DemandShowCase from '../core/DemandShowCase';
import WidgetsStateTypes from '../constants/WidgetsStateTypes';

export default {
  preprocess(id, data, action) {
    let res;

    switch(id) {
    case 'mortgage':
      res = Mortgage.handleAction(data, action);
      break;
    case 'demandShowCase':
      res = DemandShowCase.handleAction(data, action);
      break;
    default:
      res = data;
    }

    return res;
  },

  set(id, data) {
    Dispatcher.handleViewAction({
      actionType: WidgetsStateTypes.WSS_SET,
      property: id,
      data: this.preprocess(id, data, 'set')
    });
  },

  del(id, data) {
    Dispatcher.handleViewAction({
      actionType: WidgetsStateTypes.WSS_DEL,
      property: id,
      data: this.preprocess(id, data, 'del')
    });
  },

  flush() {
    Dispatcher.handleViewAction({
      actionType: WidgetsStateTypes.WSS_FLUSH,
    });
  }
};
