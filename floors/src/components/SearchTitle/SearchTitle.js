/**
 * Search title widget container component
 *
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import emptyFunction from 'fbjs/lib/emptyFunction';
import {clone, difference, find, isArray, isEqual, size} from 'lodash';

import SearchTitleView from './SearchTitleView';

import mss from '../../stores/ModularSearcherStore';

/* global data */


class SearchTitle extends Component {
  static propTypes = {
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
    keepUpdated: PropTypes.string,
    layoutHeader: PropTypes.string
  };

  static childContextTypes = {
    insertCss: PropTypes.func.isRequired
  };

  getChildContext() {
    const context = this.props.context;

    return {
      insertCss: context.insertCss || emptyFunction,
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      currentCity: data.collections.cities[data.options.cityId].office ?
        (data.collections.cities[data.options.cityId].office.name_prepositional || '') : '', // eslint-disable-line max-len
      MSSactive: false,
      useMSS: false
    };
  }

  componentWillMount() {
    const {
      action_sl: action,
      allowed, // other param
      area_house_max: areaHMax, // other param
      area_house_min: areaHMin, // other param
      area_land_max: areaLMax, // other param
      area_land_min: areaLMin, // other param
      builder_id: builderId, // other param
      building_year_max: buildingYMax, // other param
      building_year_min: buildingYMin, // other param
      city_id: cityId,
      class: realtyClass,
      contract_type: contractType, // other param
      deadline_date: deadlineDate, // other param
      district_id: districtId,
      dolshik, // other param
      duration, // other param
      floor, // other param
      floors, // other param
      floor_max: floorMax, // other param
      floor_min: floorMin, // other param
      floors_max: floorsMax, // other param
      floors_min: floorsMin, // other param
      furniture, // other param
      heating, // other param
      incity, // other param
      kanalizacija, // other param
      keep, // other param
      "media->>'layouts'": mediaLayouts, // eslint-disable-line quotes
      "media->>'photos'": mediaPhotos, // eslint-disable-line quotes
      "media->>'tours'": mediaTours, // eslint-disable-line quotes
      newcomplex_id: newcomplexId, // other param
      object_id: objectId, // other param
      old_price_min: discount, // other param
      ondeadline, // other param
      price_max: priceMax, // other param
      price_min: priceMin, // other param
      rating_max: ratingMax, // other param
      rating_min: ratingMin, // other param
      renter_exist: renterExist, // other param
      rooms,
      square_kitchen_max: squareKMax, // other param
      square_kitchen_min: squareKMin, // other param
      square_max: squareMax, // other param
      square_min: squareMin, // other param
      street_id: streetId,
      survey, // other param
      tocenter_max: tocenterMax, // other param
      tocenter_min: tocenterMin, // other param
      trade_in: tradeIn, // other param
      trakt_id: traktId,
      type,
      unfinished, // other param
      waterline, // other param
      windows // other param
    } = data.objects && data.objects.request || {};
    const {class: staticClass} = data.page && data.page.staticParams || '';

    this.setState({
      action: action,
      allowed: allowed, // other param
      areaHMax: areaHMax, // other param
      areaHMin: areaHMin, // other param
      areaLMax: areaLMax, // other param
      areaLMin: areaLMin, // other param
      builderId: builderId, // other param
      buildingYMax: buildingYMax, // other param
      buildingYMin: buildingYMin, // other param
      cityId: cityId,
      contractType: contractType, // other param
      deadlineDate: deadlineDate, // other param
      discount: discount, // other param
      districtId: districtId,
      districtsByTrakts: [],
      dolshik: dolshik, // other param
      duration: duration, // other param
      floor: floor, // other param
      floors: floors, // other param
      floorMax: floorMax, // other param
      floorMin: floorMin, // other param
      floorsMax: floorsMax, // other param
      floorsMin: floorsMin, // other param
      furniture: furniture, // other param
      heating: heating, // other param
      incity: incity, // other param
      kanalizacija: kanalizacija, // other param
      keep: keep, // other param
      mediaLayouts: mediaLayouts, // eslint-disable-line quotes
      mediaPhotos: mediaPhotos, // eslint-disable-line quotes
      mediaTours: mediaTours, // eslint-disable-line quotes
      newcomplexId: newcomplexId, // other param
      objectId: objectId, // other param
      ondeadline: ondeadline, // other param
      priceMax: priceMax, // other param
      priceMin: priceMin, // other param
      ratingMax: ratingMax, // other param
      ratingMin: ratingMin, // other param
      realtyClass: realtyClass || staticClass,
      renterExist: renterExist, // other param
      rooms: rooms,
      squareKMax: squareKMax, // other param
      squareKMin: squareKMin, // other param
      squareMax: squareMax, // other param
      squareMin: squareMin, // other param
      streetId: streetId,
      survey: survey, // other param
      tocenterMax: tocenterMax, // other param
      tocenterMin: tocenterMin, // other param
      tradeIn: tradeIn, // other param
      traktId: traktId,
      type: type,
      unfinished: unfinished, // other param
      waterline: waterline, // other param
      windows: windows // other param
    });
  }

