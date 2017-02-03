/**
 * Blog store
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

import Dispatcher from '../core/Dispatcher';
import BlogTypes from '../constants/BlogTypes';
import AppStore from '../stores/AppStore';


class BlogStore extends AppStore {
  constructor() {
    super();
    this.data.isLoading = false;
    this.data.posts = [];
    this.data.categories = {};
    this.data.commentParent = 0;
    this.data.subscribed = false; // Только подписался
    this.data.haveBeenSubscribed = false; // Уже был подписан
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

}

const bs = new BlogStore();

bs.dispatchToken = Dispatcher.register((payload) => {
  const action = payload.action;

  switch (action.actionType) {
  case BlogTypes.BS_SET:
    bs.set(action.property, action.data);
    bs.emitChange();
    break;

  case BlogTypes.BS_DEL:
    bs.del(action.property, action.data);
    bs.emitChange();
    break;

  case BlogTypes.BS_FLUSH:
    bs.flush();
    bs.emitChange();
    break;

  default:
  // Do nothing
  }

});

export default bs;