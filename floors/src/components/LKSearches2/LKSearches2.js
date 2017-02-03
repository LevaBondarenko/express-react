/**
 * LKSearches2 widget class
 *
 * @ver 0.0.0
 * @author npm generator
 */

import React, {Component, PropTypes} from 'react';
import createFragment from 'react-addons-create-fragment';
import classNames from 'classnames';
import {size, clone, assign, difference} from 'lodash';
import s from './LKSearches2.scss';
import ContextType from '../../utils/contextType';
import {getObjects, getCatalogs} from '../../utils/requestHelpers';
import LKSearchItem from './LKSearchItem';
import LKSearchSettings from './LKSearchSettings';
/**
 * React/Redux entities
 */
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {updateInUiState} from '../../actionCreators/UiActions';
import {
  updateInUserDataState, userDataUpdate, userDataDelete
} from '../../actionCreators/UserDataActions';
import {updateInObjectsState} from '../../actionCreators/ObjectsActions';

class LKSearches2 extends Component {

  static propTypes = {
    context: PropTypes.shape(ContextType).isRequired,
    actions: PropTypes.object,
    currency: PropTypes.object,
    searches: PropTypes.array,
    lkShow: PropTypes.string,
    lkModuleParams: PropTypes.array,
    resultParams: PropTypes.array
  };

