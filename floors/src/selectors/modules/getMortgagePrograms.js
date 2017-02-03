/**
 * recomendedPrograms selector
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */
import {createSelector} from 'reselect';
import {filter, includes, size, sortBy} from 'lodash';
import mortgageHelpers from '../../utils/mortgageHelpers';

const getMortgage = state => state.objects.get('mortgage') ?
  state.objects.get('mortgage').toJS() : {};

const getMortgagePrograms = createSelector(
  [getMortgage],
  mortgage => {
    const {
      avanse, years, credit, checkedPrograms, recomendedCount, onBankPage,
      programs, banksFilter, disableAutoSelect, isMobile
    } = mortgage;
    const progFilter = {
      credit: credit,
      avanse: avanse,
      years: years,
    };
    const filteredPrograms = mortgageHelpers.filterPercents(
      programs, progFilter, banksFilter, false
    );
    const recomendedPrograms = mortgageHelpers
      .getRecomendedPrograms(
        filteredPrograms,
        recomendedCount || 0,
        onBankPage || false
      );
    const checkedProgramsData = checkedPrograms ?
      filter(filteredPrograms, item => {
        return checkedPrograms.indexOf(item.program_id) !== -1;
      }) : [];
    const checkedPercents =
      checkedProgramsData.map(item => item.deltaPercent);
    const checkedPayments =
      checkedProgramsData.map(item => item.monthPaymentPref);
    const filteredIds = filteredPrograms.map(item => item.program_id);
    const recomendedIds = recomendedPrograms.map(item => item.program_id);
    const filteredChecked = filter(checkedPrograms, item => {
      return filteredIds.indexOf(item) !== -1;
    });
    let notRecomendedPrograms = filter(
      filteredPrograms, item => !includes(recomendedIds, item.program_id) ?
      item : false
    );

    if (size(checkedPrograms) && size(notRecomendedPrograms) && !isMobile) {
      notRecomendedPrograms = sortBy(notRecomendedPrograms, item => {
        return checkedPrograms.indexOf(item.program_id) === -1;
      });
    }

    return {
      ...mortgage,
      checkedPercents: checkedPercents,
      checkedPayments: checkedPayments,
      checkedPrograms: size(checkedPrograms) || disableAutoSelect ?
        filteredChecked : recomendedIds,
      recomendedPrograms: recomendedPrograms,
      filteredPrograms: notRecomendedPrograms
    };
  }
);

export default getMortgagePrograms;
