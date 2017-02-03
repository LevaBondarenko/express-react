import initReducer from '../utils/initReducer';

/* global data */

const collections = (state = null, action) => {
  state || (state = initReducer(data.collections ? data.collections : {}));
  switch (action.type) {
  case 'COLLECTIONS.FLUSH':
    return state.clear();
  default:
    return state;
  }
};

export default collections;
