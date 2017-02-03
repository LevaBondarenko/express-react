/**
 * AuthPanel Mobile Login component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import createFragment from 'react-addons-create-fragment';
import classNames from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import ContextType from '../../utils/contextType';
import {map, size, clone} from 'lodash';
import {generateSearchUrl, declOfNum} from '../../utils/Helpers';
import s from './LKSearches2.scss';
import MobileSearchResult from '../MobileSearchResult';

const LKSearchItem = (props) => {
  const {
    searchAction, searchData, resultParams, filterPeriodTitle, context,
    startDate
  } = props;
  const {
    id: searchId, name, objects, filtered, class: objClass, counts,
    filter: filterModel
  } = searchData;
  const filterItems = {
    all: 'Все',
    created: 'Новые',
    updated: 'Измененные'
  };
  const searchUrls = {
    flats: '/realty/search/',
    nh_flats: '/zastr/search/', // eslint-disable-line camelcase
    cottages: '/realty_out/search/',
    offices: '/commerce/search/',
    rent: '/realty_rent/search/'
  };
  const filter = createFragment({filter: map(filterItems, (item, key) => {
    return (
      <button
        key={`filter-${key}`}
        data-action='changeFilter'
        data-searchid={searchId}
        data-filterid={key}
        onClick={searchAction}
        className={classNames(
          s.filterButton, {[s.active]: key === filtered}
        )}>
        {item}
        {counts[key] ? (
          <span> ({counts[key]})</span>
        ) : null}
      </button>
    );
  })});
  const sampleObjects = size(objects) ? (
    <MobileSearchResult
      context={context}
      objects={objects}
      parameters={resultParams}/>
  ) : (
    <div className={s.emptyObjectsList}>
      Объектов не найдено
    </div>
  );
  const filteredCount = counts[filtered];
  const filteredCountDecl =
    declOfNum(filteredCount, ['предложение', 'предложения', 'предложений']);
  const filteredTitle = filterItems[filtered].toLowerCase();
  const model = clone(filterModel);

  if(filtered === 'created') {
    model.date_create_min = startDate; //eslint-disable-line camelcase
    model.order = 'date_create desc';
  }
  if(filtered === 'updated') {
    model.date_update_min = startDate; //eslint-disable-line camelcase
    model.order = 'date_update desc';
  }

  const searchLink = generateSearchUrl(
    model,
    `${searchUrls[objClass]}?`,
    true
  );

  return (
    <div className={s.searchItem}>
      <div className={s.itemTitle}>
        {name}
        <button
          className={s.settingsButton}
          data-action='toggleSettingsShow'
          data-searchid={searchId}
          onClick={searchAction}/>
      </div>
      <div className={s.filter}>
        {filter}
      </div>
      <div className={s.sampleObjects}>
        {sampleObjects}
      </div>
      <div className={s.searchFooter}>
        {filteredCount > 2 ? (
          <div>
            <span>
              Посмотреть {filteredTitle} предложения по этому
              запросу {filtered === 'all' ? '' : `за ${filterPeriodTitle}`}
            </span>
            <a href={searchLink} className='form-control'>
              Посмотреть {filteredCount} {filteredCountDecl}
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
};

LKSearchItem.propTypes = {
  context: PropTypes.shape(ContextType).isRequired,
  searchAction: PropTypes.func.isRequired,
  searchData: PropTypes.object,
  resultParams: PropTypes.array,
  filterPeriodTitle: PropTypes.string,
  startDate: PropTypes.string
};

export default withStyles(s)(LKSearchItem);
