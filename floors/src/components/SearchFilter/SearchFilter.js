/**
 * Searchform filter component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
 /*global data*/
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {size, isEmpty, without,
  toArray, mapValues, includes} from 'lodash';
import createFragment from 'react-addons-create-fragment';
import FilterBlock from '../SearchFilter/FilterBlock';
import FilterRange from '../SearchFilter/FilterRange';
import GeminiScrollbar from 'react-gemini-scrollbar';
import Url from '../../utils/Url';
import Button from 'react-bootstrap/lib/Button';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
/**
 * React/Flux entities
 */
import {getSearchResult} from '../../actions/SearchActions';
import SearchStore from '../../stores/SearchStore';
import mss from '../../stores/ModularSearcherStore';
import ga from '../../utils/ga';
import ModularSearcherActions from '../../actions/ModularSearcherActions';
import {generateSearchUrl} from '../../utils/Helpers';
import s from './SearchFilter.scss';
import emptyFunction from 'fbjs/lib/emptyFunction';

class SearchFilter extends Component {

  static propTypes = {
    isLoading: PropTypes.bool,
    layoutMap: PropTypes.bool,
    housesResult: PropTypes.array,
    limits: PropTypes.object,
    mountNode: PropTypes.string,
    path: PropTypes.string,
    blockHeader: PropTypes.string,
    dataUrl: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object
    ]),
    context: PropTypes.shape({
      insertCss: PropTypes.func,
    }),
    data: PropTypes.object
  };

  static defaultProps = {
    isLoading: true,
    layoutMap: false,
    housesResult: SearchStore.getResult() || [],
    limits: mss.get('limits') || {},
    flatmedia: '1',
    photos: '1',
    layouts: '1',
    tours: '1'
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
      isLoading: props.isLoading,
      layoutMap: props.layoutMap,
      housesResult: props.housesResult,
      limits: props.limits,
      blockHeight: 0
    };
    this.onlyMssFields = [
      'rooms', 'street_id', 'district_id', 'trakt_id', 'contract_type',
      'furniture', 'price_min', 'price_max', 'newcomplex_id', 'builder_id',
      'deadline_date', 'ondeadline', 'unfinished'];
    if (canUseDOM) {
      window.addEventListener('popstate', e => {
        Url.triggerPopStateCb(e);
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return isEmpty(nextState.limits) ? false : true;
  }

  componentWillMount() {
    // const searchModel = clone(mss.get());
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
    // if (canUseDOM) {
    //   const queryModel = Url.parseQuery();
    //   const resModel = {};
    //
    //   each(queryModel, (item, key) => {
    //     if (this.onlyMssFields.indexOf(key) === -1) {
    //       resModel[key] = item;
    //     }
    //   });
    //
    //   //Дополнительно
    //   resModel.type = clone(searchModel.type);
    //   set('filterFields', resModel);
    // }

    // FilterSettingsStore.onChange(this.onChange);
    mss.onChange(this.onChange);
    // SearchStore.onChange(this.onChange);
  }

  componentDidUpdate() {
    const {mountNode, blockHeader} = this.props;
    const {layoutType} = this.state;

    if(layoutType === '1') {
      setTimeout(() => {
        const el = document.getElementById(mountNode);
        const wrapper = el.parentElement.parentElement;
        let height;

        //make fix here
        if(blockHeader === '1') {
          height = window.innerHeight - wrapper.offsetTop - 81;
        } else {
          height = window.innerHeight - wrapper.offsetTop - 56;
        }

        this.setState({
          blockHeight: height
        });
      }, 100);
    }
  }

  componentWillUnmount() {
    // SearchStore.off(this.onChange);
    // FilterSettingsStore.off(this.onChange);
    mss.off(this.onChange);
    this.removeCss();
  }

  onChange = () => {
    const {perPage, isLoading, limits, layoutType} = mss.get();
    let {pageNum, offset} = mss.get();
    const result = SearchStore.getResult();
    let currentPage = offset === 0 ? 0 : (offset / perPage);

    pageNum = Math.ceil(size(result) / perPage);
    if (currentPage > pageNum) {
      currentPage = 0;
      offset = 0;
    }
    this.setState(() => ({
      limits: limits,
      pageNum: pageNum,
      perPage: perPage,
      offset: offset,
      isLoading: isLoading,
      currentPage: currentPage,
      housesResult: result,
      layoutType: layoutType,
      filterFields: mss.get(),
    }));
  };

  hideFilter() {
    const {mountNode} = this.props;
    const el = document.getElementById(mountNode);

    const elWidth = el.offsetWidth;
    const rootCell = el.parentElement;
    const control = document.getElementById('filterControl');

    rootCell.classList.add('transitionSlide');
    if(rootCell.style.marginLeft === `-${elWidth}px`) {
      rootCell.style.marginLeft = '0';
      control.classList.add('reverseControl');
    } else {
      rootCell.style.marginLeft = `-${elWidth}px`;
      control.classList.remove('reverseControl');
    }
  }

  toggleView = (event) => {
    const type = event.target.dataset.type;

    event.preventDefault();
    window.location = this.getSearchUrl(type);

  }

  getSearchUrl = (type) => {
    const model = canUseDOM ? mss.get() : this.props.dataUrl;

    let {path} = this.props;

    if(type === 'search') {
      const parts = path.split(/\//);

      if (parts.length > 1) {
        path = `${parts[0]}/${parts[1]}/search/map/`;
      }
    } else {
      path = path.replace('map/', '');
    }

    return generateSearchUrl(model, `${path}?`, true);
  }

  handleChange(event) {
    const type = event.target.dataset.type;
    const value = event.target.checked ? event.target.value : '';

    // Url.updateSearchParam(type, value !== '' ? value : undefined);

    if (!size(Url.parseQuery())) {
      Url.removeQuery();
    }
    // Url.updateSearchParam('page', undefined);

    // вычисляем отступ для получения данных конкретной страницы
    // если отступ больше, чем общее кол-во объектов, то переходим на 1-ю
    // страницу
    // const perPage = mss.get('perPage');
    // const offset = getOffset(mss.get('offset'),
    //   SearchStore.model['count'], perPage);
    const perPage = mss.get('perPage');
    // const offset = getOffset(mss.get('offset'),
    //   mss.get('count'), perPage);

    ModularSearcherActions.set(null, {
      [type]: value,
      offset: 0,
      currentPage: 0
    });

    // Url.updateSearchParam('currentPage', 1);

    if (type === 'rating_max') {
      if (data.objects.list[0].class !== 'nh_flats') {
        if (value) {
          ga('radiobutton',
            'site_rating_search_filter_by_rating_other', 'click');
        }
        // delete FilterSettingsStore.data.filterFields['rating_min'];
      }
      // delete FilterSettingsStore.data.filterFields['rating_min'];
      ModularSearcherActions.set('rating_min', null);
    }
    if (type === 'rating_min') {
      if (data.objects.list[0].class !== 'nh_flats') {
        if (value) {
          ga('radiobutton',
            `site_rating_search_filter_by_rating_${value}`, 'click');
        }
      }

      ModularSearcherActions.set('rating_max', null);
    }

    getSearchResult(
      mss.get('class'),
      perPage,
      0,
      mss.get(),
      {}
    );

    // нужно ли перисчитывать кол-во объектов при изменении фильтра?
    ModularSearcherActions.getCountPeriod(perPage, 0, 'countAll');
    ModularSearcherActions.getCountPeriod(perPage, 0, 'countMonth');
    ModularSearcherActions.getCountPeriod(perPage, 0, 'countWeek');
    ModularSearcherActions.getCountPeriod(perPage, 0, 'countDay');
    //
    // ModularSearcherActions.getCount();
  }

  handleChangeArray(event) {
    const type = event.target.dataset.type;
    let collection = mss.get()[type] || [];

    if(event.target.checked) {
      collection.push(event.target.value);
    } else {
      collection = without(collection, event.target.value);
    }

    // Url.updateSearchParam(type, collection ? collection : undefined);

    if (!size(Url.parseQuery())) {
      Url.removeQuery();
    }

    // КОСТЫЛЬ. Я так написал, потому что при нажатии на фильтр по типам
    // неизвестный код неизвестного автора пишет в mss выбранный тип, но
    // только 1 раз. В связи с этим после перезагрузки страницы фильтр сбрасывается
    // на 1й выбранный вариант
    // if (type === 'type' &&
    //     searchModel.type.length !== 0 &&
    //     searchModel.class === 'flats') {
    //   ModularSearcherActions.set('type', []);
    // }

    // вычисляем отступ для получения данных конкретной страницы
    // если отступ больше, чем общее кол-во объектов, то переходим на 1-ю
    // страницу
    const perPage = mss.get('perPage');
    // const offset = getOffset(mss.get('offset'),
    //   searchModel['count'], perPage);

    ModularSearcherActions.set(null, {
      [type]: collection,
      offset: 0,
      currentPage: 0
    });

    // const curPage = offset / perPage > 0 ? offset / perPage : 1;

    // Url.updateSearchParam('currentPage', 1);

    getSearchResult(
      mss.get('class'),
      perPage,
      0,
      mss.get(),
      {}
    );

    // нужно ли перисчитывать кол-во объектов при изменении фильтра?
    ModularSearcherActions.getCountPeriod(perPage, 0, 'countAll');
    ModularSearcherActions.getCountPeriod(perPage, 0, 'countMonth');
    ModularSearcherActions.getCountPeriod(perPage, 0, 'countWeek');
    ModularSearcherActions.getCountPeriod(perPage, 0, 'countDay');
    //
    // ModularSearcherActions.getCount();

  }

  trackEvent = (e) => {
    const id = e.target.id;


    if (data.objects.list[0].class === 'nh_flats') {
      switch (id) {
      case 'rating9':
        ga('radiobutton',
        'site_zastr_rating_search_filter_by_rating_9', 'click');
        break;
      case 'rating8':
        ga('radiobutton',
        'site_zastr_rating_search_filter_by_rating_8', 'click');
        break;
      case 'rating7':
        ga('radiobutton',
        'site_zastr_rating_search_filter_by_rating_7', 'click');
        break;
      case 'rating6':
        ga('radiobutton',
        'site_zastr_rating_search_filter_by_rating_6', 'click');
        break;

      default: ga('radiobutton',
      'site_zastr_rating_search_filter_by_rating_other', 'click');
        // delete FilterSettingsStore.data.filterFields['rating_min'];
      }
    }

  }

  trackEventZagorod = (e) => {
    const id = e.target.id;
    const checked = e.target.checked;

    switch (id) {
    case 'electricity--no':
      switch (checked) {
      case true:
        ga('checkbox',
        'site_search_realty_out_filter_electricity_otsutstvuet', 'on');
        break;
      default: ga('checkbox',
        'site_search_realty_out_filter_electricity_otsutstvuet', 'off');
      }
      break;
    case  'electricity--inlocality':
      switch (checked) {
      case true:
        ga('checkbox',
        'site_search_realty_out_filter_electricity_est_v_naselennom_punkte',
        'on');
        break;
      default: ga('checkbox',
        'site_search_realty_out_filter_electricity_est_v_naselennom_punkte',
        'off');
      }
      break;
    case  'electricity--instreet':
      switch (checked) {
      case true:
        ga('checkbox',
        'site_search_realty_out_filter_electricity_zavedeno',
        'on');
        break;
      default: ga('checkbox',
        'site_search_realty_out_filter_electricity_zavedeno',
        'off');
      }
      break;
    case  'electricity--insector':
      switch (checked) {
      case true:
        ga('checkbox',
        'site_search_realty_out_filter_electricity_stolb_okolo_uchstka',
        'on');
        break;
      default: ga('checkbox',
        'site_search_realty_out_filter_electricity_stolb_okolo_uchstka',
        'off');
      }
      break;
    case  'electricity--inhome':
      switch (checked) {
      case true:
        ga('checkbox',
        'site_search_realty_out_filter_electricity_razvedeno_po_domu', 'on');
        break;
      default: ga('checkbox',
        'site_search_realty_out_filter_electricity_razvedeno_po_domu', 'off');
      }
      break;
    default: null;
    }
  }



  render() {
    const {layoutType, limits, filterFields, blockHeight} = this.state;
    const props = this.props;
    const {blockHeader} = props;
    const minArea = parseFloat(limits.square_min);
    const maxArea = parseFloat(limits.square_max);
    const minAreaKitchen = parseFloat(limits.square_kitchen_min);
    const maxAreaKitchen = parseFloat(limits.square_kitchen_max);
    const minAreaLand = parseFloat(limits.area_land_min);
    const maxAreaLand = parseFloat(limits.area_land_max);
    const minAreaHouse = parseFloat(limits.area_house_min);
    const maxAreaHouse = parseFloat(limits.area_house_max);
    const minFloor = parseInt(limits.floor_min);
    const maxFloor = parseInt(limits.floor_max);
    const minFloors = parseInt(limits.floors_min);
    const maxFloors = parseInt(limits.floors_max);
    const minToCenter = parseInt(limits.tocenter_min);
    const maxToCenter = parseInt(limits.tocenter_max);
    const minYear = parseInt(limits.building_year_min);
    const maxYear = parseInt(limits.building_year_max);
    const minDeadline = parseInt(limits.deadline_y_min);
    const maxDeadline = parseInt(limits.deadline_y_max);

    // console.dir(mss.get());

    let filterBlocks = mapValues(props, (option, key) => {

      switch (key) {
      case 'ratings':
        if (option === '1') {
          const ff = mss.get();

          return (
            <FilterBlock title='Оценка в рейтинге' key={key}>
              {(props.rating9 === '1') ? (
                <div className='form-group label--margin'>
                  <input type='checkbox'
                         id='rating9'
                         className='form-etagi input_arrow'
                         checked={ff.rating_min === '9'}
                         onChange={this.handleChange.bind(this)}
                         data-type='rating_min'
                         value='9'
                         onClick={this.trackEvent}/>
                  <label htmlFor='rating9'
                         className='checkbox_arrow arrow_extend'>
                    <i className='icon_arrow fa fa-circle' />
                    <span>Превосходно <b>9+</b></span>
                  </label>
                </div>
              ) : null}
              {(props.rating8 === '1') ? (
                <div className='form-group label--margin'>
                  <input type='checkbox'
                         id='rating8'
                         className='form-etagi input_arrow'
                         checked={ff.rating_min === '8'}
                         onChange={this.handleChange.bind(this)}
                         data-type='rating_min'
                         onClick={this.trackEvent}
                         value='8'/>
                  <label htmlFor='rating8'
                         className='checkbox_arrow arrow_extend'>
                    <i className='icon_arrow fa fa-circle' />
                    <span>Отлично <b>8+</b></span>
                  </label>
                </div>
              ) : null}
              {(props.rating7 === '1') ? (
                <div className='form-group label--margin'>
                  <input type='checkbox'
                         id='rating7'
                         className='form-etagi input_arrow'
                         checked={ff.rating_min === '7'}
                         onChange={this.handleChange.bind(this)}
                         data-type='rating_min'
                         onClick={this.trackEvent}
                         value='7'/>
                  <label htmlFor='rating7'
                         className='checkbox_arrow arrow_extend'>
                    <i className='icon_arrow fa fa-circle' />
                    <span>Очень хорошо <b>7+</b></span>
                  </label>
                </div>
              ) : null}
              {(props.rating6 === '1') ? (
                <div className='form-group label--margin'>
                  <input type='checkbox'
                         id='rating6'
                         className='form-etagi input_arrow'
                         checked={ff.rating_min === '6'}
                         onChange={this.handleChange.bind(this)}
                         data-type='rating_min'
                         onClick={this.trackEvent}
                         value='6'/>
                  <label htmlFor='rating6'
                         className='checkbox_arrow arrow_extend'>
                    <i className='icon_arrow fa fa-circle' />
                    <span>Хорошо <b>6+</b></span>
                  </label>
                </div>
              ) : null}
              {(props.ratingOther === '1') ? (
                <div className='form-group label--margin'>
                  <input type='checkbox'
                         id='ratingOther'
                         className='form-etagi input_arrow'
                         checked={ff.rating_max === '5.9' && !ff.rating_min}
                         onChange={this.handleChange.bind(this)}
                         data-type='rating_max'
                         onClick={this.trackEvent}
                         value='5.9'/>
                  <label htmlFor='ratingOther'
                         className='checkbox_arrow arrow_extend'>
                    <i className='icon_arrow fa fa-circle' />
                    <span>Прочие</span>
                  </label>
                </div>
              ) : null}
            </FilterBlock>
          );
        }
        break;
      case 'realty_type' :
        if(option === '1') {
          const type = filterFields && filterFields.type;

          return (
            <FilterBlock title='Тип недвижимости' key={key}>
              {props.flat === '1' ?
              <div className='form-group label--margin'>
                <input type='checkbox'
                  id='type--flat'
                  checked={includes(type, 'flat')}
                  className='form-etagi input_arrow'
                  onChange={this.handleChangeArray.bind(this)}
                  data-type='type'
                  value='flat'/>
                <label htmlFor='type--flat'
                  className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                  <span>Квартиры</span>
                </label>
              </div> : null}
              {props.pansion === '1' ?
              <div className='form-group label--margin'>
                <input type='checkbox'
                  id='type--pansion'
                  checked={includes(type, 'pansion')}
                  className='form-etagi input_arrow'
                  onChange={this.handleChangeArray.bind(this)}
                  data-type='type'
                  value='pansion'/>
                <label htmlFor='type--pansion'
                  className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                  <span>Пансионаты</span>
                </label>
              </div> : null}
              {props.room === '1' ?
              <div className='form-group label--margin'>
                <input type='checkbox'
                  id='type--room'
                  checked={includes(type, 'room')}
                  className='form-etagi input_arrow'
                  onChange={this.handleChangeArray.bind(this)}
                  data-type='type'
                  value='room'/>
                <label htmlFor='type--room'
                  className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                  <span>Комнаты</span>
                </label>
              </div> : null}
              {props.malosem === '1' ?
              <div className='form-group label--margin'>
                <input type='checkbox'
                  id='type--malosem'
                  checked={includes(type, 'malosem')}
                  className='form-etagi input_arrow'
                  onChange={this.handleChangeArray.bind(this)}
                  data-type='type'
                  value='malosem'/>
                <label htmlFor='type--malosem'
                  className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                  <span>Малосемейки</span>
                </label>
              </div> : null}
              {props.obshaga === '1' ?
              <div className='form-group label--margin'>
                <input type='checkbox'
                  id='type--obshaga'
                  checked={includes(type, 'obshaga')}
                  className='form-etagi input_arrow'
                  onChange={this.handleChangeArray.bind(this)}
                  data-type='type'
                  value='obshaga'/>
                <label htmlFor='type--obshaga'
                  className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                  <span>Общежития</span>
                </label>
              </div> : null}
            </FilterBlock>
          );
        }
        break;
      case 'allowed' :
        if(option === '1') {
          return (
            <FilterBlock title='В квартире разрешено' key={key}>
              {(props.children === '1') ? (
                <div className='form-group label--margin'>
                  <input type='checkbox'
                         id='allowed--children'
                         className='form-etagi input_arrow'
                         checked={filterFields ?
                          filterFields.allowed ?
                          includes(filterFields.allowed, 'children') :
                            false : false}
                         onChange={this.handleChangeArray.bind(this)}
                         data-type='allowed'
                         value='children'/>
                  <label htmlFor='allowed--children'
                         className='checkbox_arrow arrow_extend'>
                    <i className='icon_arrow' />
                    <span>Дети</span>
                  </label>
                </div>
              ) : null}
              {(props.students === '1') ? (
                <div className='form-group label--margin'>
                  <input type='checkbox'
                         id='allowed--students'
                         className='form-etagi input_arrow'
                         checked={filterFields ?
                          filterFields.allowed ?
                          includes(filterFields.allowed, 'students') :
                            false : false}
                         onChange={this.handleChangeArray.bind(this)}
                         data-type='allowed'
                         value='students'/>
                  <label htmlFor='allowed--students'
                         className='checkbox_arrow arrow_extend'>
                    <i className='icon_arrow' />
                    <span>Проживание студентов</span>
                  </label>
                </div>
              ) : null}
              {(props.animals === '1') ? (
                <div className='form-group label--margin'>
                  <input type='checkbox'
                         id='allowed--animals'
                         className='form-etagi input_arrow'
                         checked={filterFields ?
                          filterFields.allowed ?
                          includes(filterFields.allowed, 'animals') :
                            false : false}
                         onChange={this.handleChangeArray.bind(this)}
                         data-type='allowed'
                         value='animals'/>
                  <label htmlFor='allowed--animals'
                         className='checkbox_arrow arrow_extend'>
                    <i className='icon_arrow' />
                    <span>Животные</span>
                  </label>
                </div>
              ) : null}
            </FilterBlock>
          );
        }
        break;
      case 'period' :
        if(option === '1') {
          return (
            <FilterBlock title='Период аренды' key={key}>
              {(props.duration === '1') ? (
                <div className='form-group label--margin'>
                  <input type='checkbox'
                         id='allowed--duration'
                         className='form-etagi input_arrow'
                         onChange={this.handleChangeArray.bind(this)}
                         data-type='duration'
                         value='week,month'/>
                  <label htmlFor='allowed--duration'
                         className='checkbox_arrow arrow_extend'>
                    <i className='icon_arrow' />
                    <span>Заселение на короткий срок</span>
                  </label>
                </div>
              ) : null}
            </FilterBlock>
          );
        }
        break;
      case 'realty_commerce_type':
        if(option === '1') {
          const type = filterFields && filterFields.type;

          return (
            <FilterBlock title='Тип недвижимости' key={key}>
              {((props.newhouse_commerce === '1') ?
              (<div className='form-group label--margin'>
                 <input type='checkbox'
                   id='type--newhouse_commerce'
                   checked={includes(type, 'newhouse_commerce')}
                   className='form-etagi input_arrow'
                   onChange={this.handleChangeArray.bind(this)}
                   data-type='type'
                   value='newhouse_commerce'/>
                 <label htmlFor='type--newhouse_commerce'
                   className='checkbox_arrow arrow_extend'>
                   <i className='icon_arrow'></i>
                   <span>Новостройки</span>
                 </label>
               </div>) : null)}
              {(props.dev === '1' ?
              (<div className='form-group label--margin'>
                 <input type='checkbox'
                   id='type--dev'
                   checked={includes(type, 'dev')}
                   className='form-etagi input_arrow'
                   onChange={this.handleChangeArray.bind(this)}
                   data-type='type'
                   value='dev'/>
                 <label htmlFor='type--dev'
                   className='checkbox_arrow arrow_extend'>
                   <i className='icon_arrow'></i>
                   <span>Производство</span>
                 </label>
               </div>) : null)}
              {(props.base === '1' ?
              (<div className='form-group label--margin'>
                 <input type='checkbox'
                   id='type--base'
                   checked={includes(type, 'base')}
                   className='form-etagi input_arrow'
                   onChange={this.handleChangeArray.bind(this)}
                   data-type='type'
                   value='base'/>
                 <label htmlFor='type--base'
                   className='checkbox_arrow arrow_extend'>
                   <i className='icon_arrow'></i>
                   <span>Базы</span>
                 </label>
               </div>) : null)}
              {(props.busines === '1' ?
              (<div className='form-group label--margin'>
                 <input type='checkbox'
                   id='type--busines'
                   checked={includes(type, 'busines')}
                   className='form-etagi input_arrow'
                   onChange={this.handleChangeArray.bind(this)}
                   data-type='type'
                   value='busines'/>
                 <label htmlFor='type--busines'
                   className='checkbox_arrow arrow_extend'>
                   <i className='icon_arrow'></i>
                   <span>Готовый бизнес</span>
                 </label>
               </div>) : null)}
              {(props.office === '1' ?
              (<div className='form-group label--margin'>
                 <input type='checkbox'
                   id='type--office'
                   checked={includes(type, 'office')}
                   className='form-etagi input_arrow'
                   onChange={this.handleChangeArray.bind(this)}
                   data-type='type'
                   value='office'/>
                 <label htmlFor='type--office'
                   className='checkbox_arrow arrow_extend'>
                   <i className='icon_arrow'></i>
                   <span>Офисы</span>
                 </label>
               </div>) : null)}
              {(props.torg === '1' ?
              (<div className='form-group label--margin'>
                 <input type='checkbox'
                   id='type--torg'
                   checked={includes(type, 'torg')}
                   className='form-etagi input_arrow'
                   onChange={this.handleChangeArray.bind(this)}
                   data-type='type'
                   value='torg'/>
                 <label htmlFor='type--torg'
                   className='checkbox_arrow arrow_extend'>
                   <i className='icon_arrow'></i>
                   <span>Торговые</span>
                 </label>
               </div>) : null)}
              {(props.other === '1' ?
              (<div className='form-group label--margin'>
                 <input type='checkbox'
                   id='type--other'
                   checked={includes(type, 'other')}
                   className='form-etagi input_arrow'
                   onChange={this.handleChangeArray.bind(this)}
                   data-type='type'
                   value='other'/>
                 <label htmlFor='type--other'
                   className='checkbox_arrow arrow_extend'>
                   <i className='icon_arrow'></i>
                   <span>Свободного назначения</span>
                 </label>
               </div>) : null)}
              {(props.sklad === '1' ?
              (<div className='form-group label--margin'>
                 <input type='checkbox'
                   id='type--sklad'
                   checked={includes(type, 'sklad')}
                   className='form-etagi input_arrow'
                   onChange={this.handleChangeArray.bind(this)}
                   data-type='type'
                   value='sklad'/>
                 <label htmlFor='type--sklad'
                   className='checkbox_arrow arrow_extend'>
                   <i className='icon_arrow'></i>
                   <span>Склады</span>
                 </label>
               </div>) : null)}
              {(props.land === '1' ?
              (<div className='form-group label--margin'>
                 <input type='checkbox'
                   id='type--land'
                   checked={includes(type, 'land')}
                   className='form-etagi input_arrow'
                   onChange={this.handleChangeArray.bind(this)}
                   data-type='type'
                   value='land'/>
                 <label htmlFor='type--land'
                   className='checkbox_arrow arrow_extend'>
                   <i className='icon_arrow'></i>
                   <span>Земля</span>
                 </label>
               </div>) : null)}
            </FilterBlock>
          );
        }
        break;
      case 'area':
        if (option === '1') {
          return (
            <FilterBlock title='Площадь' key={key}>
              {(props.all === '1' ? (<FilterRange title='Общая площадь'
                valueMin={minArea}
                valueMax={maxArea}
                valueLo={filterFields ?
                  filterFields.square_min ?
                    parseInt(filterFields.square_min) : minArea : minArea}
                valueHi={filterFields ?
                  filterFields.square_max ?
                    parseInt(filterFields.square_max) : maxArea : maxArea}
                type='square'
                ref='square'/>) : null)}
              {(props.kitchen === '1' ? (<FilterRange title='Площадь кухни'
                valueMin={minAreaKitchen}
                valueMax={maxAreaKitchen}
                valueLo={filterFields ?
                  filterFields.square_kitchen_min ?
                    parseInt(filterFields.square_kitchen_min) :
                      minAreaKitchen : minAreaKitchen}
                valueHi={filterFields ?
                  filterFields.square_kitchen_max ?
                    parseInt(filterFields.square_kitchen_max) :
                      maxAreaKitchen : maxAreaKitchen}
                type='square_kitchen'
                ref='square_kitchen'/>) : null)}
            </FilterBlock>
          );
        }
        break;
      case 'area_out':
        if (option === '1') {
          return (
            <FilterBlock title='Площадь' key={key}>
              <FilterRange title='Площадь участка'
                 valueMin={minAreaLand}
                 valueMax={maxAreaLand}
                 valueLo={filterFields ?
                  filterFields.area_land_min ?
                    parseInt(filterFields.area_land_min) :
                      minAreaLand : minAreaLand}
                  valueHi={filterFields ?
                  filterFields.area_land_max ?
                    parseInt(filterFields.area_land_max) :
                      maxAreaLand : maxAreaLand}
                 type='area_land'
                 ref='area_land'/>
              <FilterRange title='Площадь дома'
                 valueMin={minAreaHouse}
                 valueMax={maxAreaHouse}
                 valueLo={filterFields ?
                  filterFields.area_house_min ?
                    parseInt(filterFields.area_house_min) :
                      minAreaHouse : minAreaHouse}
                 valueHi={filterFields ?
                  filterFields.area_house_max ?
                    parseInt(filterFields.area_house_max) :
                      maxAreaHouse : maxAreaHouse}
                 type='area_house'
                 ref='area_house'/>
            </FilterBlock>
          );
        }
        break;
      case 'distance':
        if (option === '1') {
          return (
            <FilterBlock title='Расстояние' key={key}>
              <FilterRange title='До центра'
                 valueMin={minToCenter}
                 valueMax={maxToCenter}
                 valueLo={filterFields ?
                  filterFields.tocenter_min ?
                    parseInt(filterFields.tocenter_min) :
                      minToCenter : minToCenter}
                 valueHi={filterFields ?
                  filterFields.tocenter_max ?
                    parseInt(filterFields.tocenter_max) :
                      maxToCenter : maxToCenter}
                 type='tocenter'
                 ref='tocenter'/>
              <div className='form-group label--margin'>
                <input type='checkbox' id='incity'
                   className='form-etagi input_arrow'
                   checked={filterFields ?
                    filterFields.incity === 'true' : ''}
                   onChange={this.handleChange.bind(this)}
                   data-type='incity'
                   value='true'/>
                <label htmlFor='incity'
                       className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                  <span>В черте города</span>
                </label>
              </div>
            </FilterBlock>
          );
        }
        break;
      case 'storeys':
        if (option === '1') {
          return (
            <FilterBlock title='Этажность' key={key}>
              <FilterRange title='Этаж'
              valueMin={minFloor}
              valueMax={maxFloor}
              valueLo={filterFields ?
                filterFields.floor_min ?
                  parseInt(filterFields.floor_min) : minFloor : minFloor}
              valueHi={filterFields ?
                filterFields.floor_max ?
                  parseInt(filterFields.floor_max) : maxFloor : maxFloor}
              type='floor'/>
              <FilterRange title='Этажность'
              valueMin={minFloors}
              valueMax={maxFloors}
              valueLo={filterFields ?
                filterFields.floors_min ?
                  parseInt(filterFields.floors_min) : minFloors : minFloors}
              valueHi={filterFields ?
                filterFields.floors_max ?
                  parseInt(filterFields.floors_max) : maxFloors : maxFloors}
              type='floors'/>
              <div className='form-group label--margin'>
                  <input type='checkbox' id='floors--nofirst'
                  className='form-etagi input_arrow'
                  checked={filterFields ?
                    filterFields.floor ?
                    filterFields.floor === '!1' : false : false}
                  onChange={this.handleChange.bind(this)}
                  data-type='floor'
                  value='!1'/>
                  <label htmlFor='floors--nofirst'
                  className='checkbox_arrow arrow_extend'>
                      <i className='icon_arrow'></i>
                      <span>Все кроме первого</span>
                  </label>
              </div>
              <div className='form-group label--margin'>
                  <input type='checkbox' id='floors--nolast'
                  className='form-etagi input_arrow'
                  checked={filterFields ?
                    filterFields.floors ?
                    filterFields.floors === '!floor' : false : false}
                  onChange={this.handleChange.bind(this)}
                  data-type='floors'
                  value='!floor'/>
                  <label htmlFor='floors--nolast'
                  className='checkbox_arrow arrow_extend'>
                    <i className='icon_arrow'></i>
                    <span>Все кроме последнего</span>
                  </label>
              </div>
            </FilterBlock>
          );
        }
        break;
      case 'building_year':
        if (option === '1') {
          return (
            <FilterBlock title='Год постройки' key={key}>
              <FilterRange title='Год'
              valueMin={minYear}
              valueMax={maxYear}
              valueLo={filterFields ?
                filterFields.building_year_min ?
                  parseInt(filterFields.building_year_min) :
                    minYear : minYear}
              valueHi={filterFields ?
                filterFields.building_year_max ?
                  parseInt(filterFields.building_year_max) :
                    maxYear : maxYear}
              type='building_year'/>
            </FilterBlock>
          );
        }
        break;
      case 'deadline_y':
        if (option === '1' && minDeadline !== maxDeadline) {
          return (
            <FilterBlock title='Срок сдачи' key={key}>
              <FilterRange title='Год'
              valueMin={minDeadline}
              valueMax={maxDeadline}
              valueLo={filterFields ?
                filterFields.deadline_y_min ?
                  parseInt(filterFields.deadline_y_min) :
                    minDeadline : minDeadline}
              valueHi={filterFields ?
                filterFields.deadline_y_max ?
                  parseInt(filterFields.deadline_y_max) :
                    maxDeadline : maxDeadline}
              type='deadline_y'/>
            </FilterBlock>
          );
        }
        break;
      case 'best_deals':
        if (option === '1') {
          return (
              <FilterBlock title='Интересные предложения' key={key}>
                {((props.discount === '1' || !props.discount) ?
                (<div className='form-group label--margin'>
                   <input type='checkbox'
                     id='has--action'
                     className='form-etagi input_arrow'
                     checked={filterFields ?
                      filterFields.old_price_min === 'price' : false}
                     onChange={this.handleChange.bind(this)}
                     data-type='old_price_min'
                     value='price'/>
                   <label htmlFor='has--action'
                     className='checkbox_arrow arrow_extend'>
                     <i className='icon_arrow'></i>
                     <span>Есть скидки</span>
                   </label>
                 </div>) : null)}
                {((props.survey === '1') ?
                  (<div className='form-group label--margin'>
                    <input type='checkbox'
                           id='has--survey'
                           className='form-etagi input_arrow'
                           checked={filterFields ?
                            filterFields.survey === 'true' : false}
                           onChange={this.handleChange.bind(this)}
                           data-type='survey'
                           value='true'/>
                    <label htmlFor='has--survey'
                           className='checkbox_arrow arrow_extend'>
                      <i className='icon_arrow'></i>
                      <span>Межевание</span>
                    </label>
                  </div>) : null)}
                {(props.trade === '1' ?
                (<div className='form-group label--margin'>
                   <input type='checkbox'
                     id='has--trade'
                     className='form-etagi input_arrow'
                          checked={filterFields ?
                      filterFields.trade_in : false}
                     onChange={this.handleChange.bind(this)}
                     data-type='trade_in'
                     value='true'/>
                   <label htmlFor='has--trade'
                     className='checkbox_arrow arrow_extend'>
                     <i className='icon_arrow'></i>
                     <span>Обмен</span>
                   </label>
                 </div>) : null)}
                {props.unfinished === '1' ?
                  (<div className='form-group label--margin'>
                    <input type='checkbox'
                           id='has--unfinished'
                           className='form-etagi input_arrow'
                           onChange={this.handleChange.bind(this)}
                           data-type='unfinished'
                           value='true'/>
                    <label htmlFor='has--unfinished'
                           className='checkbox_arrow arrow_extend'>
                      <i className='icon_arrow'></i>
                      <span>Недострой</span>
                    </label>
                  </div>) : null}
                  {props.renter_exist === '1' ?
                  (<div className='form-group label--margin'>
                    <input type='checkbox'
                           id='has--renter_exist'
                           className='form-etagi input_arrow'
                           onChange={this.handleChange.bind(this)}
                           data-type='renter_exist'
                           value='true'/>
                    <label htmlFor='has--renter_exist'
                           className='checkbox_arrow arrow_extend'>
                      <i className='icon_arrow'></i>
                      <span>Есть арендатор</span>
                    </label>
                  </div>) : null}
              </FilterBlock>
          );
        }
        break;
      case 'facing':
        if (option === '1') {
          return (
            <FilterBlock title='Отделка' key={key}>
              <div className='form-group label--margin'>
                  <input type='checkbox' id='facing--black'
                  className='form-etagi input_arrow'
                  onChange={this.handleChangeArray.bind(this)}
                  data-type='keep'
                  value='black'/>
                  <label htmlFor='facing--black'
                  className='checkbox_arrow arrow_extend'>
                          <i className='icon_arrow'></i>
                          <span>черновая</span>
                  </label>
              </div>
              <div className='form-group label--margin'>
                  <input type='checkbox' id='facing--wellBlack'
                  className='form-etagi input_arrow'
                  onChange={this.handleChangeArray.bind(this)}
                  data-type='keep'
                  value='well_black'/>
                  <label htmlFor='facing--wellBlack'
                  className='checkbox_arrow arrow_extend'>
                          <i className='icon_arrow'></i>
                          <span>улучшенная черновая</span>
                  </label>
              </div>
              <div className='form-group label--margin'>
                  <input type='checkbox' id='facing--need'
                  className='form-etagi input_arrow'
                  onChange={this.handleChangeArray.bind(this)}
                  data-type='keep'
                  value='need'/>
                  <label htmlFor='facing--need'
                  className='checkbox_arrow arrow_extend'>
                          <i className='icon_arrow'></i>
                          <span>частичный ремонт</span>
                  </label>
              </div>
              <div className='form-group label--margin'>
                  <input type='checkbox' id='facing--cosmetic'
                  className='form-etagi input_arrow'
                  onChange={this.handleChangeArray.bind(this)}
                  data-type='keep'
                  value='cosmetic'/>
                  <label htmlFor='facing--cosmetic'
                  className='checkbox_arrow arrow_extend'>
                          <i className='icon_arrow'></i>
                          <span>косметический ремонт</span>
                  </label>
              </div>
              <div className='form-group label--margin'>
                  <input type='checkbox' id='facing--good'
                  className='form-etagi input_arrow'
                  onChange={this.handleChangeArray.bind(this)}
                  data-type='keep'
                  value='good'/>
                  <label htmlFor='facing--good'
                  className='checkbox_arrow arrow_extend'>
                          <i className='icon_arrow'></i>
                          <span>cовременный ремонт</span>
                  </label>
              </div>
              <div className='form-group label--margin'>
                  <input type='checkbox' id='facing--design'
                  className='form-etagi input_arrow'
                  onChange={this.handleChangeArray.bind(this)}
                  data-type='keep'
                  value='design'/>
                  <label htmlFor='facing--design'
                  className='checkbox_arrow arrow_extend'>
                          <i className='icon_arrow'></i>
                          <span>ремонт по дизайн проекту</span>
                  </label>
              </div>
            </FilterBlock>
          );
        }
        break;
      case 'electricity':
        if (option === '1') {
          return (
            <FilterBlock title='Электричество' key={key}>
              <div className='form-group label--margin'
              onClick={this.trackEventZagorod} >
                <input type='checkbox' id='electricity--no'
                       className='form-etagi input_arrow'
                       onChange={this.handleChangeArray.bind(this)}
                       data-type='electricity'
                       value='no'/>
                <label htmlFor='electricity--no'
                       className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                <span>Отсутствует</span>
                </label>
              </div>
              <div className='form-group label--margin'
              onClick={this.trackEventZagorod}>
                <input type='checkbox' id='electricity--inlocality'
                       className='form-etagi input_arrow'
                       onChange={this.handleChangeArray.bind(this)}
                       data-type='electricity'
                       value='inlocality'/>
                <label htmlFor='electricity--inlocality'
                       className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                <span>Есть в нас. пункте</span>
                </label>
              </div>
              <div className='form-group label--margin'
              onClick={this.trackEventZagorod}>
                <input type='checkbox' id='electricity--insector'
                       className='form-etagi input_arrow'
                       onChange={this.handleChangeArray.bind(this)}
                       data-type='electricity'
                       value='insector'/>
                <label htmlFor='electricity--insector'
                       className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                <span>Столб около участка</span>
                </label>
              </div>
              <div className='form-group label--margin'
              onClick={this.trackEventZagorod}>
                <input type='checkbox' id='electricity--instreet'
                       className='form-etagi input_arrow'
                       onChange={this.handleChangeArray.bind(this)}
                       data-type='electricity'
                       value='instreet'/>
                <label htmlFor='electricity--instreet'
                       className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                <span>Заведено</span>
                </label>
              </div>
              <div className='form-group label--margin'
              onClick={this.trackEventZagorod}>
                <input type='checkbox' id='electricity--inhome'
                       className='form-etagi input_arrow'
                       onChange={this.handleChangeArray.bind(this)}
                       data-type='electricity'
                       value='inhome'/>
                     <label htmlFor='electricity--inhome'
                       className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                <span>Разведен по дому</span>
                </label>
              </div>
            </FilterBlock>
          );

        }
        break;
      case 'kanalizacija':
        if (option === '1') {
          return (
            <FilterBlock title='Канализация' key={key}>
              <div className='form-group label--margin'>
                <input type='checkbox' id='kanalizacija--central'
                       className='form-etagi input_arrow'
                       checked={filterFields ?
                        filterFields.kanalizacija ?
                          includes(filterFields.kanalizacija, 'central') :
                          false : false}
                       onChange={this.handleChangeArray.bind(this)}
                       data-type='kanalizacija'
                       value='central'/>
                <label htmlFor='kanalizacija--central'
                       className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                  <span>Центральная</span>
                </label>
              </div>
              <div className='form-group label--margin'>
                <input type='checkbox' id='kanalizacija--bio'
                       className='form-etagi input_arrow'
                       checked={filterFields ?
                        filterFields.kanalizacija ?
                          includes(filterFields.kanalizacija, 'bio') :
                          false : false}
                       onChange={this.handleChangeArray.bind(this)}
                       data-type='kanalizacija'
                       value='bio'/>
                <label htmlFor='kanalizacija--bio'
                       className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                  <span>Биотуалет (септик)</span>
                </label>
              </div>
              <div className='form-group label--margin'>
                <input type='checkbox' id='kanalizacija--street'
                       className='form-etagi input_arrow'
                       checked={filterFields ?
                        filterFields.kanalizacija ?
                          includes(filterFields.kanalizacija, 'street') :
                          false : false}
                       onChange={this.handleChangeArray.bind(this)}
                       data-type='kanalizacija'
                       value='street'/>
                <label htmlFor='kanalizacija--street'
                       className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                  <span>На улице</span>
                </label>
              </div>
            </FilterBlock>
          );

        }
        break;
      case 'heating':
        if (option === '1') {
          return (
            <FilterBlock title='Отопление' key={key}>
              <div className='form-group label--margin'>
                <input type='checkbox' id='heating--central'
                       className='form-etagi input_arrow'
                       checked={filterFields ?
                        filterFields.heating ?
                          includes(filterFields.heating, 'central') :
                            false : false}
                       onChange={this.handleChangeArray.bind(this)}
                       data-type='heating'
                       value='central'/>
                <label htmlFor='heating--central'
                       className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                  <span>Центральное</span>
                </label>
              </div>
              <div className='form-group label--margin'>
                <input type='checkbox' id='heating--pechnoe'
                       className='form-etagi input_arrow'
                       checked={filterFields ?
                        filterFields.heating ?
                          includes(filterFields.heating, 'pechnoe') :
                            false : false}
                       onChange={this.handleChangeArray.bind(this)}
                       data-type='heating'
                       value='pechnoe'/>
                <label htmlFor='heating--pechnoe'
                       className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                  <span>Печное</span>
                </label>
              </div>
              <div className='form-group label--margin'>
                <input type='checkbox' id='heating--fueloil'
                       className='form-etagi input_arrow'
                       checked={filterFields ?
                        filterFields.heating ?
                          includes(filterFields.heating, 'fuel_oil') :
                            false : false}
                       onChange={this.handleChangeArray.bind(this)}
                       data-type='heating'
                       value='fuel_oil'/>
                <label htmlFor='heating--fueloil'
                       className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                  <span>Жидкое топливо</span>
                </label>
              </div>
              <div className='form-group label--margin'>
                <input type='checkbox' id='heating--gas'
                       className='form-etagi input_arrow'
                       checked={filterFields ?
                        filterFields.heating ?
                          includes(filterFields.heating, 'gas') :
                            false : false}
                       onChange={this.handleChangeArray.bind(this)}
                       data-type='heating'
                       value='gas'/>
                <label htmlFor='heating--gas'
                       className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                  <span>Газ</span>
                </label>
              </div>
              <div className='form-group label--margin'>
                <input type='checkbox' id='heating--ekotel'
                       className='form-etagi input_arrow'
                       checked={filterFields ?
                        filterFields.heating ?
                          includes(filterFields.heating, 'ekotel') :
                            false : false}
                       onChange={this.handleChangeArray.bind(this)}
                       data-type='heating'
                       value='ekotel'/>
                <label htmlFor='heating--ekotel'
                       className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                  <span>Электрический котел</span>
                </label>
              </div>
              <div className='form-group label--margin'>
                <input type='checkbox' id='heating--coalkotel'
                       className='form-etagi input_arrow'
                       checked={filterFields ?
                        filterFields.heating ?
                          includes(filterFields.heating, 'coalkotel') :
                            false : false}
                       onChange={this.handleChangeArray.bind(this)}
                       data-type='heating'
                       value='coalkotel'/>
                <label htmlFor='heating--coalkotel'
                       className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                  <span>Угольный котел</span>
                </label>
              </div>
            </FilterBlock>
          );

        }
        break;
      case 'heating_realty':
        if (option === '1') {
          return (
            <FilterBlock title='Отопление' key={key}>
              {props.central_realty === '1' ?
                  <div className='form-group label--margin'>
                    <input type='checkbox' id='heating_realty--central_realty'
                           className='form-etagi input_arrow'
                           onChange={this.handleChangeArray.bind(this)}
                           data-type='heating'
                           value='central'/>
                    <label htmlFor='heating_realty--central_realty'
                           className='checkbox_arrow arrow_extend'>
                      <i className='icon_arrow'></i>
                      <span>Центральное</span>
                    </label>
                  </div> : null}
                  {props.autonomous === '1' ?
                      <div className='form-group label--margin'>
                        <input type='checkbox' id='heating--autonomous'
                               className='form-etagi input_arrow'
                               onChange={this.handleChangeArray.bind(this)}
                               data-type='heating'
                               value='autonomous'/>
                        <label htmlFor='heating--autonomous'
                               className='checkbox_arrow arrow_extend'>
                          <i className='icon_arrow'></i>
                          <span>Автономное</span>
                        </label>
                      </div> : null}
                  {props.electrical === '1' ?
                      <div className='form-group label--margin'>
                        <input type='checkbox' id='heating--electrical'
                               className='form-etagi input_arrow'
                               onChange={this.handleChangeArray.bind(this)}
                               data-type='heating'
                               value='electrical'/>
                        <label htmlFor='heating--electrical'
                               className='checkbox_arrow arrow_extend'>
                          <i className='icon_arrow'></i>
                          <span>Электрический котел</span>
                        </label>
                      </div> : null}
            </FilterBlock>
          );
        }
        break;
      case 'waterline':
        if (option === '1') {
          return (
            <FilterBlock title='Водопровод' key={key}>
              <div className='form-group label--margin'>
                <input type='checkbox' id='waterline--central'
                       className='form-etagi input_arrow'
                       checked={filterFields ?
                        filterFields.waterline ?
                          includes(filterFields.waterline, 'central') :
                            false : false}
                       onChange={this.handleChangeArray.bind(this)}
                       data-type='waterline'
                       value='central'/>
                <label htmlFor='waterline--central'
                       className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                  <span>Централизованный</span>
                </label>
              </div>
              <div className='form-group label--margin'>
                <input type='checkbox' id='waterline--kolodec'
                       className='form-etagi input_arrow'
                       checked={filterFields ?
                        filterFields.waterline ?
                          includes(filterFields.waterline, 'kolodec') :
                            false : false}
                       onChange={this.handleChangeArray.bind(this)}
                       data-type='waterline'
                       value='kolodec'/>
                <label htmlFor='waterline--kolodec'
                       className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                  <span>Колодец</span>
                </label>
              </div>
              <div className='form-group label--margin'>
                <input type='checkbox' id='waterline--kolodecnasos'
                       className='form-etagi input_arrow'
                       checked={filterFields ?
                        filterFields.waterline ?
                          includes(filterFields.waterline, 'kolodec_nasos') :
                            false : false}
                       onChange={this.handleChangeArray.bind(this)}
                       data-type='waterline'
                       value='kolodec_nasos'/>
                <label htmlFor='waterline--kolodecnasos'
                       className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                  <span>Колодец и насос</span>
                </label>
              </div>
              <div className='form-group label--margin'>
                <input type='checkbox' id='waterline--skvazina'
                       className='form-etagi input_arrow'
                       checked={filterFields ?
                        filterFields.waterline ?
                          includes(filterFields.waterline, 'skvazina') :
                            false : false}
                       onChange={this.handleChangeArray.bind(this)}
                       data-type='waterline'
                       value='skvazina'/>
                <label htmlFor='waterline--skvazina'
                       className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                  <span>Скважина</span>
                </label>
              </div>
              <div className='form-group label--margin'>
                <input type='checkbox' id='waterline--summer'
                       className='form-etagi input_arrow'
                       checked={filterFields ?
                        filterFields.waterline ?
                          includes(filterFields.waterline, 'summer') :
                            false : false}
                       onChange={this.handleChangeArray.bind(this)}
                       data-type='waterline'
                       value='summer'/>
                <label htmlFor='waterline--summer'
                       className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                  <span>Летний водопровод</span>
                </label>
              </div>
            </FilterBlock>
          );
        }
        break;
      case 'type_deal':
        if (option === '1') {
          return (
            <FilterBlock title='Тип сделки' key={key}>
              <div className='form-group label--margin'>
                <input type='checkbox'
                       id='type--builder'
                       className='form-etagi input_arrow'
                       onChange={this.handleChangeArray.bind(this)}
                       data-type='dolshik'
                       value={false}/>
                <label htmlFor='type--builder'
                       className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                  <span>от застройщика</span>
                </label>
              </div>
              <div className='form-group label--margin'>
                <input type='checkbox' id='type--investor'
                       className='form-etagi input_arrow'
                       onChange={this.handleChangeArray.bind(this)}
                       data-type='dolshik'
                       value={true}/>
                <label htmlFor='type--investor'
                       className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i><span>от дольщика</span>
                </label>
              </div>
            </FilterBlock>
          );
        }
        break;
      case 'windows':
        if (option === '1') {
          return (
            <FilterBlock title='Окна' key={key}>
              <div className='form-group label--margin'>
                <input type='checkbox'
                       id='type--plastic'
                       className='form-etagi input_arrow'
                       onChange={this.handleChangeArray.bind(this)}
                       data-type='windows'
                       value='plastic'/>
                <label htmlFor='type--plastic'
                       className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                  <span>пластиковые</span>
                </label>
              </div>
              <div className='form-group label--margin'>
                <input type='checkbox' id='type--plastic_wood'
                       className='form-etagi input_arrow'
                       onChange={this.handleChangeArray.bind(this)}
                       data-type='windows'
                       value='plastic_wood'/>
                <label htmlFor='type--plastic_wood'
                       className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                  <span>пластиковые/деревянные</span>
                </label>
              </div>
              <div className='form-group label--margin'>
                <input type='checkbox' id='type--wood'
                       className='form-etagi input_arrow'
                       onChange={this.handleChangeArray.bind(this)}
                       data-type='windows'
                       value='wood'/>
                <label htmlFor='type--wood'
                       className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                  <span>деревянные</span>
                </label>
              </div>
              <div className='form-group label--margin'>
                <input type='checkbox' id='type--allum'
                       className='form-etagi input_arrow'
                       onChange={this.handleChangeArray.bind(this)}
                       data-type='windows'
                       value='allum'/>
                <label htmlFor='type--allum'
                       className='checkbox_arrow arrow_extend'>
                  <i className='icon_arrow'></i>
                  <span>алюминиевые</span>
                </label>
              </div>
            </FilterBlock>
          );
        }
        break;
      case 'flatmedia':
        if(option === '1') {
          return (
            <FilterBlock title='Медиа' key={key}>
              {((props.layouts === '1') ?
              (<div className='form-group label--margin'>
                 <input type='checkbox'
                   id='type--layouts'
                   className='form-etagi input_arrow'
                   onChange={this.handleChangeArray.bind(this)}
                   data-type="media->>'layouts'"
                   value='>1'/>
                 <label htmlFor='type--layouts'
                   className='checkbox_arrow arrow_extend'>
                   <i className='icon_arrow'></i>
                   <span>Планировки</span>
                 </label>
               </div>) : null)}
              {(props.tours === '1' ?
              (<div className='form-group label--margin'>
                 <input type='checkbox'
                   id='type--tours'
                   className='form-etagi input_arrow'
                   onChange={this.handleChangeArray.bind(this)}
                   data-type="media->>'tours'"
                   value='>1'/>
                 <label htmlFor='type--tours'
                   className='checkbox_arrow arrow_extend'>
                   <i className='icon_arrow'></i>
                   <span>3D-туры</span>
                 </label>
               </div>) : null)}
              {(props.videos === '1' ?
              (<div className='form-group label--margin'>
                 <input type='checkbox'
                   id='type--video'
                   className='form-etagi input_arrow'
                   onChange={this.handleChangeArray.bind(this)}
                   data-type="media->>'videos'"
                   value='>1'/>
                 <label htmlFor='type--video'
                   className='checkbox_arrow arrow_extend'>
                   <i className='icon_arrow'></i>
                   <span>Видео</span>
                 </label>
               </div>) : null)}
              {(props.photos === '1' ?
              (<div className='form-group label--margin'>
                 <input type='checkbox'
                   id='type--photos'
                   className='form-etagi input_arrow'
                   onChange={this.handleChangeArray.bind(this)}
                   data-type="media->>'photos'"
                   value='>1'/>
                 <label htmlFor='type--photos'
                   className='checkbox_arrow arrow_extend'>
                   <i className='icon_arrow'></i>
                   <span>Фото</span>
                 </label>
               </div>) : null)}
            </FilterBlock>
          );
        }
        break;
      default:
      }
    });

    filterBlocks = createFragment({
      filterBlocks: isEmpty(limits) ? [] : toArray(filterBlocks)
    });


    const filterToggle = layoutType === '1' ?
      createFragment({
        filterToggle: (
          <span
            id="filterControl"
            className="filter--collapse__control reverseControl"
            onClick={this.hideFilter.bind(this)}>Свернуть</span>
        )
      }) :
      createFragment({
        filterToggle: <span />
      });

    const btnSwitch = layoutType === '1' ? (
      <Button bsStyle="link"
              className='filter--mapBtn noLeftRightMargin'
              onClick={this.toggleView}
              data-type='map'>
            <span className='glyphicon glyphicon-th-list'
                  data-type='map' aria-hidden='true'/>
        <span data-type='map'>Показать списком</span>
      </Button>
    ) : (
      <Button bsStyle="link"
              className='filter--mapBtn'
              onClick={this.toggleView}
              data-type='search'>
            <span className='glyphicon glyphicon-map-marker'
                  data-type='search' aria-hidden='true'/>
        <span data-type='search'>Показать на карте</span>
      </Button>
    );

    return (
      <div className='fullHeight'>
        <div className='fullHeight' style={{paddingTop: '2.2rem'}}>
          <div className='filter--title clearfix'>
            {(blockHeader === '1' ?
                btnSwitch :
                <h3 className="pull-left">Расширенный поиск</h3>
            )}
            {filterToggle}
          </div>
          {(layoutType === '1' ?
            (<GeminiScrollbar style={{height: `${blockHeight}px`}}>
              <div className='filter--scroll__wrap' >
                {filterBlocks}
              </div>
            </GeminiScrollbar>) :
            (<div className='filter--scroll__wrap' >
              {filterBlocks}
            </div>)
          )}
        </div>
      </div>
    );
  }
}

export default SearchFilter;
