import {isArray, find, size, difference, invert} from 'lodash';

const SeoHelpers = {
  getLayoutHeader(realtyType) {
    /* global data */
    const req = data.page.request || data.page.requestSingleParams;
    const seoLayoutHeader = data.seo.layoutHeader;
    let room = '', type = '', city = '', district = '', trakt = '',
      street = '', action = '';

    if (req) {
      const cities = data.collections.cities;
      const trakts = data.collections.trakts;
      const districts = data.collections.districts;
      const streets = data.collections.streets;

      if (realtyType === 'offices') {
        if (isArray(req.action_sl) && !(req.action_sl.length > 1)) {
          const actionSl = isArray(req.action_sl) &&
            req.action_sl.length === 1 ? req.action_sl[0] : req.action_sl;

          action = actionSl === 'sale' ? 'Покупка' : 'Аренда';
        }
      }

      const rooms = req.rooms;
      const typeName = isArray(req.type) ?
        req.type[0] : req.type;

      if (rooms && typeName === 'flat') {
        room = seoLayoutHeader.rooms[rooms][realtyType];
      }
      if (typeName && !rooms && typeName !== 'flat') {
        type = seoLayoutHeader.typesRealtyOut[typeName];
      }

      if (!room && !type) {
        type = seoLayoutHeader.defaults[realtyType];
      }

      // district
      const districtId = parseInt(req.district_id);
      const districtData = find(districts, {id: districtId});

      if (districtData) {
        district = `район ${districtData.name}`;
      }
      // street
      const streetId = parseInt(req.street_id);
      const streetData = find(streets, {id: streetId});

      if (streetData) {
        street = `улица ${streetData.name}`;
      }
      // city
      const cityId = parseInt(req.city_id);
      const cityData = find(cities, {id: cityId});

      if (cityData) {
        city = `г. ${cityData.name}`;
      }

      // trakt
      const traktId = parseInt(req.trakt_id);
      const traktData = find(trakts, {id: traktId});

      if (traktData) {
        const cityName = find(cities,
          {id: cityId ? cityId : data.options.cityId}).name;

        if (cityName === traktData.name) {
          trakt = 'в черте города';
        } else {
          trakt = `${traktData.name}`;
        }
      }


    }
    if (action || room || type || city || district || trakt || street) {
      return `${action} ${room} ${type} ${city} ${district} ${trakt} ${street}`;
    } else {
      return seoLayoutHeader.defaults[realtyType];
    }
  },

  getType(rooms, key, type = false) {
    const argsRooms = {
      1: {
        'ru': 'Однокомнатные квартиры',
        'tr': 'odnokomnatnye-kvartiry'
      },
      2: {
        'ru': 'Двухкомнатные квартиры',
        'tr': 'dvuhkomnatnye-kvartiry'
      },
      3: {
        'ru': 'Трехкомнатные квартиры',
        'tr': 'trehkomnatnye-kvartiry'
      },
      4: {
        'ru': 'Четырехкомнатные квартиры',
        'tr': 'chetirehkomnatnye-kvartiry'
      }
    };

    const argsTypes = {
      'land': {
        'ru': 'Земельные участки',
        'tr': 'zemelnye-uchastki'
      },
      'house': {
        'ru': 'Дома',
        'tr': 'doma'
      },
      'townhouse': {
        'ru': 'Таунхаусы',
        'tr': 'taunhausy'
      },
      'garden': {
        'ru': 'Дачи',
        'tr': 'dachnye-uchastki'
      },
      'cottage': {
        'ru': 'Коттеджи',
        'tr': 'cottage'
      },
      'pansion': {
        'ru': 'Пансионаты',
        'tr': 'pansionaty'
      },
      'dev_land': {
        'ru': 'Земля под производство',
        'tr': 'zemlya'
      },
      'base': {
        'ru': 'Базы',
        'tr': 'bazy'
      },
      'dev': {
        'ru': 'Производство',
        'tr': 'proizvodstvo'
      },
      'busines': {
        'ru': 'Готовый бизнес',
        'tr': 'gotovyjj-biznes'
      },
      'office': {
        'ru': 'Офисы',
        'tr': 'ofis'
      },
      'torg': {
        'ru': 'Торговые помещения',
        'tr': 'torgovye-pomeshheniya'
      },
      'sklad': {
        'ru': 'Склады',
        'tr': 'sklad'
      },
      'other': {
        'ru': 'Свободное назначение',
        'tr': 'svobodnoe-naznachenie'
      },
      'ferma': {
        'ru': 'Фермы',
        'tr': 'ferma'
      },
      'garage': {
        'ru': 'Гаражи',
        'tr': 'garazh'
      }
    };

    type = isArray(type) ? type[0] : type;
    if (rooms && type === 'flat') {
      rooms = rooms >= 4 || rooms.toString() === '>4' ? 4 : rooms;
      return argsRooms[rooms][key];
    } else if (type && type !== 'flat' && argsTypes[type]) {
      return argsTypes[type][key];
    }
    return '';
  },

  checkQueryParams(query) {
    const needParams = ['district_id', 'street_id', 'rooms', 'city_id', 'array',
      'ondeadline', 'type', 'trakt_id', 'or', 'deadline_date', 'action_sl'];
      // TODO: поместить служебные параметры в один массив
    const params = ['class', 'order', 'count', 'count_houses', 'array',
      'isLoading', 'date_create_min', 'collections', 'action_sl', 'type',
      'currentPage', 'perPage', 'pageNum', 'offset', 'layoutType', 'countAll',
      'realtyType', 'countMonth', 'countWeek', 'countDay', 'limits', 'city_id'];

    for (const param in query) {
      if (!isArray(query[param]) && params.indexOf(param) === -1) {
        return false;
      }
      if (needParams.indexOf(param) === -1) {
        if (isArray(query[param]) && size(query[param]) > 0) {
          return false;
        }
      }
    }
    return true;
  },

  getSeoUrl(query) {
    /* global data */
    let types = query.type || [];
    const realtyType = query.class;
    const rooms = query.rooms;
    const trakts = query.trakt_id;
    const deadlineDates = query.deadline_date;
    const districts = query.district_id;
    const streets = query.street_id;
    const cities = query.city_id;
    const actions = isArray(query.action_sl) ?
      query.action_sl : [query.action_sl];
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    const isRealty = realtyType === 'flats';
    const isZastr = realtyType === 'nh_flats';
    const isRealtyOut = realtyType === 'cottages';
    const isRealtyRent = realtyType === 'rent';
    const isCommerce = realtyType === 'offices';
    const onlyNeedParams = this.checkQueryParams(query);
    const needRedirect = onlyNeedParams &&
      (isRealty || isZastr || isRealtyOut || isRealtyRent || isCommerce) &&
      (typeof(data) !== 'undefined') &&
      data.seo.redirects;

    if (isRealty && size(rooms) === 1 && size(types) === 0) {
      types.push('flat');
    }
    if (needRedirect) {
      if (size(trakts) > 1 || size(streets) > 1 || size(rooms) > 1 ||
      size(actions) > 1 || (!isRealtyOut && size(districts) > 1) ||
      (!isRealty && !isRealtyRent && size(types) > 1) || ((isRealtyRent ||
      isRealty) && ((size(rooms) === 1 && types.toString() !== 'flat'))) ||
      (isArray(cities) && size(cities) > 1)) {
        return '';
      }

      let realtyPage;
      let action = '',
        room = '',
        city = '',
        district = '',
        street = '',
        type = '',
        trakt = '',
        ondeadline = '',
        deadlineDate = '';

      switch (realtyType) {
      case 'flats':
        realtyPage = 'realty';
        break;
      case 'nh_flats':
        realtyPage = 'zastr';
        break;
      case 'rent':
        realtyPage = 'realty_rent';
        break;
      case 'cottages':
        realtyPage = 'realty_out';
        break;
      case 'offices':
        realtyPage = 'commerce';
        break;
      default:
        break;
      }

      if (isRealty && size(types) === 0 && size(rooms) !== 1 &&
      size(districts) !== 1 && size(streets) !== 1 &&
      cities === undefined) {
        return `${protocol}//${host}/realty/vtorichnoe/`;
      }

      if (isCommerce && size(actions) === 1) {
        action = actions.toString() === 'sale' ? 'pokupka/' : 'arenda/';
      }

      if ((isRealty && types !== undefined && size(types) &&
      !size(difference(['pansion', 'obshaga', 'malosem', 'room'], types))) ||
      (isRealtyRent && size(rooms) === 0 && types !== undefined &&
      size(types) === 4 &&
        !size(difference(['pansion', 'obshaga', 'malosem', 'room'], types)))) {
        type = 'pansionaty/';
      }

      if (size(rooms) === 1 &&
      ((isRealty && size(types) === 1 &&
      types.toString() === 'flat' &&
      (['1', '2', '3', '>4']).indexOf(rooms.toString()) !== -1) ||
      (isZastr && size(types) === 0) ||
      isRealtyRent)) {
        types = isZastr ? 'flat' : types;
        room = `${this.getType(rooms, 'tr', types)}/`;
      }

      if (cities !== undefined && size(cities) !== 0 &&
      parseInt(cities) !== parseInt(data.options.cityId)) {
        if (data.collections.cities && data.collections.cities[cities] &&
          data.options.associated_cities.match(cities)) {
          city = `g-${data.collections.cities[cities].name_tr}/`;
        } else {
          return '';
        }
      }

      if (size(districts) === 1 && data.collections.districts &&
      data.collections.districts[districts]) {
        district = `r-${data.collections.districts[districts].name_tr}/`;
      }

      if (isCommerce || isRealtyOut) {
        if (size(types) === 1 && data.seo.types) {
          const seoType = invert(data.seo.types[realtyPage])[types[0]];

          if (seoType) {
            type = `${seoType}/`;
          } else {
            return '';
          }
        }
      }

      if (!isRealtyOut) {
        if (size(streets) === 1 && data.collections.streets &&
        data.collections.streets[streets]) {
          street = `u-${data.collections.streets[streets].name_tr}/`;
        }

      } else {
        const districtsByTrakts = query.collections ?
          query.collections.districtsByTrakts : false;

        if (size(trakts) === 1 && data.collections.trakts &&
        data.collections.trakts[trakts] && size(districts) !== 1 &&
        size(districts) !== size(districtsByTrakts[trakts])) {
          return '';
        }

        if (size(trakts) === 1 && size(districts) !== 1 &&
        data.collections.trakts && data.collections.trakts[trakts] &&
        size(districts) === size(districtsByTrakts[trakts])) {
          trakt = `t-${data.collections.trakts[trakts].name_tr}/`;
        }
      }

      if (isZastr) {
        if (query.ondeadline && size(query.ondeadline) === 1) {
          ondeadline = 'dom-sdan/';
        }
        if (deadlineDates !== undefined) {
          if (size(deadlineDates) > 1) {
            return '';
          }
          if (size(deadlineDates) === 1) {
            deadlineDate = `${deadlineDates[0]}/`;
          }
        }
      }

      if (action || room || city || district || street || type || trakt ||
      ondeadline || deadlineDate) {
        return `${protocol}//${host}/${realtyPage}/${action}${room}${type}${city}${trakt}${district}${street}${deadlineDate}${ondeadline}`; //eslint-disable-line max-len
      }
    }
    return '';
  },
  getAddress(district, street, houseNum, cottages = false) {
    let title = '';

    if(district && district !== '0' && cottages) {
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
  }
};

export default SeoHelpers;
