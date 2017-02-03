/**
 * middlewares index
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

import mortgage from './modules/mortgage';
import demandShowCase from './modules/demandShowCase';
import searcher from './modules/searcher';

export default {
  mortgage: mortgage,
  demandShowCase: demandShowCase,
  searcher: searcher
};
