import initReducer from '../utils/initReducer';
import {forEach} from 'lodash';

/*global data*/

const userData = (state = null, action) => {
  state || (state = initReducer(data.userdata ? data.userdata : {}));
  switch (action.type) {
  case 'USERDATA.ADD':
    return state.mergeDeep(action.state);
  case 'USERDATA.FLUSH':
    return state.clear();
  case 'USERDATA.REMOVE':
    return state.delete(action.namespace);
  case 'USERDATA.SETIN':
    return state.setIn(action.path, action.value);
  case 'USERDATA.UPDATEIN':
    return state.updateIn(action.path, action.updater);
  case 'USERDATA.MASSUPDATEIN':
    return state.updateIn(action.path, data => {
      forEach(action.object, (item, key) => {
        data = data.updateIn([key], () => (item));
      });
      return data;
    });
  case 'USERDATA.MERGEDEEP':
    return state.mergeDeep(action.object);
  default:
    return state;
  }
};

export default userData;
