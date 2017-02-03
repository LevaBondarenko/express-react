import initReducer from '../utils/initReducer';

/* global data */

const settings = (state = null, action) => {
  state || (state = initReducer(data.options ? data.options : {}));
  switch (action.type) {
  case 'SETTINGS.FLUSH':
    return state.clear();
  default:
    return state;
  }
};

export default settings;
