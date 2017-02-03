/**
 * configuring app store, middlewares and devtools
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */
import {createStore, applyMiddleware, compose} from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import {persistStore, autoRehydrate} from 'redux-persist';
import immutableTransform from 'redux-persist-transform-immutable';
import etagiApp from '../reducers/';
import Immutable from 'immutable';
import interceptor from './interceptor';

const __PRODUCTION__ = __PRODUCTION__ || process.env.NODE_ENV === 'production';
const __CLIENT__ = __CLIENT__ || process.env.BROWSER === true;

const logger = createLogger({
  collapsed: true,
  stateTransformer: (state) => {
    const newState = {};

    for (var i of Object.keys(state)) {
      if (Immutable.Iterable.isIterable(state[i])) {
        newState[i] = state[i].toJS();
      } else {
        newState[i] = state[i];
      }
    };

    return newState;
  },
  predicate: () =>
    process.env.NODE_ENV === 'development',
});

const middlewares = [
  interceptor,
  thunkMiddleware,
  !__PRODUCTION__ && __CLIENT__ && logger,
].filter(Boolean);

const createStoreWithMiddleware = compose(
  autoRehydrate(),
  applyMiddleware(...middlewares)
)(createStore);

export default function configureStore(initialState) {
  const store = createStoreWithMiddleware(etagiApp, initialState);

  __CLIENT__ && persistStore(store, {
    transforms: [immutableTransform()],
    whitelist: ['ui'],
    keyPrefix: 'etagi_com.'
  });

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers/', () => {
      const nextRootReducer = require('../reducers/index').default;

      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}
