import {createStore as _createStore} from 'redux';
import etagiApp from '../reducers/';

export default function createStore(initialData) {
  const store = _createStore(etagiApp, initialData);

  return store;
}
