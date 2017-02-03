import initReducer from '../utils/initReducer';

/*global data*/

const intl = (state = null, action) => {
  state || (state = initReducer(data.intl ? data.intl : {}));
  switch (action.type) {
  case 'INTL.ADD':
    return state.mergeDeep(action.state);
  case 'INTL.FLUSH':
    return state.clear();
  case 'INTL.REMOVE':
    return state.delete(action.namespace);
  case 'INTL.SETIN':
    return state.setIn(action.path, action.value);
  case 'INTL.UPDATEIN':
    return state.updateIn(action.path, action.updater);
  default:
    return state;
  }
};

export default intl;
