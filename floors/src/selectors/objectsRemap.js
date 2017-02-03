/**
 * objects remap to selectors for universal components
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

import getMortgagePrograms from './modules/getMortgagePrograms';
import getShowCaseMessage from './modules/getShowCaseMessage';

export default {
  mortgage: getMortgagePrograms,
  demandShowCase: getShowCaseMessage
};