  componentDidMount() {
    mss.onChange(this.onChange);
  }

  componentWillUnmount() {
    mss.offChange(this.onChange);
  }

  shouldComponentUpdate() {
    const {keepUpdated} = this.props;

    if (!parseInt(keepUpdated)) {
      return false;
    }

    return true;
  }

  onChange = () => {
    const {
      action_sl: action,
      allowed, // other param
      area_house_max: areaHMax, // other param
      area_house_min: areaHMin, // other param
      area_land_max: areaLMax, // other param
      area_land_min: areaLMin, // other param
      builder_id: builderId, // other param
      building_year_max: buildingYMax, // other param
      building_year_min: buildingYMin, // other param
      city_id: cityId,
      class: realtyClass,
      collections: {
        districtsByTrakts
      },
      contract_type: contractType, // other param
      deadline_date: deadlineDate, // other param
      district_id: districtId,
      dolshik, // other param
      duration, // other param
      floor, // other param
      floors, // other param
      floor_max: floorMax, // other param
      floor_min: floorMin, // other param
      floors_max: floorsMax, // other param
      floors_min: floorsMin, // other param
      furniture, // other param
      heating, // other param
      incity, // other param
      kanalizacija, // other param
      keep, // other param
      "media->>'layouts'": mediaLayouts, // eslint-disable-line quotes
      "media->>'photos'": mediaPhotos, // eslint-disable-line quotes
      "media->>'tours'": mediaTours, // eslint-disable-line quotes
      newcomplex_id: newcomplexId, // other param
      object_id: objectId, // other param
      old_price_min: discount, // other param
      ondeadline, // other param
      price_max: priceMax, // other param
      price_min: priceMin, // other param
      rating_max: ratingMax, // other param
      rating_min: ratingMin, // other param
      renter_exist: renterExist, // other param
      rooms,
      square_kitchen_max: squareKMax, // other param
      square_kitchen_min: squareKMin, // other param
      square_max: squareMax, // other param
      square_min: squareMin, // other param
      street_id: streetId,
      survey, // other param
      tocenter_max: tocenterMax, // other param
      tocenter_min: tocenterMin, // other param
      trade_in: tradeIn, // other param
      trakt_id: traktId,
      type,
      unfinished, // other param
      waterline, // other param
      windows // other param
    } = mss.get();

    this.setState({
      action: action,
      allowed: allowed, // other param
      areaHMax: areaHMax, // other param
      areaHMin: areaHMin, // other param
      areaLMax: areaLMax, // other param
      areaLMin: areaLMin, // other param
      builderId: builderId, // other param
      buildingYMax: buildingYMax, // other param
      buildingYMin: buildingYMin, // other param
      cityId: cityId,
      districtsByTrakts: districtsByTrakts,
      contractType: contractType, // other param
      deadlineDate: deadlineDate, // other param
      discount: discount, // other param
      districtId: districtId,
      dolshik: dolshik, // other param
      duration: duration, // other param
      floor: floor, // other param
      floors: floors, // other param
      floorMax: floorMax, // other param
      floorMin: floorMin, // other param
      floorsMax: floorsMax, // other param
      floorsMin: floorsMin, // other param
      furniture: furniture, // other param
      heating: heating, // other param
      incity: incity, // other param
      kanalizacija: kanalizacija, // other param
      keep: keep, // other param
      mediaLayouts: mediaLayouts, // eslint-disable-line quotes
      mediaPhotos: mediaPhotos, // eslint-disable-line quotes
      mediaTours: mediaTours, // eslint-disable-line quotes
      MSSactive: true,
      newcomplexId: newcomplexId, // other param
      objectId: objectId, // other param
      ondeadline: ondeadline, // other param
      priceMax: priceMax, // other param
      priceMin: priceMin, // other param
      ratingMax: ratingMax, // other param
      ratingMin: ratingMin, // other param
      realtyClass: realtyClass,
      renterExist: renterExist, // other param
      rooms: rooms,
      squareKMax: squareKMax, // other param
      squareKMin: squareKMin, // other param
      squareMax: squareMax, // other param
      squareMin: squareMin, // other param
      streetId: streetId,
      survey: survey, // other param
      tocenterMax: tocenterMax, // other param
      tocenterMin: tocenterMin, // other param
      tradeIn: tradeIn, // other param
      traktId: traktId,
      type: type,
      unfinished: unfinished, // other param
      waterline: waterline, // other param
      windows: windows // other param
    });
  }

