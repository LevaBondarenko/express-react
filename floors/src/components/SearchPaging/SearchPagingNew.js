/**
 * Searchpaging component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {mapValues} from 'lodash';
import createFragment from 'react-addons-create-fragment';
/**
 * Bootstrap 3 elements
 */
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import Button from 'react-bootstrap/lib/Button';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import {periodCheck, priceFormatter,toCamel,
  periodSet, capitalizeString} from 'etagi-helpers';
import ModularSearcherActions from '../../actions/ModularSearcherActions';
import {getSearchResult} from '../../actions/SearchActions';
import mss from '../../stores/ModularSearcherStore';
import MSearcherSave from '../MSearcherSave/MSearcherSave';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
import Pager from './Pager';
import Url from '../../utils/Url';
import ga from '../../utils/ga';

/*eslint camelcase: [2, {properties: "never"}]*/

class SearchPagingNew extends Component {

  static propTypes = {
    countAll: PropTypes.number,
    countMonth: PropTypes.number,
    countWeek: PropTypes.number,
    countDay: PropTypes.number,
    typesAll: PropTypes.string,
    realtyType: PropTypes.string,
    isLoading: PropTypes.bool,
    noPaging: PropTypes.bool,
    subscription: PropTypes.string,
    hideHeader: PropTypes.string,
    bottom: PropTypes.bool,
    layoutHeader: PropTypes.string,
    showDeviation: PropTypes.number,
    handlePageClick: PropTypes.func,
    currentPage: PropTypes.number,
    pageNum: PropTypes.number,
    hideBtnType: PropTypes.number,
    searchModel: PropTypes.object
  };

  static defaultProps = {
    hideBtnType: 0
  };

  constructor(props) {
    super(props);
    this.state = {
      sortingDefaults: {
        default: 'По умолчанию',
        priceasc: 'По цене, сначала дешевые',
        pricedesc: 'По цене, сначала дорогие',
        price_m2asc: 'По цене за кв.м., сначала дешевые',
        price_m2desc: 'По цене за кв.м., сначала дорогие',
        deviationasc: 'Рыночная стоимость, сначала дешевые',
        deviationdesc: 'Рыночная стоимость, сначала дорогие',
        squareasc: 'По площади, сначала малые',
        squaredesc: 'По площади, сначала большие',
        date_createasc: 'По дате добавления, сначала старые',
        date_createdesc: 'По дате добавления, сначала новые',
        area_landasc: 'По площади участка, сначала малые',
        area_landdesc: 'По площади участка, сначала большие',
        area_houseasc: 'По площади дома, сначала малые',
        area_housedesc: 'По площади дома, сначала большие',
        ratingdesc: 'По рейтингу, сначала высокий',
        'ratingdesc nulls last': 'По рейтингу, сначала высокий', // костыль. см. строку 291
      },
      sortingFlats: {
        default: 'По умолчанию',
        ratingdesc: 'По рейтингу, сначала высокий',
        priceasc: 'По цене, сначала дешевые',
        pricedesc: 'По цене, сначала дорогие',
        price_m2asc: 'По цене за кв.м., сначала дешевые',
        price_m2desc: 'По цене за кв.м., сначала дорогие',
        deviationasc: 'Рыночная стоимость, сначала дешевые',
        deviationdesc: 'Рыночная стоимость, сначала дорогие',
        squareasc: 'По площади, сначала малые',
        squaredesc: 'По площади, сначала большие',
        date_createasc: 'По дате добавления, сначала старые',
        date_createdesc: 'По дате добавления, сначала новые',
      },
      sortingNhFlats: {
        default: 'По умолчанию',
        ratingdesc: 'По рейтингу, сначала высокий',
        priceasc: 'По цене, сначала дешевые',
        pricedesc: 'По цене, сначала дорогие',
        price_m2asc: 'По цене за кв.м., сначала дешевые',
        price_m2desc: 'По цене за кв.м., сначала дорогие',
        squareasc: 'По площади, сначала малые',
        squaredesc: 'По площади, сначала большие',
        date_createasc: 'По дате добавления, сначала старые',
        date_createdesc: 'По дате добавления, сначала новые'
      },
      sortingRent: {
        default: 'По умолчанию',
        priceasc: 'По цене, сначала дешевые',
        pricedesc: 'По цене, сначала дорогие',
        squareasc: 'По площади, сначала малые',
        squaredesc: 'По площади, сначала большие',
        date_createasc: 'По дате добавления, сначала старые',
        date_createdesc: 'По дате добавления, сначала новые'
      },
      sortingCottages: {
        default: 'По умолчанию',
        priceasc: 'По цене, сначала дешевые',
        pricedesc: 'По цене, сначала дорогие',
        area_landasc: 'По площади участка, сначала малые',
        area_landdesc: 'По площади участка, сначала большие',
        area_houseasc: 'По площади дома, сначала малые',
        area_housedesc: 'По площади дома, сначала большие',
        date_createasc: 'По дате добавления, сначала старые',
        date_createdesc: 'По дате добавления, сначала новые'
      },
      sortingOffices: {
        default: 'По умолчанию',
        priceasc: 'По цене, сначала дешевые',
        pricedesc: 'По цене, сначала дорогие',
        price_m2asc: 'По цене за кв.м., сначала дешевые',
        price_m2desc: 'По цене за кв.м., сначала дорогие',
        squareasc: 'По площади, сначала малые',
        squaredesc: 'По площади, сначала большие',
        date_createasc: 'По дате добавления, сначала старые',
        date_createdesc: 'По дате добавления, сначала новые'
      },
      periods: {
        all: 'За все время',
        month: 'За месяц',
        week: 'За неделю',
        day: 'За день'
      },
      isLoading: props.isLoading,
      countAll: props.countAll,
      countMonth: props.countMonth,
      countWeek: props.countWeek,
      countDay: props.countDay,
      typesAll: props.typesAll,
    };
  }

