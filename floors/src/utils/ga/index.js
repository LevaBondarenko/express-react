/*
 * google analytics utils
 * rendering react
 * o.e.kurgaev@it.etagi.com
 */

import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';

const env = canUseDOM ? require('../Helpers.js').getEnv() : 'production';

/* global ga*/
const gaTrack = (type, name, event = 'click') => {
  if(env !== 'dev') {
    if(type === 'pageview') {
      ga('send', type, name);
    } else {
      ga('send', 'event', type, event, name);
    }
  } else {
    console.log(type, event, name); //eslint-disable-line
  }
};

export default gaTrack;
