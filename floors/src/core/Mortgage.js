/*
 * Etagi project
 * mortgage global object
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

import request from 'superagent';
import wss from '../stores/WidgetsStateStore';
import WidgetsActions from '../actions/WidgetsActions';
import {generateMortgageUrl} from '../utils/Helpers';
import mortgageHelpers from '../utils/mortgageHelpers';
import {
  clone, size, forEach, assign, intersection, keys, includes, minBy, toArray,
  filter, indexOf, sortBy
} from 'lodash';

/* global data */
/*eslint camelcase: [2, {properties: "never"}]*/

const Mortgage = {

  handleAction(data, action) {
    const {mortgage} = wss.get();
    const updateKeys = [
      'years',
      'credit',
      'avanse',
      'id',
      'bank_id',
      'program_id',
      'city_id',
      'newhouses_id',
      'stage',
      'income',
      'employment',
      'program_types',
      'program_types_2',
      'program_types_strict',
      'program_rating',
      'bankProject'
    ];

    if(mortgage && action === 'set') {
      if(data.avanse !== undefined && mortgage.price) {
        const dataAvanse = Math.round(data.avanse * mortgage.price / 100);

        if(dataAvanse < mortgage.price) {
          data.credit = mortgage.price - dataAvanse;
        } else {
          data.price = dataAvanse;
          data.credit = 0;
        }
      } else if(data.credit !== undefined && mortgage.price) {
        if(data.credit < mortgage.price) {
          data.avanse = Math.round((mortgage.price - data.credit) /
            mortgage.price * 100);
        } else {
          data.price = data.credit;
          data.avanse = 0;
        }
      } else if(data.price !== undefined) {
        const dataAvanse = Math.round(data.avanse * mortgage.price / 100);

        if(!dataAvanse) {
          data.credit = data.price -
            Math.round(mortgage.avanse * data.price / 100);
        } else if(data.price > dataAvanse) {
          data.credit = data.price - dataAvanse;
        } else {
          data.avanse = data.price;
          data.credit = 0;
        }
      }

      if(size(data.banksFilter) > 0) {
        data.checkedPrograms = [];
        const banksCount = size(data.banksFilter);

        if (banksCount) {
          const filteredPrograms = filter(mortgage.programs,
            program => indexOf(data.banksFilter, program.bank_id) > -1);
          const minProgram = this.getMinProgram(filteredPrograms);

          data.countWithFilter = size(filteredPrograms);
          data.minPercent = minProgram.percent;
          data.minBank = minProgram.bank;
          data.banksCount = banksCount;
        }
      }

      if(data.programs !== undefined ||
        data.banksFilter !== undefined ||
        data.checkedPrograms !== undefined) {
        const programs = data.programs ? data.programs : mortgage.programs;
        const banksFilter = data.banksFilter ?
          data.banksFilter : mortgage.banksFilter;
        const {
          avanse, years, credit, checkedPrograms, recomendedCount, onBankPage,
          extraRequest, recomendedOld
        } = mortgage;
        const progFilter = {
          credit: credit,
          avanse: avanse,
          years: years,
        };
        let filteredPrograms = mortgageHelpers.filterPercents(
          programs, progFilter, banksFilter, false
        );
        const recomendedPrograms = mortgageHelpers
          .getRecomendedPrograms(
            filteredPrograms,
            recomendedCount || 3,
            onBankPage || false,
            recomendedOld || false
          );
        const recomendedIds = recomendedPrograms.map(item => item.program_id);

        if(!size(checkedPrograms) && !data.checkedPrograms && !extraRequest) {
          const recomendedPay =
            recomendedPrograms.map(item => item.monthPaymentPref);
          const recomendedPer =
            recomendedPrograms.map(item => item.deltaPercent);

          data.checkedPrograms = recomendedIds;
          data.checkedPercents = recomendedPer;
          data.checkedPayments = recomendedPay;
        } else {
          const filteredIds = filteredPrograms.map(item => item.program_id);
          const actualChecked = data.checkedPrograms ?
            data.checkedPrograms : mortgage.checkedPrograms;

          data.checkedPrograms = intersection(filteredIds, actualChecked);

          const checkedProgramsData = filter(filteredPrograms, item => {
            return data.checkedPrograms.indexOf(item.program_id) !== -1;
          });

          data.checkedPercents =
            checkedProgramsData.map(item => item.deltaPercent);
          data.checkedPayments =
            checkedProgramsData.map(item => item.monthPaymentPref);
        }

        filteredPrograms = filter(
          filteredPrograms, item => !includes(recomendedIds, item.program_id) ?
          item : false
        );

        if(data.checkedPrograms) {
          filteredPrograms = sortBy(filteredPrograms, item => {
            return data.checkedPrograms.indexOf(item.program_id) === -1;
          });
        }

        data.filteredPrograms = filteredPrograms;
        data.recomendedPrograms = recomendedPrograms;

        if(data.checkedPrograms !== undefined) {
          const filteredPrograms = data.filteredPrograms !== undefined ?
            data.filteredPrograms : mortgage.filteredPrograms;

          if(size(filteredPrograms)) {
            data.filteredPrograms = sortBy(filteredPrograms, item => {
              return data.checkedPrograms.indexOf(item.program_id) === -1;
            });
          }
        }
      }
    }

    const newModel = assign(clone(mortgage), clone(data));

    if (newModel.extraRequest || intersection(updateKeys, keys(data)).length) {
      if (newModel.isColsLoading || newModel.isProgsLoading) {
        data.extraRequest = true;
      } else {
        const dataArray = {};

        dataArray.action = 'mortgage';
        dataArray.years = newModel.years;
        dataArray.credit = newModel.credit;
        dataArray.avanse = newModel.avanse;
        dataArray['newhouses_id'] = newModel['newhouses_id'];
        newModel.bank_id && (dataArray.bank_id = newModel.bank_id);
        newModel.program_id && (dataArray.program_id = newModel.program_id);
        newModel.city_id && (dataArray.city_id = newModel.city_id);
        newModel.program_types &&
          (dataArray.program_types = newModel.program_types);
        newModel.program_types_2 &&
          (dataArray.program_types_2 = newModel.program_types_2);
        newModel.program_types_strict &&
          (dataArray.program_types_strict = newModel.program_types_strict);
        newModel.stage && (dataArray.stage_les = newModel.stage);
        newModel.income && (dataArray.income = newModel.income);
        newModel.employment && (dataArray.employment = newModel.employment);
        newModel.id && (dataArray.id = newModel.id);
        newModel.bankProject &&
          (dataArray.payroll_program_id = newModel.bankProject);

        if (!newModel.isColsLoading) {
          this.getCollections(dataArray);
          data.isColsLoading = true;
        }
        if (!newModel.isProgsLoading) {
          this.getMortgagePrograms(dataArray);
          data.isProgsLoading = true;
        }
        data.isLoading = true;
        newModel.extraRequest && (data.extraRequest = false);
      }
    }

    return data;
  },

  getCollections(mortgage) {
    const params = clone(mortgage);

    params.subAction = 'collections';
    params.city_id = params && size(params.city_id) ?
      params.city_id : [data.options.cityId];
    const uri = generateMortgageUrl(params, '/msearcher_ajax.php?');

    request
      .get(uri)
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'public, max-age=21600'
      })
      .end((err, res) => {
        if(err) {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка получения данных с сервера. Попробуйте обновить страницу', // eslint-disable-line max-len
            type: 'dang'
          }]);
        } else if(!res.body.ok) {
          WidgetsActions.set('notify',[{
            msg: `Ошибка получения данных с сервера: ${res.text}. Попробуйте обновить страницу`, // eslint-disable-line max-len
            type: 'dang'
          }]);
        } else {
          const colls = res.body.collections;
          const descriptions = res.body.bankDescriptions;
          const bankBanners = res.body.bankBanners;

          WidgetsActions.set('mortgage', {
            ['collections']: colls,
            ['bankBanners']: bankBanners,
            ['descriptions']: descriptions,
            ['isColsLoading']: false
          });
        }
      });
  },

  getMortgagePrograms(mortgageData) {
    const params = clone(mortgageData);

    params.subAction = 'mortgage';
    params.city_id = params && size(params.city_id) ?
      params.city_id : [data.options.cityId];
    const uri = generateMortgageUrl(params, '/msearcher_ajax.php?');

    request
      .get(uri)
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'public, max-age=21600'
      })
      .end((err, res) => {
        if(err) {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка получения данных с сервера. Попробуйте обновить страницу', // eslint-disable-line max-len
            type: 'dang'
          }]);
        } else if(!res.body.ok) {
          WidgetsActions.set('notify',[{
            msg: `Ошибка получения данных с сервера: ${res.text}. Попробуйте обновить страницу`, // eslint-disable-line max-len
            type: 'dang'
          }]);
        } else {
          const cityId = data.options.cityId;
          const programsFlat = [];
          let banksCount = 0;

          if (res.body.programs.cities && res.body.programs.cities[cityId]) {
            const banks = res.body.programs.cities[cityId].banks;

            forEach(banks, (bank, bankId) => {
              forEach(bank.programs, (program, programId) => {
                programsFlat.push({
                  'bank_id': bankId,
                  'bank_name': bank.bank_name,
                  'bank_image': bank.bank_image,
                  'bank_rating': bank.bank_rating,
                  'pref': program.pref,
                  'program_id': programId,
                  'program_title': program.program_title,
                  'program_text': program.program_text,
                  'percents': program.percents,
                  'date_update': program.date_update,
                  'program_rating': program.program_rating
                });
              });
            });
            banksCount = size(banks);
          }
          const programsCount = size(programsFlat);
          const minProgram = this.getMinProgram(programsFlat);

          WidgetsActions.set('mortgage', {
            ['programs']: programsFlat,
            ['count']: programsCount,
            ['countWithFilter']: programsCount,
            ['banksCount']: banksCount,
            ['minPercent']: minProgram.percent,
            ['minBank']: minProgram.bank,
            ['banksFilter']: [],
            ['isProgsLoading']: false
          });
        }
      });
  },

  getMinProgram(programs) {
    const minValues = {};

    forEach(programs, program => {
      const minProgram = minBy(toArray(program.percents),
        p => program.pref ? parseFloat(p.percent - program.pref) :
          parseFloat(p.percent));
      const minProgramPercent = program.pref ?
        parseFloat(minProgram.percent - program.pref) :
        parseFloat(minProgram.percent);

      if (minProgramPercent > 0 && minProgramPercent < minValues.percent ||
        !minValues.percent) {
        minValues.percent = minProgramPercent;
        minValues.bank = program.bank_name;
      }
    });

    return minValues;
  }
};

export default Mortgage;
