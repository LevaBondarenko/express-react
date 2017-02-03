import initReducer from '../utils/initReducer';

/*global data*/

const ui = (state = null, action) => {
  state || (state = initReducer(data.ui ? data.ui : {}));
  switch (action.type) {
  case 'UI.ADD':
    return state.mergeDeep(action.state);
  case 'UI.FLUSH':
    return state.clear();
  case 'UI.REMOVE':
    return state.delete(action.namespace);
  case 'UI.SETIN':
    return state.setIn(action.path, action.value);
  case 'UI.UPDATEIN':
    return state.updateIn(action.path, action.updater);
  default:
    return state;
  }
};

export default ui;
