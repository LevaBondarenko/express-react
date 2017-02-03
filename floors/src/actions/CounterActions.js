/**
 * Counter store
 *
 * @ver 0.0.1
 * @author Babitsyn Andrey
 */

import Dispatcher from '../core/Dispatcher';
import CounterTypes from '../constants/CounterTypes';

export default {

  init(widget) {
    Dispatcher.handleViewAction({
      actionType: CounterTypes.COUNTER_INIT,
      data: {
        widgetId: widget.id,
        type: widget.type,
        subType: widget.subType,
        period: widget.period
      }
    });
  },

  check() {
    Dispatcher.handleViewAction({
      actionType: CounterTypes.COUNTER_CHECK,
    });
  }

};
