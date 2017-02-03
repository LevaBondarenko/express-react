/**
 * mortgage methods
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/**
 * devDependencies
 */
import {
  toArray,
  forEach,
  minBy,
  clone,
  orderBy,
  indexOf,
  size,
  round,
  isArray,
  filter,
  map,
  intersection,
  take
} from 'lodash';
import {setCookie, getCookie} from './Helpers';
import request from 'superagent';

const mortgageHelpers = {
  filterPercents(programs, params, banksIds, shortcut) {
    const result = [];
    const credit = parseInt(params.credit);
    const years = parseInt(params.years);
    const avanse = parseInt(params.avanse);

    forEach(programs, program => {

      if (!size(banksIds) ||
      indexOf(banksIds, program.bank_id) > -1) {
        let percents = [];

        if (shortcut) {
          percents = toArray(program.percents);
        } else {
          forEach(program.percents, percent => {

            const avanseMin = parseInt(percent.avanse_min);
            const avanseMax = parseInt(percent.avanse_max);
            const creditMin = parseInt(percent.credit_min);
            const creditMax = parseInt(percent.credit_max);
            const yearsMin = parseInt(percent.years_min);
            const yearsMax = parseInt(percent.years_max);

            if (avanse >= avanseMin && avanse <= avanseMax &&
              credit >= creditMin && credit <= creditMax &&
              years  >= yearsMin  && years <= yearsMax) {
              percents.push(percent);
            }
          });
        }
        if (percents.length) {
          const maxPercent = minBy(percents, p => p.percent);
          const p = clone(program);

          p.percent = round(maxPercent.percent, 2);
          p.deltaPercent = round(p.percent - p.pref, 2);
          const payment = this.monthPayment(p.percent, credit, years);
          const paymentPref = this.monthPayment(p.deltaPercent, credit, years);

          p.monthPayment = payment;
          p.monthPaymentPref = paymentPref;
          p.deltaPref = (payment - paymentPref) * 12 * years;
          p.avanseMin = maxPercent.avanse_min;
          p.avanseMin = maxPercent.avanse_min;
          p.creditMin = maxPercent.credit_min;
          p.creditMax = maxPercent.credit_max;
          p.yearsMin = maxPercent.years_min;
          p.yearsMax = maxPercent.years_max;
          delete p.percents;

          result.push(p);
        }
      }
    });

    return orderBy(result,
      ['deltaPercent', 'deltaPref', 'percent'],
      ['asc', 'desc', 'asc']);
  },

  getRecomendedPrograms(
    programs,
    itemCount,
    skipPerBankFilter = false,
    oldMode = false
  ) {
    programs = programs &&
      programs.map(item => {
        item.program_rating = parseFloat(item.program_rating) || 0;
        item.program_rating = item.program_rating >= 1 ?
          1 : item.program_rating;

        return !isNaN(item.program_rating) && item;
      });

    let results = oldMode ?
      orderBy(programs, ['program_rating'], ['desc']) :
      orderBy(
        programs,
        ['deltaPercent', 'deltaPref', 'percent', 'program_rating'],
        ['asc', 'desc', 'asc', 'desc']
      );
    const bankIds = [];

    if(!skipPerBankFilter) {
      results = filter(results, item => {
        if(item && item.bank_id && bankIds.indexOf(item.bank_id) === -1) {
          bankIds.push(item.bank_id);
          return true;
        } else {
          return false;
        }
      });
    }
    results = take(results, itemCount);

    return orderBy(results,
      ['deltaPercent', 'deltaPref', 'percent'],
      ['asc', 'desc', 'asc']);
  },

  monthPayment(percent, creditPrice, creditTerm) {
    const E2 = percent / 1200;
    const znamenatel = 1 - Math.pow((1 + E2), (0 - creditTerm * 12));

    return Math.round(creditPrice * E2 / znamenatel);
  },

  overallPayment(payment, years) {
    return payment * years * 12;
  },

  paymentMonth(credit, percent, payment) {
    const E2 = percent / 1200;
    const log = (number, base) => Math.log(number) / Math.log(base);

    return (1 - log((1 - (credit * E2 / payment)), 1 + E2));
  },

  calculatePayment(conditions, years, avanse, credit) {
    const maxPercent = minBy(conditions, p => p.percent);

    const percent = round(maxPercent.percent, 2);
    const deltaPercent = maxPercent &&
      round(maxPercent.percent - maxPercent.pref, 2);
    const payment = this.monthPayment(percent, credit, years);
    const paymentPref = this.monthPayment(
      deltaPercent, credit, years
    );
    const betterPayment = paymentPref && payment > paymentPref ?
      paymentPref : payment;

    const overallNoPref = this.overallPayment(payment, years);
    const overallPref = paymentPref ?
      this.overallPayment(paymentPref, years) : 0;
    const economyPref = paymentPref && payment > paymentPref ?
      overallNoPref - overallPref : 0;

    return {
      payment: betterPayment,
      economyPref: economyPref,
      overallOverpayment: this.overallPayment(betterPayment, years) - credit
    };
  },

  filterCurrentProgramm(currentProgram, years, avanse, credit) {
    return filter(currentProgram, item => {
      const avanseMin = parseInt(item.avanse_min);
      const avanseMax = parseInt(item.avanse_max);
      const creditMin = parseInt(item.credit_min);
      const creditMax = parseInt(item.credit_max);
      const yearsMin = parseInt(item.years_min);
      const yearsMax = parseInt(item.years_max);

      if (avanse >= avanseMin && avanse <= avanseMax &&
        credit >= creditMin && credit <= creditMax &&
        years  >= yearsMin  && years <= yearsMax) {
        return item;
      }
    });
  },

  setCookieMortgageRequest(mortgage, expireDays) {
    const dataObject = clone(mortgage);

    const mortgageRequestId = this.getCookieMortgageRequestId();
    const cookieDomain = window.location.host.replace(/^[^.]*/, '');
    const settings = {
      domain: cookieDomain,
      expireDays: expireDays || 7,
      path: '/'
    };

    /* global data*/
    dataObject.city_id === undefined &&
      (dataObject.city_id = data.options.cityId);

    const preparedData = this.prepareRequestData(dataObject);

    return new Promise(resolve => {
      if (mortgageRequestId) {
        this.updateSearchRequest(preparedData, mortgageRequestId);
        preparedData.mortgageRequestId = mortgageRequestId;
        setCookie('mortgageData', JSON.stringify(preparedData), settings);

        resolve(mortgageRequestId);
      } else {
        this.generateSearchRequest(preparedData).then(responseId => {
          preparedData.mortgageRequestId = responseId;
          setCookie('mortgageData', JSON.stringify(preparedData), settings);

          resolve(responseId);
        });
      }
    });
  },

  generateSearchRequest(data) {
    data.subAction = 'create_search_program';

    const uri = this.generateMortgageRequestUrl(data, '/msearcher_ajax.php?');

    return new Promise((resolve, reject) => {
      request
        .get(uri)
        .type('form')
        .set({
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'public, max-age=21600'
        })
        .end((err, res) => {
          const response = JSON.parse(res.text);

          if (err) {
            reject({error: err.text});
          } else if (!response.ok) {
            reject({error: err.text});
          } else {
            resolve(response.id);
          }
        });
    });
  },

  updateSearchRequest(data, requestId) {
    data.subAction = 'update_search_program';
    data.id = requestId;

    const uri = this.generateMortgageRequestUrl(data, '/msearcher_ajax.php?');

    request
      .get(uri)
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'public, max-age=21600'
      }).end();
  },

  /*eslint camelcase: [2, {properties: "never"}]*/
  prepareRequestData(mortgage) {
    const data = {};

    data.action = 'mortgage';
    data.price = mortgage.price;
    data.realty_type_id = mortgage.program_types;
    data.avanse = mortgage.avanse;
    data.credit = mortgage.credit;
    data.years = mortgage.years;
    data.payroll_program_id = mortgage.bankProject;
    data.avg_income = mortgage.incomeAmount;
    data.employment_type_id = mortgage.employment;
    data.stage = mortgage.stage;
    data.income = mortgage.income;
    data.banks = mortgage.banksFilter;
    data.programs = mortgage.checkedPrograms;
    data.city_id = mortgage.city_id;
    data.social_program_id = mortgage.program_types_strict;

    return data;
  },

  parseRequestData(mortgage) {
    const data = {};

    data.price = mortgage.price;
    data.program_types = mortgage.realty_type_id;
    data.avanse = mortgage.avanse;
    data.credit = mortgage.credit;
    data.years = mortgage.years;
    data.bankProject = mortgage.payroll_program_id || null;
    data.incomeAmount = mortgage.avg_income;
    data.employment = mortgage.employment_type_id || null;
    data.stage = mortgage.stage || null;
    data.income = mortgage.income;
    data.banksFilter = mortgage.banks;
    data.checkedPrograms = mortgage.programs;
    data.city_id = mortgage.city_id;
    data.program_types_strict = mortgage.social_program_id || null;
    data.mortgageRequestId = mortgage.mortgageRequestId;

    return data;
  },

  getCookieMortgage() {
    const mortgageData = getCookie('mortgageData');
    const parsedData = mortgageData ?
      mortgageHelpers.parseRequestData(JSON.parse(mortgageData)) : {};

    return parsedData;
  },

  getCookieMortgageRequestId() {
    const parsedData = mortgageHelpers.getCookieMortgage();
    const {mortgageRequestId} = parsedData;

    return mortgageRequestId;
  },

  generateMortgageRequestUrl(model, baseUrl) {
    let queryUrl = baseUrl;
    const modelCopy = clone(model);

    forEach(modelCopy, (parameter, name) => {
      if (!parameter || isArray(parameter) && size(parameter) === 0) {
        queryUrl += `${name}=&`;
      } else {
        if (isArray(parameter)) {
          forEach(parameter, value => {
            queryUrl += `${name}[]=${encodeURIComponent(value)}&`;
          });
        }
        if (!isArray(parameter)) {
          queryUrl += `${name}=${encodeURIComponent(parameter)}&`;
        }
      }
    });
    return queryUrl.slice(0, -1);
  },

  getMortgageTypeByObject(objData) {
    const {class: oClass, type} = objData;
    let res = [];

    switch(oClass) {
    case 'flats':
      res = ['2'];
      break;
    case 'cottages':
      switch(type) {
      case 'garden':
        res = ['23'];
        break;
      case 'house':
      case 'cottage':
      case 'townhouse':
      case 'halfhouse':
        res = ['6'];
        break;
      case 'land':
        res = ['3', '9', '13', '14', '16', '19', '21'];
        break;
      default:
        res = ['3'];
      }
      break;
    case 'offices':
      res = ['11'];
      break;
    default:
      //do nothing
    }
    return res;
  },

  getMortageParamsNames(paramName, paramValue) {
    const paramsNames = {
      program_types: [
        'Тип недвижимости',
        'enum',
        [
          ['Новостройки', [1, 8]],
          ['Вторичная недвижимость', [2]],
          ['Частные дома и коттеджи', [6]],
          ['Земельные участки', [3, 9, 13, 14, 16, 19, 21]],
          ['Дачи', [23]]
        ]
      ],
      price: [
        'Стоимость недвижимости',
        'currency'
      ],
      avanse: [
        'Первоначальный взнос (руб. или %)',
        'percentAvanse'
      ],
      credit: [
        'Сумма кредита',
        'currency'
      ],
      years: [
        'Срок кредита',
        'years'
      ],
      bankProject: [
        'Зарплатный проект',
        'collection',
        'banks'
      ],
      program_types_strict: [
        'Социальная программа',
        'enum',
        [
          ['Ипотека по программе "Молодая семья"', [10]],
          ['Материнский капитал или субсидия на жилье', [34]],
          ['Военная ипотека', [24]],
          ['Программы обеспечения жильем', [12]]
        ]
      ],
      incomeAmount: [
        'Средний доход в месяц',
        'currency'
      ],
      employment: [
        'Тип занятости',
        'enum',
        [
          ['Наемный работник', [0]],
          ['Собственник бизнеса', [1]],
          ['Индивидуальный предприниматель', [2]],
          ['Пенсионер', [3]],
          ['Дектретный отпуск', [4]],
          ['Студент', [5]]
        ]
      ]
    };
    const res = {};
    const currentParam = paramsNames[paramName];

    if(currentParam) {
      res.title = currentParam[0];

      switch(currentParam[1]) {
      case 'enum':
        const valueName = filter(currentParam[2], item => {
          if(Object.prototype.toString.call(paramValue) === '[object Array]') {
            return size(intersection(item[1], map(paramValue, item => {
              return parseInt(item);
            }))) > 0;
          } else {
            return item[1].indexOf(parseInt(paramValue)) !== -1;
          }
        });

        res.valueType = 'string';
        res.value = size(valueName) ? (
          size(valueName) > 1 ? `Выбрано: ${size(valueName)}` : valueName[0][0]
        ) : 'Не выбрано';
        break;
      case 'currency':
      case 'percentAvanse':
      case 'collection':
      case 'years':
        res.valueType = currentParam[1];
        res.value = paramValue;
        break;
      default:
        res.valueType = 'unknown';
        res.value = paramValue;
      }
    }

    return size(res) ? res : null;
  },

  setNhObjectPrice(dataFlat, FilterQuarterStore, wss, WidgetsActions) {
    if (wss.get()['mortgage']) {
      const {mortgage} = clone(wss.get());

      if (FilterQuarterStore.myFlat.dolshik &&
      data.options.dolshikRealtyPrograms) {
        delete mortgage['newhouses_id'];
        mortgage['program_types'] = [2];
      } else {
        /* global data */
        mortgage['newhouses_id'] = data.object.info.id;
        delete mortgage['program_types'];
      }

      mortgage.price = dataFlat.price_discount;
      WidgetsActions.set('mortgage', mortgage);
    }
  },

  getMinProgram(programs) {
    const minValues = {};

    forEach(programs, program => {
      if (program.percents) {
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
          minValues.percent2 = minProgram.percent;
        }
      }
    });

    return minValues;
  }
};

export default mortgageHelpers;
