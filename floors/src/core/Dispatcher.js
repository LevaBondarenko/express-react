/*
 * Etagi project
 * o.e.kurgaev@it.etagi.com
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Flux from 'flux';
import PayloadSources from '../constants/PayloadSources';
import {assign} from 'lodash';

/**
 * A singleton that operates as the central hub for application updates.
 * For more information visit https://facebook.github.io/flux/
 */
const Dispatcher = assign(new Flux.Dispatcher(), {

  /**
   * @param {object} action The details of the action, including the action's
   * type and additional data coming from the server.
   * @return {void}
   */
  handleServerAction(action) {
    const payload = {
      source: PayloadSources.SERVER_ACTION,
      action: action
    };

    this.dispatch(payload);
  },

  /**
   * @param {object} action The details of the action, including the action's
   * type and additional data coming from the view.
   * @return {void}
   */
  handleViewAction(action) {
    const payload = {
      source: PayloadSources.VIEW_ACTION,
      action: action
    };

    this.dispatch(payload);
  }

});

export default Dispatcher;
