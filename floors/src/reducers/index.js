import {combineReducers} from 'redux';
import settings from './modules/settings';
import collections from './modules/collections';
import ui from './modules/ui';
import intl from './modules/intl';
import objects from './modules/objects';
import userData from './modules/userData';

const etagiApp = combineReducers({
  settings,
  collections,
  ui,
  intl,
  objects,
  userData
});

export default etagiApp;
