 /*
     * yandex metrica utils
     * rendering react
     * l.v.bondarenko
     */
    /*global data*/

import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';

const env = canUseDOM ? require('../Helpers.js').getEnv() : 'production';

const yaCounter = (text) => {
  if (env !== 'dev') {
    [`yaCounter${data.options.codeAnalytics.metrika}.reachGoal(text)`];
    return true;
  } else {
    console.log(data.options.codeAnalytics.metrika, text); //eslint-disable-line
  }
};

export default yaCounter;
