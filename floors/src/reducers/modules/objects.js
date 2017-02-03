import initReducer from '../utils/initReducer';
import {forEach} from 'lodash';

/* global data */

const objects = (state = null, action) => {
  state || (state = initReducer(data.redux ? data.redux : {}));
  switch (action.type) {
  case 'OBJECTS.FLUSH':
    return state.clear();
  case 'OBJECTS.REMOVE':
    return state.delete(action.namespace);
  case 'OBJECTS.SETIN':
    return state.setIn(action.path, action.value);
  case 'OBJECTS.MASSUPDATEIN':
    return state.updateIn(action.path, data => {
      forEach(action.object, (item, key) => {
        data = data.updateIn([key], () => (item));
      });
      return data;
    });
  case 'OBJECTS.UPDATEIN':
    return state.updateIn(action.path, action.updater);
  case 'OBJECTS.MERGEDEEP':
    return state.mergeDeep(action.object);
  default:
    return state;
  }
};

export default objects;