  specialRealtyType = (realtyClass, specialType) => {
    const {
      currentCity,
    } =  this.state;

    specialType = specialType === 'land' &&
     realtyClass === 'cottages' ?
      'land_out' :
      specialType;

    const specialTypesHeader = data.seo.layoutHeader.typesRealtyOut[specialType]; // eslint-disable-line max-len
    const city = currentCity ?
      ` в ${currentCity}` :
      '';
    const trArr = {
      'chetirehkomnatnye-kvartiry': {
        flats: 'Четырехкомнатные квартиры: вторичное жилье',
        rent: `Снять четырехкомнатную квартиру${city}`,
        'nh_flats': 'Четырехкомнатные квартиры от застройщика'
      },
      'dvuhkomnatnye-kvartiry': {
        flats: 'Двухкомнатные квартиры: вторичное жилье',
        rent: `Снять двухкомнатную квартиру${city}`,
        'nh_flats': 'Двухкомнатные квартиры от застройщика'
      },
      'odnokomnatnye-kvartiry': {
        flats: 'Однокомнатные квартиры: вторичное жилье',
        rent: `Снять однокомнатную квартиру${city}`,
        'nh_flats': 'Однокомнатные квартиры от застройщика'
      },
      'pansionaty': {
        flats: 'Малосемейки, пансионаты, общежития',
        rent: 'Пансионаты'
      },
      'trehkomnatnye-kvartiry': {
        flats: 'Трехкомнатные квартиры: вторичное жилье',
        rent: `Снять трехкомнатную квартиру${city}`,
        'nh_flats': 'Трехкомнатные квартиры от застройщика'
      }
    };
    const res = specialTypesHeader ?
      specialTypesHeader :
      (trArr[specialType] ?
        trArr[specialType][realtyClass] :
        '');

    return res;
  }

