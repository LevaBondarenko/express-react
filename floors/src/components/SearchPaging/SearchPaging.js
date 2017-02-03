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
import Col from 'react-bootstrap/lib/Col';
import SearchPagingMenu from '../SearchPaging/SearchPagingMenu';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import ReactPaginate from 'react-paginate';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import {periodCheck, priceFormatter,toCamel,
  periodSet} from '../../utils/Helpers';
import {getSearchResult} from '../../actions/SearchActions';
import mss from '../../stores/ModularSearcherStore';
import MSearcherSave from '../MSearcherSave/MSearcherSave';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
import Url from '../../utils/Url';
import ModularSearcherActions from '../../actions/ModularSearcherActions';

/*eslint camelcase: [2, {properties: "never"}]*/

class SearchPaging extends Component {

  static propTypes = {
    countAll: PropTypes.number,
    countMonth: PropTypes.number,
    countWeek: PropTypes.number,
    countDay: PropTypes.number,
    typesAll: PropTypes.string,
    byLand: PropTypes.number,
    byHouse: PropTypes.number,
    byGarden: PropTypes.number,
    byCottage: PropTypes.number,
    realtyType: PropTypes.string,
    isLoading: PropTypes.bool,
    noPaging: PropTypes.bool,
    subscription: PropTypes.string,
    hideHeader: PropTypes.string,
    bottom: PropTypes.bool,
    layoutHeader: PropTypes.string,
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
      },
      sortingFlats: {
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
      },
      sortingNhFlats: {
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
      isLoading: props.isLoading,
      countAll: props.countAll,
      countMonth: props.countMonth,
      countWeek: props.countWeek,
      countDay: props.countDay,
    };
  }

  componentDidMount() {
    const urlPage = parseInt(Url.parseQuery()['currentPage']);

    if (urlPage) {
      this.setState(() => ({
        currentPage: urlPage - 1
      }));
    }
  }

  componentWillReceiveProps() {
    this.setState(() => ({
      isLoading: true
    }));
    setTimeout(() => this.setState(() => ({
      isLoading: false
    })), 500);
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
      data = mss.get('order');
    }

    ModularSearcherActions.set(null, {
      offset: 0,
      order: data
    });
    Url.updateSearchParam('order', data);
    getSearchResult(realtyType,
      mss.get('perPage'),
      mss.get('offset'),
      mss.get(),{}
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

    ModularSearcherActions.set(null, {
      date_create_min: periodDate,
      periodTitle: period[ref]
    });

    Url.updateSearchParam(
      'date_create_min', periodDate ? periodDate : undefined
    );

    ModularSearcherActions.getCount();
    getSearchResult(realtyType,
      mss.get('perPage'),
      mss.get('offset'),
      mss.get(),{}
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

  get pagingHeader() {
    const {bottom, layoutHeader} = this.props;

    const pagingHeader = !bottom ?
      createFragment({
        pagingHeader: (<Col xs={12} style={{marginTop: '2.4rem'}}>
            <h1 className='result--control__title pull-left'>
              {layoutHeader || 'Результаты поиска'}
            </h1>
            {this.getSubscription()}
          </Col>)
      }) :
      createFragment({
        pagingHeader: <Col xs={12}/>
      });

    return pagingHeader;
  }

  render() {
    const {state, props} = this,
      sortingProp = toCamel(`sorting_${props.realtyType}`),
      sortingList = this.state.hasOwnProperty(sortingProp) ?
        this.state[sortingProp] :
        this.state.sortingDefaults,
      onSelectItem = this.onSelectItem.bind(this);
    let sortingItems = mapValues(sortingList, (item, key) => {
      const direction = key.indexOf('asc') >= 0 ? 'asc' : 'desc';

      if(props.showDeviation === 0 && key.indexOf('deviation') !== -1) {
        return;
      }
      return (
        <MenuItem eventKey={key}
          onSelect={onSelectItem}
          rel='nofollow'
          data-target={direction}>
          {item}
        </MenuItem>
      );
    });

    let titleKey = mss.get();
    const period = periodCheck(titleKey.date_create_min);

    titleKey = titleKey.order || 'default';
    titleKey = titleKey.replace(' ', '');

    const btnTitle = state.sortingDefaults[titleKey] || 'По умолчанию';

    const subContClass = 'etagiPaging--pages etagiPaging--pagination clearfix';


    sortingItems = createFragment(sortingItems);

    return (
       <div className='result--control clearfix'>
         {props.hideHeader === '1' ? null : this.pagingHeader}
          {(!props.bottom && !props.noPaging && !props.hideBtnType ||
            props.bottom ?
            <Col xs={props.bottom ? 7 : 12}>
              {(props.pageNum > 1 ?
                (<div className='etagiPaging clearfix'>
                  <ReactPaginate
                     previousLabel={<Glyphicon glyph="menu-left" />}
                     nextLabel={<Glyphicon glyph="menu-right" />}
                     pageNum={props.pageNum}
                     marginPagesDisplayed={2}
                     pageRangeDisplayed={2}
                     forceSelected={state.currentPage}
                     clickCallback={props.handlePageClick}
                     containerClassName={subContClass}
                     activeClass={'active'} />
                 </div>) : false)}
            </Col> : null)}
          {(!props.bottom &&
            !props.hideBtnType ?
            <SearchPagingMenu>
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
            </SearchPagingMenu> :
            (!props.bottom &&
            !props.noPaging && props.hideBtnType ?
              <Col xs={7}>
                {(props.pageNum > 1 ?
                  (<div className='etagiPaging clearfix'>
                    <ReactPaginate
                      previousLabel={<Glyphicon glyph="menu-left" />}
                      nextLabel={<Glyphicon glyph="menu-right" />}
                      pageNum={props.pageNum}
                      marginPagesDisplayed={2}
                      pageRangeDisplayed={2}
                      forceSelected={props.currentPage}
                      clickCallback={props.handlePageClick}
                      containerClassName={subContClass}
                      activeClass={'active'} />
                  </div>) : false)}
              </Col> : null))}
          {(!props.bottom ?
            <Col xs={5} className='clearfix text-right'>
              <div className='text-right result--control__label'>
                Сортировать:
              </div>
              <div className='noPadding sortList'>
                <DropdownButton id='DropdownButton-paging'
                  className='btn-group--etagi' title={btnTitle}>
                  {sortingItems}
                </DropdownButton>
              </div>
            </Col> : null)}
        </div>
    );
  }
}

export default SearchPaging;