  componentWillReceiveProps() {
    this.setState(() => ({
      isLoading: true
    }));
    setTimeout(() => this.setState(() => ({
      isLoading: false
    })), 500);
  }

  componentDidMount() {
    this.setState(() => ({
      defaultOrder: mss.get()['order']
    }));
  }

  onSelectItem = (eventKey, event) => {
    event.preventDefault();
    const {target} = event.target.localName !== 'span' ? event.target.dataset :
      event.target.parentElement.dataset;
    const {realtyType} = this.props;
    let data;

    eventKey = eventKey.replace('asc', '');
    eventKey = eventKey.replace('desc', '');
    eventKey = eventKey.replace('default', '');

    if(eventKey !== '') {
      data = `${eventKey} ${target.toLowerCase()}`;
    } else {
      data = this.state.defaultOrder;
    }

    // for google analitics
    const valsGa = data.split(' ');
    const txtGa = valsGa[1] === 'asc' ? 'low' : 'high';

    ga('combobox', `site_search_sorting_${valsGa[0]}_${txtGa}`);

    ModularSearcherActions.set(null, {
      offset: 0,
      order: data
    });
    Url.updateSearchParam('order', eventKey !== '' ? data : undefined);
    Url.updateSearchParam('currentPage', undefined);
    getSearchResult(
      realtyType,
      mss.get('perPage'),
      0,
      mss.get(),
      {}
    );
  }

  handleDateFilter = (eventKey, event) => {
    const {ref} = event.currentTarget.dataset;
    const periodDate = periodSet(ref);
    const {realtyType} = this.props;

    // вычисляем отступ для получения данных конкретной страницы
    // если отступ больше, чем общее кол-во объектов, то переходим на 1-ю
    // страницу
    const period = {
      all: this.props.countAll,
      month: this.props.countMonth,
      week: this.props.countWeek,
      day: this.props.countDay
    };

    ga('combobox', `site_search_display_${ref}`);

    ModularSearcherActions.set(null, {
      date_create_min: periodDate,
      periodTitle: period[ref],
      offset: 0
    });

    Url.updateSearchParam(
      'date_create_min', periodDate ? periodDate : undefined
    );
    Url.updateSearchParam('currentPage', undefined);

    ModularSearcherActions.getCount();
    getSearchResult(
      realtyType,
      mss.get('perPage'),
      0,
      mss.get(),
      {}
    );

    event.preventDefault();
  }

  getSubscription = () => {
    const {subscription} = this.props;
    const btnTitle = (
      <span>
        <i className='subscription--btn__letter pull-left' />
        <span className='subscription--btn__desc pull-left'>
          Следите за обновлениями и скидками по вашему запросу
        </span>
        <Glyphicon glyph="menu-down" />
      </span>
    );


    const subscriptionBtn = subscription === '1' && canUseDOM ?
      createFragment({
        subscriptionBtn: (
          <div className='subscription pull-right'>
            <MSearcherSave buttonText={btnTitle} />
          </div>
        )
      }) :
      createFragment({
        subscriptionBtn: false
      });

    return subscriptionBtn;
  }

  get sortingBlock() {
    const {showDeviation, realtyType, bottom} = this.props;
    const sortingProp = toCamel(`sorting_${realtyType}`);
    const sortingList = this.state.hasOwnProperty(sortingProp) ?
      this.state[sortingProp] : this.state.sortingDefaults;

    const sortingItems = mapValues(sortingList, (item, key) => {
      const direction = key.indexOf('asc') >= 0 ? 'asc' : 'desc';

      if(showDeviation === 0 && key.indexOf('deviation') !== -1) {
        return;
      }
      return (
        <MenuItem eventKey={key}
          onSelect={this.onSelectItem}
          rel='nofollow'
          data-target={key !== 'ratingdesc' ? //костыль. Доработать бэкенд
            direction : `${direction} nulls last`}>
          {item}
          {key.indexOf('rating') !== -1 ? (
            <span className="specialChoice">NEW!</span>
          ) : null}
        </MenuItem>
      );
    });

    return !bottom ?
     (<div className='clearfix'>
       <div className='searchHeader_label'>
         Сортировать:
       </div>
       <div className='noPadding'>
         <DropdownButton id='DropdownButton-paging'
                         className='btn-group--etagi'
                         title={this.sortingTitle}>
           {createFragment(sortingItems)}
         </DropdownButton>
       </div>
     </div>) : null;
  }

