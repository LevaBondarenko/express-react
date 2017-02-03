/**
 * selectors index
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

import getMortgagePrograms from './modules/getMortgagePrograms';
import getSearcherUrl from './modules/getSearcherUrl';
import getProcessedRealtorsData from './modules/getProcessedRealtorsData';
import getActiveModel from './modules/getActiveModel';

export default {
  getMortgagePrograms: getMortgagePrograms,
  getProcessedRealtorsData: getProcessedRealtorsData,
  getSearcherUrl: getSearcherUrl,
  getActiveModel: getActiveModel
};

