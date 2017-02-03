/**
 * Widgets state store
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

import Dispatcher from '../core/Dispatcher';
import WidgetsStateTypes from '../constants/WidgetsStateTypes';
import AppStore from '../stores/AppStore';


class WidgetsStateStore extends AppStore {
  constructor() {
    super();
    this.data.counterStore = null;
  }
}

const wss = new WidgetsStateStore();

wss.dispatchToken = Dispatcher.register((payload) => {
  const action = payload.action;

  switch (action.actionType) {
  case WidgetsStateTypes.WSS_SET:
    wss.set(action.property, action.data);
    wss.emitChange();
    break;

  case WidgetsStateTypes.WSS_DEL:
    wss.del(action.property, action.data);
    wss.emitChange();
    break;

  case WidgetsStateTypes.WSS_FLUSH:
    wss.flush();
    wss.emitChange();
    break;

  default:
  // Do nothing
  }

});

export default wss;