  get sortingTitle() {
    const {sortingDefaults} = this.state;
    let titleKey = mss.get();

    titleKey = titleKey.order || 'default';
    titleKey = titleKey.replace(' ', '');

    return sortingDefaults[titleKey] || 'По умолчанию';
  }

  get bigPageBtn() {
    const {bottom, currentPage, pageNum} = this.props;

    return bottom && pageNum > 1 ?
     (<div className='clearfix'>
       <div className="bigBtnsWrapper">
         {currentPage > 0 ? (
           <Button className='searchResult-nextBtn'
                   onClick={() => {
                     ga('button', 'site_search_pagination_down_previous_page');
                     this.props.handlePageClick({
                       selected: currentPage - 1
                     });
                   }}>
             <i className="fa fa-chevron-left" aria-hidden="true" />
             Предыдущая страница
           </Button>
         ) : null}
         {pageNum > currentPage + 1 ? (
           <Button className='searchResult-nextBtn'
                   onClick={() => {
                     ga('button', 'site_search_pagination_down_next_page');
                     this.props.handlePageClick({
                       selected: currentPage + 1
                     });
                   }}>
             Следующая страница
             <i className="fa fa-chevron-right" aria-hidden="true" />
           </Button>
         ) : null}
       </div>
     </div>) : null;
  }

  render() {
    const {state, props} = this;
    const {periods} = state;
    const period = periodCheck(
      mss.get().date_create_min
    );
    const subContClass = 'etagiPaging--pages etagiPaging--pagination';
    const propStr = `count${capitalizeString(period)}`;
    const periodTitle = `${periods[period]} ${(props[propStr] >= 0 ?
      `(${priceFormatter(props[`count${capitalizeString(period)}`])})` : '')}`;

    return (
       <div className='result--control clearfix'>
         {this.bigPageBtn}
           <div className="searchHeaderWrapper">
             {this.sortingBlock}
             {(!props.bottom ?
               <div className='clearfix'>
                 <div className='searchHeader_label'>
                   Показать:
                 </div>
                 <div className='noPadding'>
                   <DropdownButton id='DropdownButton-period'
                                   className='btn-group--etagi'
                                   title={periodTitle}>
                     <MenuItem className={(period === 'all' ?
                 'dateFilter activeItem' : 'dateFilter')}
                               onSelect={this.handleDateFilter}
                               rel='nofollow'
                               data-ref='all'
                               data-target='period'>
                       За все время {(props.countAll >= 0 ?
                       `(${priceFormatter(props.countAll)})` : null)}
                     </MenuItem>
                     <MenuItem className={(period === 'month' ?
                'dateFilter activeItem' : 'dateFilter')}
                               disabled={props.countMonth > 0 ? false : true}
                               onSelect={this.handleDateFilter}
                               rel='nofollow'
                               data-ref='month'
                               data-targe='period'>
                       За месяц {(props.countMonth >= 0 ?
                       `(${priceFormatter(props.countMonth)})` : null)}
                     </MenuItem>
                     <MenuItem className={(period === 'week' ?
                'dateFilter activeItem' : 'dateFilter')}
                               disabled={props.countWeek > 0 ? false : true}
                               onSelect={this.handleDateFilter}
                               rel='nofollow'
                               data-ref='week'
                               data-target='period'>
                       За неделю {(props.countWeek >= 0 ?
                       `(${priceFormatter(props.countWeek)})` : null)}
                     </MenuItem>
                     <MenuItem className={(period === 'day' ?
                'dateFilter activeItem' : 'dateFilter')}
                               disabled={props.countDay > 0 ? false : true}
                               onSelect={this.handleDateFilter}
                               rel='nofollow'
                               data-ref='day'
                               data-target='period'>
                       За день {(props.countDay >= 0 ?
                       `(${priceFormatter(props.countDay)})` : null)}
                     </MenuItem>
                   </DropdownButton>
                 </div>
               </div> : null)}
             {(!props.noPaging ?
               <div className="clearfix pagerWrapper">
                 {(props.pageNum > 1 ?
                   (<Pager
                       previousLabel={<Glyphicon glyph="menu-left" />}
                       nextLabel={<Glyphicon glyph="menu-right" />}
                       pageNum={props.pageNum}
                       forceSelected={props.currentPage}
                       clickCallback={props.handlePageClick}
                       containerClassName={subContClass}
                       bottom={props.bottom}
                       activeClass={'active'} />) : false)}
               </div> : null)}
           </div>
        </div>
    );
  }
}

export default SearchPagingNew;