  get getHeader() {
    const {
      action,
      allowed,
      areaHMax,
      areaHMin,
      areaLMax,
      areaLMin,
      builderId,
      buildingYMax,
      buildingYMin,
      cityId,
      districtsByTrakts,
      contractType,
      deadlineDate,
      discount,
      districtId,
      dolshik,
      duration,
      floor,
      floors,
      floorMax,
      floorMin,
      floorsMax,
      floorsMin,
      furniture,
      heating,
      incity,
      kanalizacija,
      keep,
      mediaLayouts,
      mediaPhotos,
      mediaTours,
      MSSactive,
      newcomplexId,
      objectId,
      ondeadline,
      priceMax,
      priceMin,
      ratingMax,
      ratingMin,
      realtyClass,
      renterExist,
      rooms,
      squareKMax,
      squareKMin,
      squareMax,
      squareMin,
      streetId,
      survey,
      tocenterMax,
      tocenterMin,
      tradeIn,
      traktId,
      type,
      unfinished,
      waterline,
      windows
    } = this.state;
    let sortedType = clone(type);
    const sortedPansionType = ['pansion', 'malosem', 'obshaga', 'room'];

    sortedType && Array.isArray(sortedType) && sortedType.sort();
    sortedPansionType.sort();

    const pansionSelected = isEqual(sortedType, sortedPansionType) ?
      true :
      false;
    let actualCityId = '';

    sortedType = !size(sortedType) && realtyClass === 'nh_flats' ?
     ['flat'] :
     sortedType;

    if (cityId) {
      actualCityId = Array.isArray(cityId) ?
       size(cityId) === 1 && cityId[0] :
       cityId;
    }

    actualCityId = parseInt(actualCityId);

    const defaultCity = actualCityId === data.options.cityId ||
     isNaN(actualCityId);
    let specialType = Array.isArray(sortedType) ?
     (size(sortedType) === 1 ?
      sortedType[0] :
      '') :
     sortedType;
    let specialTypeSelected = false;
    let showTrakt = false;
    let showDistrict = false;

    if (size(traktId) === 1 && (!MSSactive || (MSSactive &&
     !size(difference(districtsByTrakts[traktId[0]], districtId))))) {
      showTrakt = true;
    }
    if (size(districtId) === 1) {
      showDistrict = true;
    }

    if ((sortedType === 'flat' || (size(sortedType) === 1 &&
     sortedType[0] === 'flat')) && size(rooms) === 1) {
      switch (rooms[0]) {
      case '1':
        specialType = 'odnokomnatnye-kvartiry';
        break;
      case '2':
        specialType = 'dvuhkomnatnye-kvartiry';
        break;
      case '3':
        specialType = 'trehkomnatnye-kvartiry';
        break;
      case '>4':
        specialType = 'chetirehkomnatnye-kvartiry';
        break;
      default:
        // do nothing
      }
    }
    specialType = pansionSelected ? 'pansionaty' : specialType;

    const otherParams = size(allowed) || areaHMax || areaHMin || areaLMax ||
     areaLMin || size(builderId) || buildingYMax || buildingYMin ||
     size(contractType) || size(deadlineDate) || size(discount) ||
     size(dolshik) || size(duration) || floor || floors || floorMax ||
     floorMin || floorsMax || floorsMin || size(furniture) || size(heating) ||
     incity || size(kanalizacija) || size(keep) || size(newcomplexId) ||
     mediaLayouts || mediaPhotos || mediaTours || size(objectId) ||
     size(ondeadline) || priceMax || priceMin || ratingMax || ratingMin ||
     renterExist || squareKMax || squareKMin || squareMax || squareMin ||
     size(survey) || tocenterMax || tocenterMin || size(tradeIn) ||
     size(unfinished) || size(waterline) || size(windows) ?
      true :
      false;
    let nonEmptyMSS = false;

    nonEmptyMSS = size(action) || (actualCityId && !defaultCity) ||
     showDistrict || size(rooms) || size(streetId) || showTrakt ||
     size(sortedType) || otherParams ?
      true :
      false;
    specialTypeSelected = ((size(rooms) === 1 && size(sortedType) === 1) ||
     pansionSelected) && !otherParams && defaultCity && !size(action) &&
     !showDistrict && !size(streetId) && !showTrakt ?
      true :
      false;

    const resAction = size(action) ? action : null;
    const resCityId = actualCityId && !defaultCity ? actualCityId : null;
    const resDistrictId = showDistrict ? parseInt(districtId) : null;
    const resRooms = size(rooms) === 1 ? rooms[0] : null;
    const resStreetId = size(streetId) === 1 ? parseInt(streetId) : null;
    const resTraktId = showTrakt ? parseInt(traktId) : null;
    const resType = realtyClass === 'nh_flats' ?
      'flat' :
      (pansionSelected ?
        'pansion' :
        (size(sortedType) === 1 ?
          sortedType[0] :
          null));
    const useMSS = MSSactive && (nonEmptyMSS || useMSS);
    const req = data.page.request || data.page.requestSingleParams;
    // это для того чтобы корректно работала кнопка сброса параметров новой выдачи в аренде, т.к. она сбрасывает на /search/...
    const modReq = realtyClass === 'offices' && !size(req) ? {
      action_sl: data.objects && data.objects.request && // eslint-disable-line camelcase
       data.objects.request.action_sl || {}
    } :
    req;
    const seoLayoutHeader = data.seo.layoutHeader;
    let room = '', headerType = '', city = '', district = '', trakt = '',
      street = '', headerAction = '';
    let res = [];

    if (size(modReq) || useMSS) {
      const {cities, districts, streets, trakts} = data.collections;
      const typeName = isArray(resType) ?
        resType[0] :
        resType;
      const districtData = find(districts, {id: resDistrictId});
      const streetData = find(streets, {id: resStreetId});
      const cityData = find(cities, {id: resCityId});
      const traktData = find(trakts, {id: resTraktId});

      if (realtyClass === 'offices') {
        const actionName = isArray(resAction) ?
          resAction[0] :
          resAction;

        headerAction = actionName === 'sale' ?
          'Покупка' :
          'Аренда';
        res.push(headerAction);
      }

      if (resRooms && typeName === 'flat') {
        room = seoLayoutHeader.rooms[resRooms][realtyClass];
        res.push(`${room}:`);
      }

      if (typeName && !resRooms && typeName !== 'flat') {
        const actualTypeName =
         !(realtyClass === 'cottages' && typeName === 'land') ?
          typeName :
          'land_out';

        headerType = seoLayoutHeader.typesRealtyOut[actualTypeName];
        headerType && res.push(`${headerType}:`);
      }

      if (!room && !headerType) {
        headerType = seoLayoutHeader.defaults[realtyClass];
        headerType && res.push(`${headerType}:`);
      }

      // city
      if (cityData) {
        city = `г. ${cityData.name}`;
        res.push(`${city},`);
      }

      // district
      if (districtData) {
        district = `район ${districtData.name}`;
        res.push(`${district},`);
      }

      // trakt
      if (traktData) {
        const cityName = find(cities,
          {id: resCityId ? resCityId : data.options.cityId}).name;

        if (cityName === traktData.name) {
          trakt = 'в черте города';
        } else {
          trakt = `${traktData.name}`;
        }

        res.push(`${trakt},`);
      }

      // street
      if (streetData) {
        street = `улица ${streetData.name}`;
        res.push(street);
      }
    }

    const specialRealtyType = this.specialRealtyType(realtyClass, specialType);

    res = size(res) && !specialTypeSelected ?
      res.join(' ') :
      '';

    res = res ?
      (res[size(res) - 1] === ',' || res[size(res) - 1] === ':' ?
        res.slice(0, -1) :
        res) :
      (specialRealtyType ?
        specialRealtyType :
        seoLayoutHeader.defaults[realtyClass]);

    return res;
  };

  render() {
    const {layoutHeader} = this.props;
    const header = layoutHeader ?
      layoutHeader :
      this.getHeader;

    return (
      <SearchTitleView
       header={header}
       {...this.props} />
    );
  }
}

export default SearchTitle;