  static defaultProps = {};

  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    this.state = {
      filters: {},
      colls: {},
      counts: {},
      objects: {},
      startDate: this.startDate(props.lkModuleParams[0]),
      showSettings: null
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;

    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  componentWillReceiveProps(nextProps) {
    const {searches: newSearches, lkModuleParams: {0: newSelected}} = nextProps;
    const {searches, lkModuleParams: {0: selected}} = this.props;
    const searchesChanged =
      size(newSearches) !== size(searches) ||
      size(difference(
        searches.map(item => item.id),
        newSearches.map(item => item.id)
      )) > 0;
    const selectedChanged = newSelected !== selected;

    if(searchesChanged) {
      this.getColls(newSearches);
    }
    if(selectedChanged) {
      this.setState(() => ({
        startDate: this.startDate(newSelected)
      }), () => {
        this.getAll(newSearches);
      });
    } else if(searchesChanged) {
      this.getAll(newSearches);
    }
  }

  getAll = searches => {
    searches.forEach(item => {
      this.getCounts(item);
      this.getObjects(item);
    });
  }

  getColls = searches => {
    const models = searches.map(item => item.filter);

    getCatalogs(models).then(catalogs => {
      this.setState(() => ({
        colls: assign(this.state.colls, catalogs)
      }));
    });
  }

  getCounts = search => {
    const {class: objClass, filter, id: searchId} = search;
    const model = clone(filter);
    const {startDate} = this.state;

    model.class = objClass;
    getObjects(model, ['price']).then(response => {
      const {
        count, price_min, price_max, price_m2_avg //eslint-disable-line camelcase
      } = response.aggregates[0];
      const {counts} = this.state;

      if(!counts[searchId]) {
        counts[searchId] = {};
      }
      counts[searchId].all = count ? count : 0;
      counts[searchId].priceMin = price_min ? price_min : 0; //eslint-disable-line camelcase
      counts[searchId].priceMax = price_max ? price_max : 0; //eslint-disable-line camelcase
      counts[searchId].priceM2Avg = price_m2_avg ? price_m2_avg | 0 : 0; //eslint-disable-line camelcase

      this.setState(() => ({
        counts: counts
      }));
    });
    model.date_create_min = startDate; //eslint-disable-line camelcase
    getObjects(model, ['price']).then(response => {
      const {count} = response.aggregates[0];
      const {counts} = this.state;

      if(!counts[searchId]) {
        counts[searchId] = {};
      }
      counts[searchId].created = count ? count : 0;
      this.setState(() => ({
        counts: counts
      }));
    });
    model.date_create_min = null; //eslint-disable-line camelcase
    model.date_update_min = startDate; //eslint-disable-line camelcase
    getObjects(model, ['price']).then(response => {
      const {count} = response.aggregates[0];
      const {counts} = this.state;

      if(!counts[searchId]) {
        counts[searchId] = {};
      }
      counts[searchId].updated = count ? count : 0;
      this.setState(() => ({
        counts: counts
      }));
    });
  }

  getObjects = search => {
    const {class: objClass, filter, id: searchId} = search;
    const {filters, startDate} = this.state;
    const filterMode = filters[searchId] || 'all';
    const model = clone(filter);

    model.class = objClass;
    model.limit = 2;
    model.order = objClass !== 'flats' ?
      'date_update desc' : 'date_rise desc';
    if(filterMode === 'created') {
      model.date_create_min = startDate; //eslint-disable-line camelcase
      model.order = 'date_create desc';
    }
    if(filterMode === 'updated') {
      model.date_update_min = startDate; //eslint-disable-line camelcase
      model.order = 'date_update desc';
    }
    getObjects(model).then(response => {
      const {objects} = response;
      const {objects: existObjs} = this.state;

      existObjs[searchId] = objects;

      this.setState(() => ({
        objects: existObjs
      }));
    });
  }

  periodChange = e => {
    const {value} = e.target;

    window.location.hash = `#/searches/${value}/`;
  }

  getTarget = ancestor => {
    while((!ancestor.dataset || !ancestor.dataset.searchid) &&
      (ancestor = ancestor.parentNode)) {};
    if(ancestor && ancestor.dataset && ancestor.dataset.searchid) {
      return ancestor;
    } else {
      return false;
    }
  }

  searchAction = e => {
    const target = this.getTarget(e.target);
    const {action, searchid} = target.dataset || {};

    switch(action) {
    case 'changeFilter':
      const {filterid} = target.dataset || {};
      const filters = clone(this.state.filters);
      const {searches} = this.props;
      const search = searches.find(item => {
        return item.id === parseInt(searchid);
      });

      filters[searchid] = filterid;
      this.setState(() => ({
        filters: filters
      }), () => {
        this.getObjects(search);
      });
      break;
    case 'toggleSettingsShow':
      this.setState(() => ({
        showSettings: this.state.showSettings === searchid ? null : searchid
      }));
      break;
    case 'changeSearchSettings':
      const {field} = target.dataset || {};
      const {value} = target;

      this.props.actions.userDataUpdate(
        {[field]: value === 'true' ? 0 : 1},
        `searches/${searchid}`
      );
      break;
    case 'deleteSearch':
      this.setState(() => ({showSettings: null}));
      this.props.actions.userDataDelete(`searches/${searchid}`);
      break;
    default:
      //do nothing
    }
  }

  get periodsSelector() {
    const {lkModuleParams: {0: selected}} = this.props;
    const periods = [
      {key: 1, value: 'За день'},
      {key: 7, value: 'За неделю'},
      {key: 30, value: 'За месяц'}
    ];
    const list = createFragment({periodsList: periods.map(item => {
      return (
        <option
          key={`period-${item.key}`}
          value={item.key}>
          {item.value}
        </option>
      );
    })});

    return (
      <select
        className={s.periodSelector}
        onChange={this.periodChange}
        value={selected || 7}>
        {list}
      </select>
    );
  }

  get filterPeriodTitle() {
    const {lkModuleParams: {0: selected}} = this.props;

    return {1: 'день', 7: 'неделю', 30: 'месяц'}[selected || 7];
  }

  startDate = period => {
    return (new Date((new Date()).getTime() - 86400000 * (period || 7)))
      .toISOString().split('T')[0];
  }

  get currency() {
    const {currency} = this.props;

    return {
      course: currency.nominal / currency.value,
      unit: currency.symbol
    };
  }

  render() {
    const {lkShow, searches, context, resultParams} = this.props;
    const {
      filters, colls, counts, objects, showSettings, startDate
    } = this.state;
    let searchData = null;
    const searchesList = size(searches) ?
      createFragment({searchesList: searches.map(item => {
        if(parseInt(showSettings) === item.id) {
          searchData = item;
        }
        return (
          <LKSearchItem
            context={context}
            resultParams={resultParams}
            key={`search-${item.id}`}
            searchData={{
              counts: counts[item.id] || {},
              objects: objects[item.id] || [],
              filtered: filters[item.id] || 'all',
              ...item
            }}
            searchAction={this.searchAction}
            filterPeriodTitle={this.filterPeriodTitle}
            startDate={startDate}/>
        );
      })}) : createFragment({searchesList: (
        <div className={s.emptySearchesList}>
          У вас нет подписок
        </div>
      )});

    return lkShow === 'searches' ? (
      <div className={s.root}>
        <div className={classNames(s.title, 'clearfix')}>
          <div className='col-xs-6'>Подписки</div>
          <div className='col-xs-6'>{this.periodsSelector}</div>
        </div>
        <div className={s.searchesList}>
          {searchesList}
        </div>
        {showSettings ? (
          <LKSearchSettings
            searchData={searchData}
            colls={colls}
            currency={this.currency}
            searchAction={this.searchAction}/>
        ) : null}
      </div>
    ) : null;
  }
}

export default connect(
  state => {
    return {
      lkShow: state.ui.get('lkShow'),
      lkModuleParams: state.ui.get('lkModuleParams') ?
        state.ui.get('lkModuleParams').toJS() : [],
      searches: state.userData.get('searches') ?
        state.userData.get('searches').toJS() : [],
      currency: state.ui.get('currency').toJS().current
    };
  },
  dispatch => {
    return {
      actions: bindActionCreators({
        updateInUiState,
        updateInUserDataState,
        updateInObjectsState,
        userDataUpdate,
        userDataDelete
      }, dispatch)
    };
  }
)(LKSearches2);
