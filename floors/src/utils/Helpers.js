/*
 * Etagi project
 * widget helpers constant
 * o.e.kurgaev@it.etagi.com
 */

/**
 * appComponents
 */
import {
  indexOf, forEach, clone, isEmpty, intersection, difference, reject, isArray,
  includes, size, union, uniq, flattenDeep, values, property, map
} from 'lodash';
//import Uri from 'jsuri';

const Helpers = {
  /**
   * [priceFormatter format price with spaces]
   * @param  {int} price object price
   * @return {string} return formatted price with mask 000 000 000
   */
  priceFormatter(price = 0) {
    price = price !== null ? price : 0;
    return price.toString()
      .replace(/\s/g, '')
      .replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
  },

  /**
   * [priceCleanup remove spaces and other chars except numbers and dots]
   * @param  {int} price object price
   * @return {string} return formatted price
   */
  priceCleanup(price) {
    return price.toString().replace(/^0/g, '').replace(/[^0-9.]/g, '');
  },

  /**
  * [shadeColor преобразование цвета по яркасти]
  * @param {int} num - step from 1 to 1020 - gradient rainbow
  * @return {string} вернет цвет с измененным параметром
  */
  shadeColor(num) {
    let hex = num;
    let RR = '';
    let GG = '';
    let BB = '';

    if (num >= 0 && num <= 255) {
      RR = '00';
      GG = hex.toString(16).length === 1 ?
        `0${hex.toString(16)}` :
        hex.toString(16);
      BB = 'ff';
    } else if (num > 255 && num <= 510) {
      hex = 255 - (num - 255);

      RR = '00';
      GG = 'ff';
      BB = hex.toString(16).length === 1 ?
        `0${hex.toString(16)}` :
        hex.toString(16);
    } else if (num > 510 && num <= 765) {
      hex = num - 510;

      RR = hex.toString(16).length === 1 ?
        `0${hex.toString(16)}` :
        hex.toString(16);
      GG = 'ff';
      BB = '00';
    } else if (num > 765 && num <= 1020) {
      hex = 255 - (num - 765);

      RR = 'ff';
      GG = ((hex.toString(16).length === 1) ?
        `0${hex.toString(16)}` :
        hex.toString(16));
      BB = '00';
    } else if (num > 1020) {
      RR = 'ff';
      GG = '00';
      BB = '00';
    } else if (num < 0) {
      RR = '00';
      GG = '00';
      BB = 'ff';
    }

    return `#${RR}${GG}${BB}`;
  },

  /**
   * [phoneFormatter format phone number from +7 1112223344 to +7 (111) 222-33-44]
   * @param  {Number} phone phone number
   * @param  {Number} code phone country code
   * @param  {Array} codes available phone country codes
   * @param  {Bool} city phone with region code
   * @return {string} formatted string
   */
  phoneFormatter(phone = 0, code = 7, codes = [7]) {
    phone = phone ? phone.toString().trim().replace(/[^0-9]/gim, '') : '';
    if(phone && phone.length > 3) {
      let phoneWOCode, phoneCode;

      forEach(codes, item => {
        const reCode = new RegExp(`^(${item}|8)`, '');
        const matches = reCode.exec(phone);

        if(matches) {
          phoneCode = parseInt(matches[1].replace('+', ''));
          phoneWOCode = phone.replace(reCode, '');
        }
      });

      phoneCode || (phoneCode = code);
      phoneCode === 8 && code !== 8 && (phoneCode = 7);
      phoneWOCode && (phone = phoneWOCode);

      if (phone.length > 10) {
        phone = phone.toString().slice(0, 10);
      }

      if (phone.length <= 7) {
        phone = phone
          .toString()
          .replace(/^(\d{3})(\d)/, '($1) $2');
      } else if (phone.length <= 9) {
        phone = phone
          .toString()
          .replace(/^(\d{3})(\d{3})(\d)/, '($1) $2-$3');
      } else {
        phone = phone
          .toString()
          .replace(/^(\d{3})(\d{3})(\d{2})(\d{2})/, '($1) $2-$3-$4');
      }


      return `+${phoneCode} ${phone}`;
    } else if(phone) {
      return phone;
    } else {
      return '';
    }
  },

  switchLkObjectInput(value, type) {
    if(value != null) {
      switch(type) {
      case 'real':
        value = value.toString().replace(/\,/, '.');
        value = parseFloat(value);
        value || (value = 0);
        break;
      case 'integer':
        value = parseInt(value);
        value || (value = 0);
        break;
      default:
       //don nothing
      }
    }
  },

  phoneCleanup(phone = '') {
    return phone ?
        phone.toString().replace(/[^+0-9]/gim,'') : phone;
  },

  /**
   * [capitalizeString функция для замены первой буквы в строке на заглавную]
   * @param {string} str переданная строка
   * @return {string} vars considering all parameters
   */
  capitalizeString(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * [parseUrl and save get to array]
   * @return {array} vars considering all parameters
   */
  parseUrl() {
    let hash, cleanUrl;
    const vars = [];

    cleanUrl = window.location.search.split('#')[0]; //clean hashes
    cleanUrl = cleanUrl.replace(/^.*\/\/[^\/]+/, '');
    cleanUrl = cleanUrl.replace('/', '');
    const hashes = cleanUrl.slice(cleanUrl.indexOf('?') + 1).split('&');

    for (let i = 0; i < hashes.length; i++) {
      hash = hashes[i].split('=');
      hash[0] = hash[0].replace('%5B%5D', '');
      hash[0] = hash[0].replace('%5B0%5D', '');
      hash[0] = hash[0].replace('[]', '');
      if (hash[0] !== '') {
        vars.push({
          [hash[0]]: hash[1]
        });
      }
    }
    return vars;
  },

  /**
   * [parseUrlObject and save get to object]
   * @param  {array} ignoreParams - list of params to ignore
   * @return {object} vars considering all parameters
   */
  parseUrlObject(ignoreParams) {
    let hash, cleanUrl;
    const vars = {};

    cleanUrl = window.location.search.split('#')[0]; //clean hashes
    cleanUrl = decodeURIComponent(cleanUrl);
    cleanUrl = cleanUrl.replace(/^.*\/\/[^\/]+/, '');
    cleanUrl = cleanUrl.replace('/', '');
    const hashes = cleanUrl.slice(cleanUrl.indexOf('?') + 1).split('&');

    for (let i = 0; i < hashes.length; i++) {
      hash = [
        hashes[i].substr(0, hashes[i].indexOf('=')),
        hashes[i].substr(hashes[i].indexOf('=') + 1)
      ];//сплиттим по первому '=' потому что иногда в значениях параметрах встречается '='
      if (hash[0] !== '' && indexOf(ignoreParams, hash[0]) === -1) {
        if (hash[0].indexOf('[]') !== -1 ||
          hash[0].indexOf('%5B0%5D') !== -1 ||
          hash[0].indexOf('%5B%5D') !== -1) {

          hash[0] = hash[0].replace('%5B%5D', '');
          hash[0] = hash[0].replace('%5B0%5D', '');
          hash[0] = hash[0].replace('[]', '');
          if (vars[hash[0]] === undefined) {
            vars[hash[0]] = [hash[1]];
          } else {
            vars[hash[0]].push(hash[1]);
          }
        } else {
          vars[hash[0]] = hash[1];
        }
      }
    }
    return vars;
  },

  /**
   * [getUtmParams adds utm params to ticket if it has some]
   * @return {string} msg - new message with added params
   */
  getUtmParams() {
    const urlObj = Helpers.parseUrlObject();
    let msg = '';

    for (const urlParam in urlObj) {
      if (urlObj.hasOwnProperty(urlParam)) {
        if (urlParam === 'utm_source' || urlParam === 'utm_medium') {
          msg += `, ${urlParam}: ${urlObj[urlParam]}`;
        }
      }
    }

    return msg;
  },

  locationUrl(objectId, parameters) {
    let uri = `/jk/?gk=${objectId}&`;

    forEach(parameters, parameter => {
      if (parameter.price_min && parseInt(parameter.price_min) > 0) {
        uri += `price_min=${parameter.price_min}&`;
      }
      if (parameter.price_max && parseInt(parameter.price_max) > 0) {
        uri += `price_max=${parameter.price_max}&`;
      }
      if (parameter.price_type && parseInt(parameter.price_type) > 0) {
        uri += `price_type=${parameter.price_type}&`;
      }
      if (parameter.rooms) {
        uri += `rooms[]=${parameter.rooms}&`;
      }
    });
    uri = uri.slice(0, -1);
    return uri.slice(0, -1);
  },

  locationSlugUrl(slug, parameters) {
    let uri = `/zastr/jk/${slug}?`;

    forEach(parameters, parameter => {
      if (parameter.square_max && parseInt(parameter.square_max) > 0) {
        uri += `square_max=${parameter.square_max}&`;
      }
      if (parameter.square_min && parseInt(parameter.square_min) > 0) {
        uri += `square_min=${parameter.square_min}&`;
      }
      if (parameter.price_min && parseInt(parameter.price_min) > 0) {
        uri += `price_min=${parameter.price_min}&`;
      }
      if (parameter.price_max && parseInt(parameter.price_max) > 0) {
        uri += `price_max=${parameter.price_max}&`;
      }
      if (parameter.price_type && parseInt(parameter.price_type) > 0) {
        uri += `price_type=${parameter.price_type}&`;
      }
      if (parameter.rooms) {
        uri += `rooms[]=${parameter.rooms}&`;
      }
    });
    uri = uri.slice(0, -1);
    return uri;
  },

  /**
   * [generateSearchUrl generate http-query based on given model]
   * @param  {object} model - model
   * @param  {string} baseUrl - base url for query
   * @param  {boolean} order - including order of model in query
   * @param  {boolean} direction - including direction of model in query
   * @return {string} http-query string
   */
  generateSearchUrl(model, baseUrl, order = false, direction = false) {
    let queryUrl = baseUrl; //'/zastr/?';

    // можно было бы написать model.streets = model.validStreets(),
    // но в этой функции нельзя модифицировать model, поэтому
    const modelCopy = clone(model);

    //не во всех моделях есть .collections
    const counts = modelCopy.collections ?
      modelCopy.collections.districtsByTrakts : false;

    // отсекаем ненужные районы, если выбран целый тракт
    if (counts && !isEmpty(counts)) {
      forEach(modelCopy.trakt_id, (traktId) => {
        const sel = intersection(modelCopy.district_id, counts[traktId])
          .length;
        const total = counts[traktId].length;

        if (sel === total) {
          modelCopy['district_id'] = difference(modelCopy['district_id'],
            counts[traktId]);
        } else {
          modelCopy['trakt_id'] = reject(modelCopy['trakt_id'],
              t => t == traktId);
        }
      });
    }

    //не во всех моделях есть .validStreets()
    try {
      modelCopy.streets = model.validStreets();
    } catch (e) {}

    forEach(modelCopy, (parameter, name) => {
      if (parameter !== '' &&  parameter !== null && parameter !== undefined &&
        name !== 'countHouse' && name !== 'countFlats' && name !== 'count' &&
        name !== 'count_houses' && name !== 'perPage' && name !== 'pageNum' &&
        (order || name !== 'order') && !isArray(parameter) &&
        (direction || name !== 'order_direction')) {
        const symbol =  name === 'type' || name === 'rooms' ? '[]' : '';

        queryUrl += `${name}${symbol}=${encodeURIComponent(parameter)}&`;
      }

      if (isArray(parameter) && size(parameter) > 0) {
        forEach(parameter, value => {
          queryUrl += `${name}[]=${encodeURIComponent(value)}&`;
        });
      }

      if (name === 'deadline_data' && size(parameter) > 0) {
        forEach(parameter, (value, key) => {
          forEach(value, quarter => {
            queryUrl += `build-year-end[]=${quarter}_${key}&`;
          });

        });
      }

    });

    if (order && direction) {
      order = order.replace('ASC', '');
      order = order.replace('DESC', '');
      queryUrl += `order=${order}&order_direction=${direction}&`;
    }
    return queryUrl.slice(0, -1);
  },

  flattenObject(object) {
    return flattenDeep(uniq(
      union(values(object)), false, property('object_id')
    ));
  },

  helpPrice(val, interval, valSecond, digits = 7) {
    var ratio, firstNum, firstNumSecond, secondNumSecond,
      valSecondInt, valInt, countPrice, powNum2;

    if (val === '') {
      valInt = -1;
      firstNum = '';
    } else {
      valInt = +val;
      firstNum = val.charAt(0);

    }

    if (valSecond === '') {
      valSecondInt = -1;
      firstNumSecond = '';
      secondNumSecond = '';
    } else {
      valSecondInt = +valSecond;
      firstNumSecond = valSecond.charAt(0);
      secondNumSecond = valSecond.charAt(1);
    }

    countPrice = val.length;
    if (countPrice < digits) {
      ratio = Math.pow(10, digits - countPrice);
    } else {
      ratio = 1;
    }
    if (countPrice === 1) {
      powNum2 = digits - 1;
    } else if (countPrice === 2) {
      powNum2 = digits;
    }

    if (valInt !== -1) {
      valInt = valInt * ratio;
      if (val >= 100) {
        if (valSecondInt > valInt && valSecondInt < 10000000 &&
            interval === 'max' && valSecondInt !== -1) {
          valInt = valInt * 10;
        } else if (valSecondInt < valInt && valSecondInt < 10000000 &&
                  interval === 'min' && valSecondInt !== -1) {
          valInt = valInt / 10;
        }
        if (valInt < valSecondInt && interval === 'max' &&
            valSecondInt !== -1) {
          valInt = valInt * 10;
        } else if (valInt > valSecondInt && interval === 'min' &&
                   valSecondInt !== -1) {
          valInt = valInt / 10;
        }
      } else if (valInt > valSecondInt && interval === 'min' &&
                 valSecondInt !== -1) {
        valInt = valInt / 10;
      } else if (firstNum === firstNumSecond && interval === 'max' &&
                 val < 10) {
        if (secondNumSecond < 5) {
          valInt = +valSecondInt + 5 * Math.pow(10, (powNum2 - countPrice));
        } else {
          valInt = +(`${firstNum}9`) * Math.pow(10, (powNum2 - countPrice));
        }
      } else if (valInt < valSecondInt && interval === 'max' &&
        valSecondInt !== -1) {
        valInt = valInt * 10;
      }
    }

    return valInt > 0 ? valInt : 0;
  },

  /**
   * [passwordTester password must contain at least one number and one letter (eng or rus) min length is 6 symbols]
   * @param  {string} pw - testing password
   * @return {boolean}       [true|false]
   */
  testPassword(pw) {
    const ex = /^(?=.*\d)(?=.*[A-Za-zА-яЁё]).{6,}$/;

    return ex.test(pw);
  },

  /**
   * [emailTester format email must be user[.]name@server.domain
   * @param  {string} email - testing email
   * @return {boolean}       [true|false]
   */
  testEmail(email) {
    const ex = /^[-._a-z0-9]+@(?:[a-z0-9][-a-z0-9]+\.)+[a-z]{2,6}$/i;

    return ex.test(email);
  },

  /**
   * [phoneTester format phone number must be +7 (111) 222-33-44]
   * @param  {string} phone - testing phone number
   * @param  {boolean} simple - simple testing
   * @param  {Array} codes available phone country codes
   * @return {boolean}       [true|false]
   */
  testPhone(phone, simple = false, codes = [7]) {
    const ex = simple ?
      new RegExp(`^(\\+{0,1}${codes.join('|\\+{0,1}')}|8)[0-9]{9,10}$`, '') :
      /^[+]7\s[(]\d{3}[)]\s\d{3}-\d{2}-\d{2}$/;

    return ex.test(phone);
  },

  getEnv() {
    const currentServer = window.location.hostname;

    return currentServer.indexOf('.dev') !== -1 ||
      currentServer === 'localhost' ? 'dev' : 'production';
  },

  /**
   * [toCamel format underscore string to camelCase]
   * @param  {string} s - input string
   * @returns {string} convertedSrting
   */
  toCamel(s) {
    const str = s ? s : '';
    const pattern = /(\_[a-z])/g;

    return str.replace(pattern, g => g[1].toUpperCase());
  },

  /**
   * [toUnderscore format camelCase string to underscore ]
   * @param  {string} s - input srting
   * @returns {string} converted_srting
   */
  toUnderscore(s) {
    const str = s ? s : '';
    const pattern = /([A-Z])/g;

    return str.replace(pattern, g => `_${g.toLowerCase()}`);
  },

  /**
   * [objPropsConvert recursive format filednames of object to camelCase or underscore]
   * @param  {object} o - object
   * @param  {boolean} cc - true - convert to camelCase or false - convert to underscore
   * @returns {string} convertedSrting
   */
  objPropsConvert(o, cc) {
    const r = {};

    for (const key in o) {
      if (o.hasOwnProperty(key)) {
        const nKey = cc ? Helpers.toCamel(key) : Helpers.toUnderscore(key);

        r[nKey] = o[key] !== null && typeof o[key] === 'object' ?
        Helpers.objPropsConvert(o[key], cc) : o[key];
      }
    }
    return r;
  },

  colorChart(engName) {
    let rusName = engName;

    switch (engName) {
    case '1':
      rusName = '#1bc4d7';
      break;
    case '2':
      rusName = '#00b6a2';
      break;
    case '3':
      rusName = '#e96b76';
      break;
    case '4+':
      rusName = '#e31f30';
      break;
    case 'pansion':
      rusName = '#bebebe';
      break;
    case 'house':
      rusName = '#bebebe';
      break;
    case 'land':
      rusName = '#1bc4d7';
      break;
    case 'cottage':
      rusName = '#e31f30';
      break;
    case 'townhouse':
      rusName = '#e96b76';
      break;
    case 'garden':
      rusName = '#00b6a2';
      break;
    case 'dev':
      rusName = '#bebebe';
      break;
    case 'base':
      rusName = '#1bc4d7';
      break;
    case 'busines':
      rusName = '#00b6a2';
      break;
    case 'office':
      rusName = '#e96b76';
      break;
    case 'torg':
      rusName = '#e31f30';
      break;
    case 'other':
      rusName = '#bebebe';
      break;
    case 'sklad':
      rusName = '#1bc4d7';
      break;
    case 'offices':
      rusName = '#00b6a2';
      break;
    case 'cottages':
      rusName = '#e96b76';
      break;
    case 'flats':
      rusName = '#e31f30';
      break;
    default:
      rusName = '#bebebe';
    }

    return rusName;
  },

  rusTypes(engName, plural = false) {
    let rusName = engName;

    switch (engName) {
    case '1':
      rusName = '1 - комнатная';
      break;
    case '2':
      rusName = '2 - комнатная';
      break;
    case '3':
      rusName = '3 - комнатная';
      break;
    case '4+':
      rusName = 'Многокомнатная';
      break;
    case 'pansion':
      rusName = plural ? 'Пансионаты' : 'Пансионат';
      break;
    case 'room':
      rusName = plural ? 'Комнаты' : 'Комната';
      break;
    case 'malosem':
      rusName = plural ? 'Малосемейки' : 'Малосемейка';
      break;
    case 'obshaga':
      rusName = plural ? 'Общежития' : 'Общежитие';
      break;
    case 'house':
      rusName = plural ? 'Дома' : 'Дом';
      break;
    case 'land':
      rusName = plural ? 'Земельные участки' : 'Земельный участок';
      break;
    case 'cottage':
      rusName = plural ? 'Коттеджи' : 'Коттедж';
      break;
    case 'townhouse':
      rusName = plural ? 'Таунхаусы' : 'Таунхаус';
      break;
    case 'garden':
      rusName = plural ? 'Дачи' : 'Дача';
      break;
    case 'dev':
      rusName = plural ? 'Производства' : 'Производство';
      break;
    case 'base':
      rusName = plural ? 'Базы' : 'База';
      break;
    case 'busines':
      rusName = 'Готовый бизнес';
      break;
    case 'office':
      rusName = plural ? 'Офисы' : 'Офис';
      break;
    case 'torg':
      rusName = plural ? 'Торговые' : 'Торговое';
      break;
    case 'other':
      rusName = 'Свободное назначение';
      break;
    case 'sklad':
      rusName = plural ? 'Склады' : 'Склад';
      break;
    case 'offices':
      rusName = 'Коммерческая недвижимость';
      break;
    case 'cottages':
      rusName = 'Загородная недвижимость';
      break;
    case 'flats':
      rusName = 'Вторичная недвижимость';
      break;
    case 'rent':
      rusName = 'Аренда';
      break;
    case 'nh_flats':
    case 'newhouses':
    case 'newhousesflats':
    case 'newhouses_commerce':
      rusName = 'Новостройки';
      break;
    default:
      rusName = engName;
    }

    return rusName;
  },

  codeAnalytics(param, types, districts, percentPrice, percentCount = 0) {
    let code = 0;

    let typeNum, districtsNum, percentNum, percentNumCount;
    const arr = {};

    arr[0] = {};
    arr[0][0] = {};
    arr[0][0][1] = {};
    arr[0][0][2] = {};
    arr[0][0][3] = {};
    arr[0][1] = {};
    arr[0][1][1] = {};
    arr[0][1][2] = {};
    arr[0][1][3] = {};
    arr[1] = {};
    arr[1][0] = {};
    arr[1][0][1] = {};
    arr[1][0][2] = {};
    arr[1][0][3] = {};
    arr[1][1] = {};
    arr[1][1][1] = {};
    arr[1][1][2] = {};
    arr[1][1][3] = {};

    arr[0][0][1][1] = 0;
    arr[0][0][1][2] = 0;
    arr[0][0][1][3] = 0;
    arr[0][0][2][1] = 0;
    arr[0][0][2][2] = 0;
    arr[0][0][2][3] = 0;
    arr[0][0][3][1] = 0;
    arr[0][0][3][2] = 0;
    arr[0][0][3][3] = 0;
    arr[0][1][1][1] = 1;
    arr[0][1][1][2] = 2;
    arr[0][1][1][3] = 3;
    arr[0][1][2][1] = 4;
    arr[0][1][2][2] = 5;
    arr[0][1][2][3] = 6;
    arr[0][1][3][1] = 7;
    arr[0][1][3][2] = 8;
    arr[0][1][3][3] = 9;

    arr[1][0][1][1] = 10;
    arr[1][0][1][2] = 11;
    arr[1][0][1][3] = 12;
    arr[1][0][2][1] = 13;
    arr[1][0][2][2] = 14;
    arr[1][0][2][3] = 15;
    arr[1][0][3][1] = 16;
    arr[1][0][3][2] = 17;
    arr[1][0][3][3] = 18;
    arr[1][1][1][1] = 19;
    arr[1][1][1][2] = 20;
    arr[1][1][1][3] = 21;
    arr[1][1][2][1] = 22;
    arr[1][1][2][2] = 23;
    arr[1][1][2][3] = 24;
    arr[1][1][3][1] = 25;
    arr[1][1][3][2] = 26;
    arr[1][1][3][3] = 27;

    switch (types) {
    case 1:
      typeNum = 1;
      break;
    default:
      typeNum = 0;
    }

    switch (districts) {
    case 1:
      districtsNum = 1;
      break;
    default:
      districtsNum = 0;
    }

    if (percentPrice > param) {
      percentNum = 2;
    } else if (percentPrice <= param && percentPrice >= -param) {
      percentNum = 1;
    } else if (percentPrice < -param) {
      percentNum = 3;
    }

    if (percentCount > param) {
      percentNumCount = 2;
    } else if (percentCount <= param && percentCount >= -param) {
      percentNumCount = 1;
    } else if (percentCount < -param) {
      percentNumCount = 3;
    }

    code = arr[typeNum][districtsNum][percentNum][percentNumCount];
    return code;
  },

  declOfNum(number, titles) {
    const cases = [2, 0, 1, 1, 1, 2];
    const condition = number % 100 > 4 && number % 100 < 20;

    return titles[ condition ? 2 : cases[(number % 10 < 5) ?
      Math.round(number % 10) : 5]];
  },

  shorten(text, maxLength) {
    let ret = text;

    if (ret.length > maxLength) {
      ret = `${ret.substr(0, maxLength - 3)}...`;
    }
    return ret;
  },

  scrollTo(element, target, duration) {
    target = Math.round(target);
    duration = Math.round(duration);
    if (duration < 0) {
      return Promise.reject('bad duration');
    }
    if (duration === 0) {
      element.scrollTop = target;
      return Promise.resolve();
    }

    const startTime = Date.now(),
      endTime = startTime + duration,
      startTop = element.scrollTop,
      distance = target - startTop;

    const smootStep = (start, end, point) => {
      if (point <= start) { return 0; }
      if (point >= end) { return 1; }
      const x = (point - start) / (end - start); // interpolation

      return x * x * (3 - 2 * x);
    };

    return new Promise(resolve => {
        // This is to keep track of where the element's scrollTop is
        // supposed to be, based on what we're doing
      var previousTop = element.scrollTop;

      // This is like a think function from a game loop
      var scrollFrame = function() {

        if (element.scrollTop != previousTop) {
          resolve();
        }
        // set the scrollTop for this frame
        const now = Date.now(),
          point = smootStep(startTime, endTime, now),
          frameTop = Math.round(startTop + distance * point);

        element.scrollTop = frameTop;


        // check if we're done!
        if (now >= endTime) {
          resolve();
          return;
        }

        // If we were supposed to scroll but didn't, then we
        // probably hit the limit, so consider it done; not
        // interrupted.
        if(Math.ceil(element.scrollTop) === previousTop &&
            Math.ceil(element.scrollTop) !== frameTop) {
          resolve();
          return;
        }
        previousTop = element.scrollTop;

        // schedule next frame for execution
        setTimeout(scrollFrame, 0);
      };

      // boostrap the animation process
      setTimeout(scrollFrame, 0);
    });
  },

  getTitle(key, type = false, short = false) {
    const args = {
      0: 'Квартира',
      1: 'Однокомнатная квартира',
      2: 'Двухкомнатная квартира',
      3: 'Трехкомнатная квартира',
      4: 'Многокомнатная квартира',
    };

    if(!type || type === 'квартира') {
      key = key >= 4 && !short ? 4 : key;
      return short && key !== 0 ? (
         `${key}-комнатная`
      ) : args[key];
    } else {
      return Helpers.capitalizeString(type);
    }
  },
  coolJoin(separator, arr, processor) {
    if (processor) {
      const newArr = map(arr, item => processor(item));

      return newArr.join(separator);
    } else {
      return arr.join(',');
    }
  },
  getAdress(district, street, houseNum) {
    let title = '';

    if(district && district !== '0') {
      title += `${district}, `;
    }
    if(street && street !== '0') {
      title += `ул. ${street}`;
    } else {
      title = title.slice(0, -2);
    }
    if(houseNum && houseNum !== '0') {
      title += `, д. ${houseNum}`;
    }
    return title;
  },
  cutText(text, cutoff) {
    text = text !== null ? text : '';
    let rest = text.substring(cutoff);

    if (text.length > cutoff) {
      const period = rest.indexOf('.');
      const space = rest.indexOf(' ');

      cutoff += Math.max(Math.min(period, space), 0);
    }
    // Assign the rest again, because we recalculated the cutoff
    rest = text.substring(cutoff);
    return [text.substring(0, cutoff), rest];
  },
  coolJoin(separator, arr, processor) {
    if (processor) {
      const newArr = map(arr, item => processor(item));

      return newArr.join(separator);
    } else {
      return arr.join(',');
    }
  },
  periodCheck(date = '') {
    const currentDate = new Date(),
      day = currentDate.getDate(),
      month = currentDate.getMonth() + 1,
      year = currentDate.getFullYear(),
      today = `${year}-${month}-${day}`;
    let period,
      currentMonth = new Date(),
      currentWeek = new Date();

    currentMonth = new Date(currentMonth.setMonth(currentMonth.getMonth() - 1));
    currentWeek = new Date(currentWeek.setDate(currentWeek.getDate() - 7));
    currentMonth = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1)}-${currentMonth.getDate()}`; // eslint-disable-line max-len
    currentWeek = `${currentWeek.getFullYear()}-${(currentWeek.getMonth() + 1)}-${currentWeek.getDate()}`; // eslint-disable-line max-len

    if(date === '') {
      period = 'all';
    } else if(currentMonth === date) {
      period = 'month';
    } else if(currentWeek === date) {
      period = 'week';
    } else if(today === date) {
      period = 'day';
    }

    return period;
  },
  periodSet(value = '') {
    const currentDate = new Date(),
      day = currentDate.getDate(),
      month = currentDate.getMonth() + 1,
      year = currentDate.getFullYear();
    let periodDate,
      currentMonth = new Date(),
      currentWeek = new Date();

    currentMonth = new Date(currentMonth.setMonth(currentMonth.getMonth() - 1));
    currentWeek = new Date(currentWeek.setDate(currentWeek.getDate() - 7));
    currentMonth = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1)}-${currentMonth.getDate()}`; // eslint-disable-line max-len
    currentWeek = `${currentWeek.getFullYear()}-${(currentWeek.getMonth() + 1)}-${currentWeek.getDate()}`; // eslint-disable-line max-len

    switch (value) {
    case 'all':
      periodDate = '';
      break;
    case 'month':
      periodDate = currentMonth;
      break;
    case 'week':
      periodDate = currentWeek;
      break;
    case 'day':
      periodDate = `${year}-${month}-${day}`;
      break;
    default:
    }

    return periodDate;
  },
  /**
   * [getNameFromCollection get name of item in collection based on given id]
   * @param  {array} c - collection
   * @param  {int} id - id of object
   * @returns {string} name of object
   */
  getNameFromCollection(c, id) {
    for(const i in c) {
      if(c[i]) {
        if((c[i].id.toString()) === id.toString()) {
          return c[i].name;
        }
      }
    }
    return false;
  },

  /**
   * [getAllElementsWithAttribute get all elements on page by tag name and attribute value]
   * @param  {string} attribute - name of attribute
   * @param  {string} tag - name of tag
   * @returns {array} collection of DOM objects
   */
  getAllElementsWithAttribute(attribute, tag) {
    const matchingElements = [];
    const allElements = document.getElementsByTagName(tag);

    for (let i = 0, n = allElements.length; i < n; i++) {
      if (allElements[i].getAttribute(attribute) !== null) {
        // Element exists with attribute. Add to array.
        matchingElements.push(allElements[i]);
      }
    }
    return matchingElements;
  },

  /**
   * [getUrlData get url data]
   * @param  {string} href - location
   * @returns {array} collection of url properties
   */
  getUrlData(href) {
    const reURLInformation = new RegExp([
      '^(https?:)//', // protocol
      '(([^:/?#]*)(?::([0-9]+))?)', // host (hostname and port)
      '(/[^?#]*)', // pathname
      '(\\?[^#]*|)', // search
      '(#.*|)$' // hash
    ].join(''));
    const match = href.match(reURLInformation);

    return match && {
      protocol: match[1],
      host: match[2],
      hostname: match[3],
      port: match[4],
      pathname: match[5],
      search: match[6],
      hash: match[7]
    };
  },

  /**
   * [getFilterDesc get filter description]
   * @param  {object} filter - filter object
   * @param  {array} colls - array of collections of districts, streets and so on..
   * @param  {object} currency - currency object
   * @returns {string} filter description
   */
  getFilterDesc(filter, colls = [], currency = null) {
    let desc = '', rooms = '';

    if((filter.class && filter.class === 'rent') ||
      (filter.action_sl && (filter.action_sl === 'lease' || //eslint-disable-line camelcase
      includes(filter.action_sl, 'lease')))) { //eslint-disable-line camelcase
      desc += 'Аренда: ';
    } else {
      desc += 'Продажа: ';
    }
    if(filter.rooms) {
      let roomsArr, multyroom = false;

      if(!isArray(filter.rooms)) {
        if(filter.rooms.indexOf(',') !== -1) {
          roomsArr = filter.rooms.split(',');
        } else {
          roomsArr = [filter.rooms];
        }
      } else {
        roomsArr = filter.rooms;
      }
      for(const i in roomsArr) {
        if(roomsArr[i]) {
          if(roomsArr[i].indexOf('>') === 0) {
            multyroom = true;
          } else {
            rooms += `${roomsArr[i]}-,`;
          }
        }
      }
      if(rooms.length) {
        rooms = `${rooms.slice(0, -1)}комнатные`;
        if(multyroom) {
          rooms += ' и многокомнатные ';
        }
        rooms += ' ';
      } else if(multyroom) {
        rooms += 'Многокомнатные ';
      }
    }

    if(filter.class && filter.class.length) {
      switch(filter.class) {
      case 'flats' :
      case 'rent' :
        if(rooms.length) {
          desc += `${rooms}квартиры, `;
        } else {
          desc += 'Квартиры, ';
        }
        break;
      case 'nh_flats':
        if(rooms.length) {
          desc += `${rooms}квартиры в новостройках, `;
        } else {
          desc += 'Квартиры в новостройках, ';
        }
        break;
      case 'cottages':
        if(!size(filter.type)) {
          desc += 'Объекты загородной недвижимости, ';
        }
        break;
      case 'offices':
        if(!size(filter.type)) {
          desc += 'Объекты коммерческой недвижимости, ';
        }
        break;
      default:
        desc += 'Объекты, ';
      }
    } else {
      desc += 'Объекты, ';
    }
    if(size(filter.type)) {
      for(const i in filter.type) {
        if(filter.type[i] && filter.type[i] !== 'flat') {
          desc += `${Helpers.rusTypes(filter.type[i], true)}, `;
        }
      }
    }
    if(size(filter.keep)) {
      let keeps = '';

      for(const i in filter.keep) {
        if(filter.keep[i]) {
          switch(filter.keep[i]) {
          case 'black':
            keeps += 'черновая, ';
            break;
          case 'well_black':
            keeps += 'улучшенная черновая, ';
            break;
          case 'need':
            keeps += 'частичный ремонт, ';
            break;
          case 'cosmetic':
            keeps += 'косметический ремонт, ';
            break;
          case 'good':
            keeps += 'cовременный ремонт, ';
            break;
          case 'design':
            keeps += 'ремонт по дизайн проекту, ';
            break;
          default:
            //do nothing
          }
        }
      }
      if(size(keeps)) {
        desc += `с отделкой: ${keeps}`;
      }
    }
    if(size(colls)) {
      for(const i in colls) {
        if(colls[i]) {
          const fPar = isArray(filter[i]) ? filter[i] : [filter[i]];

          if(size(fPar) > 0) {
            let collDesc = '', cntColls = 0;

            for(const j in fPar) {
              if(fPar[j] && colls[i][fPar[j]]) {
                collDesc += `${colls[i][fPar[j]].name}, `;
                cntColls++;
                if(size(fPar) > 3 && cntColls > 1) {
                  collDesc += `и еще ${size(fPar) - cntColls}, `;
                  break;
                }
              }
            }
            if(cntColls) {
              switch(i) {
              case 'city_id':
                desc += `${collDesc}`;
                break;
              case 'district_id':
                desc += cntColls > 1 ?
                  `в районах: ${collDesc}` : `в районе ${collDesc}` ;
                break;
              case 'street_id':
                desc += cntColls > 1 ?
                  `на улицах: ${collDesc}` : `на улице ${collDesc}`;
                break;
              case 'trakt_id':
                desc += cntColls > 1 ?
                  `на трактах: ${collDesc}` : `на тракте ${collDesc}`;
                break;
              case 'builder_id':
                desc += cntColls > 1 ?
                  `от застройщиков: ${collDesc}` :
                  `от застройщика ${collDesc}`;
                break;
              case 'newcomplex_id':
                desc += `в ЖК: ${collDesc}`;
                break;
              case 'furniture':
                desc += `укомплектованность: ${collDesc}`;
                break;
              default:
                //do nothing
              }
            }
          }
        }
      }
    }

    const course = currency ? currency.course : 1;
    const unit = currency ? currency.unit : 'руб.';

    desc += Helpers.getFilterDescRange(
      filter.price_min ?
        Math.round(parseInt(Helpers.priceCleanup(filter.price_min)) * course) :
        null,
      filter.price_max ?
        Math.round(parseInt(Helpers.priceCleanup(filter.price_max)) * course) :
        null,
      'c ценой',
      ` ${unit}`
    );
    desc += Helpers.getFilterDescRange(
      filter.square_min,
      filter.square_max,
      'c площадью',
      ' м\u00B2'
    );
    desc += Helpers.getFilterDescRange(
      filter.square_kitchen_min,
      filter.square_kitchen_max,
      'c площадью кухни',
      ' м\u00B2'
    );
    desc += Helpers.getFilterDescRange(
      filter.area_land_min,
      filter.area_land_max,
      'c площадью участка',
      ' сот.'
    );
    desc += Helpers.getFilterDescRange(
      filter.area_house_min,
      filter.area_house_max,
      'c площадью дома',
      ' м\u00B2'
    );
    desc += Helpers.getFilterDescRange(
      filter.floor_min,
      filter.floor_max,
      'на этаже'
    );
    desc += Helpers.getFilterDescRange(
      filter.floors_min,
      filter.floors_max,
      'c этажностью'
    );
    return desc.slice(0, -2);
  },

  /**
   * [getFilterDescRange get filter range field description]
   * @param  {integer} minVal - minumum value
   * @param  {integer} maxVal - maximum value
   * @param  {string} valName - value name
   * @param  {string} valUnit - value unit
   * @returns {string} filter range field description
   */
  getFilterDescRange(minVal, maxVal, valName, valUnit = '') {
    let res = '';
    const minValF = minVal ?
      Helpers.priceFormatter(Math.round(minVal)) : null;
    const maxValF = maxVal ?
      Helpers.priceFormatter(Math.round(maxVal)) : null;

    if(minVal) {
      if(maxVal) {
        res = `${valName} от ${minValF} до ${maxValF}${valUnit}, `;
      } else {
        res = `${valName} более ${minValF}${valUnit}, `;
      }
    } else if(maxVal) {
      res = `${valName} менее ${maxValF}${valUnit}, `;
    }
    return res;
  },

  findPos(target) {
    let node = document.getElementById(target) ||
      document.getElementsByClassName(target)[0];

    if (!node) {
      return false;
    }

    let curtop = 0;
    //let curtopscroll = 0;

    if (node.offsetParent) {
      do {
        curtop += node.offsetTop;
        //curtopscroll += node.offsetParent ? node.offsetParent.scrollTop : 0;
      } while (node = node.offsetParent);
    }
    return (curtop);
  },

  /**
   * [getOffset check if current offset is greater than total count]
   * @param  {integer} offset - current offset
   * @param  {integer} count - total objects count
   * @param  {integer} perPage - objects per page
   * @returns {integer} new offset
   */
  getOffset(offset, count, perPage) {
    return Math.floor(offset / perPage) >= Math.floor(count / perPage) ?
      0 : offset;
  },

  /**
   * [formatLocalDate return local date in ISO-format with timezone offset]
   * @returns {string} local date in ISO-format
   */
  formatLocalDate() {
    const now = new Date(),
      tzo = -now.getTimezoneOffset(),
      dif = tzo >= 0 ? '+' : '-',
      pad = (num) => {
        const norm = Math.abs(Math.floor(num));

        return (norm < 10 ? '0' : '') + norm;
      };

    return now.getFullYear() + //eslint-disable-line prefer-template
      '-' + pad(now.getMonth() + 1) +
      '-' + pad(now.getDate()) +
      'T' + pad(now.getHours()) +
      ':' + pad(now.getMinutes()) +
      ':' + pad(now.getSeconds()) +
      dif + pad(tzo / 60) +
      pad(tzo % 60);
  },


  /**
   * [addClass returns string concatenated with classnames]
   * @param  {string} classString - html element
   * @param  {string} cssClass - class to add
   * @returns {string} classnames
   */
  addClass(classString, cssClass) {
    const classes = classString.split(' ');

    if (classes.indexOf(cssClass) === -1) {
      classes.push(cssClass);
    }

    return classes.join(' ');
  },

  /**
   * [addClass returns string concatenated with classnames]
   * @param  {string} classString - html element
   * @param  {string} cssClass - class to remove
   * @returns {string} classnames
   */
  removeClass(classString, cssClass) {
    const classes = classString.split(' ');

    if (classes.indexOf(cssClass) !== -1) {
      delete classes[classes.indexOf(cssClass)];
    }

    return classes.join(' ');
  },

  /**
   * [addClass returns string concatenated with classnames]
   * @param  {Node} classString - html element
   * @param  {string} cssClass - class to toggle
   * @returns {string} classnames
   */
  toggleClass(classString, cssClass) {
    const classes = classString.split(' ');

    if (classes.indexOf(cssClass) === -1) {
      classes.push(cssClass);
    } else {
      delete classes[classes.indexOf(cssClass)];
    }

    return classes.join(' ');
  },

  setCookie(name, value, options) {
    options = options || {};

    let expires = options.expireDays;

    if (typeof expires == 'number' && expires) {
      const d = new Date();

      d.setTime(d.getTime() + expires * 24 * 60 * 60 * 1000);
      expires = options.expireDays = d;
    }
    if (expires && expires.toUTCString) {
      options.expires = expires.toUTCString();
      delete options.expireDays;
    }

    value = encodeURIComponent(value);

    let updatedCookie = `${name}=${value}`;

    for (const propName in options) {
      if (options.hasOwnProperty(propName)) {
        updatedCookie += `; ${propName}`;
        const propValue = options[propName];

        if (propValue !== true) {
          updatedCookie += `=${propValue}`;
        }
      }
    }
    document.cookie = updatedCookie;
  },

  getCookie(name) {
    const matches = document.cookie.match(new RegExp(
      `(?:^|; )${name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1')}=([^;]*)`
    ));

    return matches ? decodeURIComponent(matches[1]) : undefined;
  },

  deleteCookie(name) {
    Helpers.setCookie(name, '', {
      expireDays: -1,
      path: '/'
    });
  },

  isMobile() {
    if(navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i)) {
      return true;
    } else {
      return false;
    }
  },

  distFromSeaFormat(distance) {
    const matches = distance.match(/^(\d*)to(\d*)$/);

    if (matches && matches.length) {
      return `менее ${matches[2]}`;
    } else {
      return distance === 'greater1000' ? 'более 1000' : '';
    }
  },

  isElementInViewport(el, viewport) {
    const parentElement = viewport;

    if (typeof jQuery === 'function' && el instanceof jQuery) {
      el = el[0];
    }
    const rect = $(el).position();

    return (
      rect.left + 40 <= ($(parentElement).scrollLeft() +
      parentElement.clientWidth) &&
      rect.left + el.clientWidth - 20 >= $(parentElement).scrollLeft()
    );
  },

  isAbsolutePath(path) {
    return /^(?:\/|[a-z]+:\/\/)/.test(path);
  },

  isRetina() {
    const mediaQuery = 'only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx), only screen and (min-resolution: 75.6dpcm)'; // eslint-disable-line max-len
    const pixelQuery = 'only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min--moz-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2)'; // eslint-disable-line max-len

    return ((window.matchMedia && (window.matchMedia(mediaQuery).matches ||
          window.matchMedia(pixelQuery).matches)) ||
          (window.devicePixelRatio && window.devicePixelRatio >= 2)) &&
          /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
  },

  isHighDensity() {
    const mediaQuery = 'only screen and (min-resolution: 124dpi), only screen and (min-resolution: 1.3dppx), only screen and (min-resolution: 48.8dpcm)'; // eslint-disable-line max-len
    const pixelQuery = 'only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (min-device-pixel-ratio: 1.3)'; // eslint-disable-line max-len

    return ((window.matchMedia && (window.matchMedia(mediaQuery).matches ||
      window.matchMedia(pixelQuery).matches)) ||
      (window.devicePixelRatio && window.devicePixelRatio > 1.3));
  },

  generateMortgageUrl(model, baseUrl, order = false, direction = false) {
    let queryUrl = baseUrl;
    const modelCopy = clone(model);

    forEach(modelCopy, (parameter, name) => {
      if (isArray(parameter) && size(parameter) > 0) {
        forEach(parameter, value => {
          queryUrl += `${name}[]=${encodeURIComponent(value)}&`;
        });
      }
      if (!isArray(parameter) && parameter !== '' && parameter !== undefined) {
        queryUrl += `${name}=${encodeURIComponent(parameter)}&`;
      }
    });

    if (order && direction) {
      order = order.replace('ASC', '');
      order = order.replace('DESC', '');
      queryUrl += `order=${order}&order_direction=${direction}&`;
    }
    return queryUrl.slice(0, -1);
  },

  generateShowCaseUrl(model, baseUrl, order = false, direction = false) {
    let queryUrl = baseUrl;
    const modelCopy = clone(model);

    forEach(modelCopy, (parameter, name) => {
      if (isArray(parameter) && size(parameter) > 0) {
        forEach(parameter, value => {
          queryUrl += `${name}[]=${encodeURIComponent(value)}&`;
        });
      }
      if (!isArray(parameter) && parameter !== '' && parameter !== undefined) {
        queryUrl += `${name}=${encodeURIComponent(parameter)}&`;
      }
    });

    if (order && direction) {
      order = order.replace('ASC', '');
      order = order.replace('DESC', '');
      queryUrl += `order=${order}&order_direction=${direction}&`;
    }
    return queryUrl.slice(0, -1);
  },

  modelCompare(model1, model2) {
    const keys1 = Object.keys(model1);
    const keys2 = Object.keys(model2);
    const allKeys = union(keys1, keys2);

    return allKeys.every(key => {
      if(model1[key] === undefined || model2[key] === undefined) {
        return false;
      } else if(isArray(model1[key])) {
        if(size(model1[key]) !== size(model2[key]) ||
          size(difference(model1[key], model2[key])) ||
          size(difference(model2[key], model1[key]))) {
          return false;
        }
      } else if(model1[key] !== model2[key]) {
        return false;
      }
      return true;
    });
  },

  unicodeUnescape(str) {
    return(unescape(str.replace(/\\u([\d\w]{4})/gi, (match, grp) => {
      return String.fromCharCode(parseInt(grp, 16));
    })));
  },

  getCaretPosition(node) {
    // If normal browser return with result
    if (typeof node.selectionStart === 'number') {
      return {
        begin: node.selectionStart,
        end: node.selectionEnd
      };
    }

    // for IE.
    const range = document.selection.createRange();

    // Determine if there is a selection
    if (range && range.parentElement() === node) {
      const inputRange = node.createTextRange();
      const endRange = node.createTextRange();
      const length = node.value.length;

      // Create a working TextRange for the input selection
      inputRange.moveToBookmark(range.getBookmark());

      // Move endRange begin pos to end pos (hence endRange)
      endRange.collapse(false);

      if (inputRange.compareEndPoints('StartToEnd', endRange) > -1) {
        return {
          begin: length,
          end: length
        };
      }

      return {
        begin: -inputRange.moveStart('character', -length),
        end: -inputRange.moveEnd('character', -length)
      };
    }

    //Return 0's on no selection data
    return {
      begin: 0,
      end: 0
    };
  },

  setCaretPosition(node, position) {
    // Normalize pos
    if (typeof position !== 'object') {
      position = {
        begin: position,
        end: position
      };
    }

    // If normal browser
    if (node.setSelectionRange) {
      node.focus();
      node.setSelectionRange(position.begin, position.end);

    // IE = TextRange fun
    } else if (node.createTextRange) {
      const range = node.createTextRange();

      range.collapse(true);
      range.moveEnd('character', position.end);
      range.moveStart('character', position.begin);
      range.select();
    }
  },

  intRound(x) {
    const pow = Math.floor(Math.log10(x));
    const divider = Math.pow(10, pow);

    return Math.round(x / divider) * divider;
  }

};

export default Helpers;
