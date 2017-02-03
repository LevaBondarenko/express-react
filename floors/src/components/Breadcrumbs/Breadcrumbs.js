/**
 * Breadcrumbs widget container component
 *
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react';
import emptyFunction from 'fbjs/lib/emptyFunction';
import {getType, getAddress} from '../../utils/seoHelpers';
import {getTitle, cutText} from '../../utils/Helpers';
import {clone, difference, isEqual, map, size} from 'lodash';

import bs from '../../stores/BlogStore';
import mss from '../../stores/ModularSearcherStore';

import BreadcrumbsView from './BreadcrumbsView';

// import prefetch from 'react-wildcat-prefetch';

/* global data */
// @prefetch(() => Promise.resolve(data.blog.blogpost))
class Breadcrumbs extends Component {
  static propTypes = {
    ancestors: PropTypes.array,
    builderName: PropTypes.string,
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
    keepUpdated: PropTypes.string,
    mainTitle: PropTypes.string,
    posts: PropTypes.array,
    userTitle: PropTypes.string,
    wpTitle: PropTypes.string
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
      ancestors: props.ancestors || [],
      builderName: props.builderName || '',
      currentPageTitle: props.userTitle || props.wpTitle,
      defaultCity: true,
      hasCitySelector: false,
      keepUpdated: parseInt(props.keepUpdated) ? true : false,
      mainTitle: props.mainTitle || 'Главная',
      useMSS: false
    };
  }

  componentWillMount() {
    const {associated_cities: assocCities} = data.options;
    const model = data.page.request || data.page.requestSingleParams;
    const object = data.object && data.object.info || model;
    const bank = data.redux && data.redux.mortgage &&
      data.redux.mortgage.bank || null;
    const program = data.redux && data.redux.mortgage &&
      data.redux.mortgage.program && data.redux.mortgage.program.info ?
        true : false;
    const linkedCities = assocCities ? assocCities.split(',') : [];
    const {
      allowed, // other param
      area_house_max: areaHMax, // other param
      area_house_min: areaHMin, // other param
      area_land_max: areaLMax, // other param
      area_land_min: areaLMin, // other param
      builder_id: builderId, // other param
      building_year_max: buildingYMax, // other param
      building_year_min: buildingYMin, // other param
      city_id: cityId,
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
    const sortedType = clone(type);
    const sortedPansionType = ['pansion', 'malosem', 'obshaga', 'room'];
    let showTrakt = false;

    sortedType && Array.isArray(sortedType) && sortedType.sort();
    sortedPansionType.sort();

    const pansionSelected = isEqual(sortedType, sortedPansionType) &&
     !size(rooms) ?
      true :
      false;

    if (size(traktId) === 1 && !size(districtId)) {
      showTrakt = true;
    }

    const multipleDataParamSearch = (size(cityId) > 1 &&
     Array.isArray(cityId)) || (size(districtId) > 1 && !showTrakt) ||
     size(rooms) > 1 || size(streetId) > 1 || size(traktId) > 1 ||
     (size(type) > 1 && !pansionSelected) ?
      true :
      false;
    const otherDataParams = size(allowed) || areaHMax || areaHMin || areaLMax ||
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

    this.setState({
      linkedCities: linkedCities,
      bank: bank,
      model: model,
      multipleDataParamSearch: multipleDataParamSearch,
      object: object,
      otherDataParams: otherDataParams,
      program: program
    });
  }

  componentDidMount() {
    bs.onChange(this.onChange);
    mss.onChange(this.onMSSChange);
  }

  componentWillUnmount() {
    bs.offChange(this.onChange);
    mss.offChange(this.onMSSChange);
  }

  onChange = () => {
    const posts = bs.get('posts');

    this.setState({
      posts: posts
    });
  }

  onMSSChange = () => {
    const {keepUpdated, useMSS} = this.state;
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
    const sortedType = clone(type);
    const sortedPansionType = ['pansion', 'malosem', 'obshaga', 'room'];
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
    const defaultCity = (size(cityId) === 1 &&
     parseInt(cityId[0]) === data.options.cityId) ||
     parseInt(cityId) === data.options.cityId ?
      true :
      false;
    let multipleParamSearch = false;
    let nonEmptyMSS = false;
    let showTrakt = false;
    let showDistrict = false;

    sortedType && Array.isArray(sortedType) && sortedType.sort();
    sortedPansionType.sort();

    const pansionSelected = isEqual(sortedType, sortedPansionType) ?
      true :
      false;

    if (size(traktId) === 1 &&
     !size(difference(districtsByTrakts[traktId[0]], districtId))) {
      showTrakt = true;
    }
    if (size(districtId) === 1) {
      showDistrict = true;
    }

    multipleParamSearch = (size(cityId) > 1 && Array.isArray(cityId)) ||
     (size(districtId) > 1 && !showTrakt) || size(rooms) > 1 ||
     size(streetId) > 1 || size(traktId) > 1 ||
     (size(type) > 1 && !pansionSelected) ?
      true :
      false;
    nonEmptyMSS = size(action) || (size(cityId) && !defaultCity) ||
     showDistrict || size(rooms) || size(streetId) || showTrakt || size(type) ||
     otherParams ?
      true :
      false;

    this.setState({
      defaultCity: defaultCity,
      hasCitySelector: cityId ? true : false,
      msAction: size(action) ? action : null,
      msCityId: size(cityId) ? cityId : null,
      msDistrictId: showDistrict ? districtId : null,
      msRealtyClass: realtyClass,
      msRooms: size(rooms) === 1 ? rooms[0] : null,
      msStreetId: size(streetId) === 1 ? streetId : null,
      msTraktId: showTrakt ? traktId : null,
      msType: realtyClass === 'nh_flats' ?
        'flat' :
        (pansionSelected ?
          'pansion' :
          (size(type) === 1 ?
            type[0] :
            null)),
      multipleParamSearch: multipleParamSearch,
      nonEmptyMSS: nonEmptyMSS,
      otherParams: otherParams,
      useMSS: (nonEmptyMSS || useMSS) && keepUpdated ?
        true :
        false
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const {
      defaultCity,
      hasCitySelector,
      msAction,
      msCityId,
      msDistrictId,
      msRooms,
      msStreetId,
      msTraktId,
      msType,
      multipleParamSearch,
      nonEmptyMSS,
      otherParams,
      posts,
      useMSS
    } = this.state;
    const {
      defaultCity: defaultCityNext,
      hasCitySelector: hasCitySelectorNext,
      msAction: msActionNext,
      msCityId: msCityIdNext,
      msDistrictId: msDistrictIdNext,
      msRooms: msRoomsNext,
      msStreetId: msStreetIdNext,
      msTraktId: msTraktIdNext,
      msType: msTypeNext,
      multipleParamSearch: multipleParamSearchNext,
      nonEmptyMSS: nonEmptyMSSNext,
      otherParams: otherParamsNext,
      posts: postsNext,
      useMSS: useMSSNext
    } = nextState;

    if (defaultCity === defaultCityNext &&
     hasCitySelector === hasCitySelectorNext && msAction === msActionNext &&
     msCityId === msCityIdNext && msDistrictId === msDistrictIdNext &&
     msRooms === msRoomsNext && msStreetId === msStreetIdNext &&
     msTraktId === msTraktIdNext && msType === msTypeNext &&
     multipleParamSearch === multipleParamSearchNext &&
     nonEmptyMSS === nonEmptyMSSNext && otherParams === otherParamsNext &&
     posts === postsNext && useMSS === useMSSNext) {
      return false;
    }

    return true;
  }

  get breadcrumbsData() {
    const {
      ancestors,
      bank,
      builderName,
      currentPageTitle,
      defaultCity,
      hasCitySelector,
      linkedCities,
      mainTitle,
      model,
      msAction,
      msCityId,
      msDistrictId,
      msRealtyClass,
      msRooms,
      msStreetId,
      msTraktId,
      msType,
      multipleDataParamSearch,
      multipleParamSearch,
      nonEmptyMSS,
      object,
      otherDataParams,
      otherParams,
      posts,
      program,
      useMSS
    } = this.state;
    const {category} = data.blog || {};
    const {defaults, searchDefaults} = data.seo.layoutHeader || {};
    const {class: requestClass} = data.objects && data.objects.request ||
     data.page && data.page.staticParams || '';
    const {
      category: blogpostCategory,
      categoryTr,
      title: bpstTitle,
      blogpostId
    } = data.blog && data.blog.blogpost || {};
    const blogCategoryTr = category ?
      category :
      categoryTr;
    const blogCategory = size(posts) && category && blogCategoryTr ?
      posts[0].categories[posts[0].categories_tr.indexOf(blogCategoryTr)] :
      blogpostCategory;
    const blogPostTitle = size(posts) && blogpostId ?
      posts[0].post_title :
      bpstTitle;
    const breadcrumbsArr = [];
    let title = searchDefaults && useMSS && nonEmptyMSS &&
     (multipleParamSearch || otherParams) ?
      searchDefaults[msRealtyClass] :
      searchDefaults[requestClass];
    let paramsCount = 0;
    let href = '';
    let hrefType = '';
    let deleteLastBC = false;
    let realtyObject = false;
    let specialRoomedCases = false;

    breadcrumbsArr.push({
      href: '/',
      title: mainTitle
    });

    map(ancestors, (ancestor) => {
      ancestor && breadcrumbsArr.push(ancestor);
    });

    const realtyRent = breadcrumbsArr[size(breadcrumbsArr) - 1]
     .href.indexOf('/realty_rent/') !== -1;

    href = breadcrumbsArr[size(breadcrumbsArr) - 1]
     .href.replace('jk/', '');

    if (size(object) || useMSS) { // Когда недвижимость
      const info = object.info ?
        object.info :
        object;
      const {
        action_sl: infoAction,
        city_id: cityId,
        class: infoClass,
        district_id: districtId,
        rooms: infoRooms,
        street_id: streetId,
        trakt_id: traktId,
        type: infoType
      } = info;
      const rooms = useMSS ?
        msRooms :
        (infoRooms ?
          (infoRooms.toString() === '>4' ?
            4 :
            parseInt(infoRooms)) :
          '');
      const type = useMSS ?
        msType :
        (infoType ?
          (Array.isArray(infoType) ?
            infoType[0] :
            infoType) :
          (requestClass === 'nh_flats' ?
            'flat' :
            ''));
      const name = getType(rooms, 'ru', type);
      const action = useMSS ?
        (Array.isArray(msAction) ?
          msAction[0] :
          msAction) :
        (infoAction ?
          (Array.isArray(infoAction) ?
            infoAction[0] :
            infoAction) :
          '');
      const infoCityId = useMSS ?
        (Array.isArray(msCityId) ?
          (size(msCityId) === 1 ?
            msCityId[0] :
            null) :
          msCityId) :
        cityId;
      const infoDistrictId = useMSS ? msDistrictId : districtId;
      const infoStreetId = useMSS ? msStreetId : streetId;
      const infoTraktId = useMSS ? msTraktId : traktId;
      const city = infoCityId && parseInt(infoCityId) !== data.options.cityId ?
        data.collections.cities[parseInt(infoCityId)] :
        null;

      if (city) { // Если другой город
        const actualCityId = Array.isArray(infoCityId) ?
          infoCityId[0] :
          infoCityId;

        if (size(linkedCities) &&
         linkedCities.indexOf(actualCityId.toString()) !== -1) {
          href = `${href}g-${city.name_tr}/`;

          const item = {
            href: href,
            title: city.name
          };

          breadcrumbsArr.push(item);
          paramsCount++;
        }
      }

      if (action) { // Если есть выбор аренда или покупка
        href = `${href}${action === 'sale' ? 'pokupka' : 'arenda'}/`;
        const actionName = action === 'sale' ? 'Купить' : 'Снять';
        const item = {
          href: href,
          title: actionName
        };

        breadcrumbsArr.push(item);
        paramsCount++;
      }

      if (rooms || type) { // Количество комнат или тип
        const typeTr = getType(rooms, 'tr', type);

        if (typeTr) {
          hrefType = `${href}${typeTr}/`;
          const item = {
            href: hrefType,
            title: name
          };

          breadcrumbsArr.push(item);
          paramsCount++;
        }
      }

      href = !realtyRent && hrefType ?
        hrefType :
        href;

      if (data.collections.trakts && infoTraktId) {
        const trakt = data.collections.trakts[parseInt(infoTraktId)];

        if (trakt && !infoDistrictId) {
          const hrefTrakt = `${href}t-${trakt.name_tr}/`;
          const item = {
            href: hrefTrakt,
            title: trakt.name
          };

          breadcrumbsArr.push(item);
          paramsCount++;
        }
      }

      if (data.collections.districts && infoDistrictId) {
        const district = data.collections.districts[parseInt(infoDistrictId)];

        if (district && (!size(model) || (!infoTraktId || (infoTraktId &&
         district.trakt_id === parseInt(infoTraktId))))) {
          const hrefD = `${href}r-${district.name_tr}/`;
          const item = {
            href: hrefD,
            title: district.name
          };

          breadcrumbsArr.push(item);
          paramsCount++;
        }
      }

      if(data.collections.streets && infoStreetId && infoClass !== 'cottages') {
        const street = data.collections.streets[parseInt(infoStreetId)];

        if (street) {
          const hrefSt = `${href}u-${street.name_tr}/`;
          const item = {
            href: hrefSt,
            title: street.name
          };

          breadcrumbsArr.push(item);
          paramsCount++;
        }
      }

      if (object.info) {
        title = object.info.gp_short ?
          object.info.gp_short :
          object.info.gp;
        realtyObject = true;
      } else if (!size(model) && !useMSS) {
        const objectType = getTitle(info.rooms, info.type_ru);
        const needDistrict = infoClass === 'cottages' ?
          true :
          false;
        const address = getAddress(info.district, info.street, info.house_num, needDistrict); // eslint-disable-line max-len

        title = `${objectType}, ${address}`;
        realtyObject = true;
      }

      // Когда в Аренде с выбором пансионатов и комнат одновременно ИЛИ во вторичной с выбором комнат, без типа недвижимости
      specialRoomedCases = (realtyRent && (!paramsCount ||
       (type === 'pansion' && rooms))) || (!size(type) && rooms);

      if (useMSS) {
        deleteLastBC = nonEmptyMSS && !multipleParamSearch && !otherParams &&
         !specialRoomedCases ?
          true :
          false;
      } else {
        deleteLastBC = size(model) &&
         !(size(model) === 1 && model.city_id && !city) &&
         !multipleDataParamSearch && !otherDataParams && !realtyObject &&
         !specialRoomedCases ?
          true :
          false;
      }
    } else if (blogCategory) { // Когда блог
      if (category) {
        title = cutText(blogCategory, 50);
        title = title[1] ? `${title[0]} ...` : title[0];
      } else {
        const hrefCat = `${href}${blogCategoryTr}/`;
        const item = {
          href: hrefCat,
          title: blogCategory
        };

        breadcrumbsArr.push(item);
        title = cutText(blogPostTitle, 50);
        title = title[1] ? `${title[0]} ...` : title[0];
      }
      paramsCount++;
    } else if (program && bank) { // Когда ипотечная программа
      breadcrumbsArr.pop();
      href = href.replace('bank/','');

      const hrefBank = `${href}${bank.name_tr}/`;
      const item = {
        href: hrefBank,
        title: bank.name
      };

      breadcrumbsArr.push(item);
      title = 'Ипотечная программа';
      paramsCount++;
    } else if (bank) { // Когда банк
      title = bank.name;
      paramsCount++;
    }

    if (builderName) {
      title = builderName;
    } else if (!paramsCount) {
      if (useMSS && defaults && msRealtyClass === 'flats' &&
       !multipleParamSearch && !otherParams && !defaultCity &&
       !hasCitySelector && !specialRoomedCases) {
        title = defaults['flats'];
      }
      if (!useMSS && !size(model) && !otherDataParams) {
        title = currentPageTitle;
      }
    }

    const lastItem = {
      title: title
    };

    !deleteLastBC && breadcrumbsArr.push(lastItem);

    return breadcrumbsArr;
  }

  render() {

    return (
      <BreadcrumbsView
        dataList={this.breadcrumbsData}
        {...this.props} />
    );
  }
}

export default Breadcrumbs;
